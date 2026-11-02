import { and, count, desc, eq, isNull } from "drizzle-orm";
import { getDb } from "../db";
import { streamSessions, twitchAccounts } from "../db/schema";
import { decrypt, encrypt } from "./crypto";
import { requireRuntimeValue } from "./runtime";

const clientId = () => requireRuntimeValue("TWITCH_CLIENT_ID");
const clientSecret = () => requireRuntimeValue("TWITCH_CLIENT_SECRET");

async function validateUserToken(token: string, expectedTwitchUserId: string) {
  const response = await fetch("https://id.twitch.tv/oauth2/validate", {
    headers: { Authorization: "OAuth " + token },
  });
  if (!response.ok) throw new Error("Twitch authorization expired");
  const validation = await response.json() as { client_id?: string; user_id?: string };
  if (validation.client_id !== clientId() || validation.user_id !== expectedTwitchUserId) {
    throw new Error("Twitch authorization does not match this connection");
  }
}

function twitchDurationMinutes(value: string) {
  const match = value.match(/^(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s)?$/);
  if (!match) return 0;
  const seconds = Number(match[1] ?? 0) * 3600 + Number(match[2] ?? 0) * 60 + Number(match[3] ?? 0);
  return Math.max(1, Math.round(seconds / 60));
}

async function importRecentBroadcasts(userId: string, twitchUserId: string, appToken: string) {
  const db = getDb();
  const [existing] = await db.select({ value: count() }).from(streamSessions).where(eq(streamSessions.userId, userId));
  if ((existing?.value ?? 0) > 0) return;

  const response = await fetch("https://api.twitch.tv/helix/videos?user_id=" + encodeURIComponent(twitchUserId) + "&type=archive&first=20", {
    headers: { Authorization: "Bearer " + appToken, "Client-Id": clientId() },
  });
  if (!response.ok) return;

  const videos = (await response.json() as { data: Array<{ id: string; stream_id: string | null; created_at: string; duration: string }> }).data;
  const now = new Date().toISOString();
  for (const video of videos) {
    const durationMinutes = twitchDurationMinutes(video.duration);
    const streamId = video.stream_id || "video:" + video.id;
    const endedAt = new Date(new Date(video.created_at).getTime() + durationMinutes * 60000).toISOString();
    await db.insert(streamSessions).values({
      id: userId + ":" + streamId,
      userId,
      twitchStreamId: streamId,
      startedAt: video.created_at,
      endedAt,
      durationMinutes,
      createdAt: now,
      updatedAt: now,
    }).onConflictDoUpdate({
      target: streamSessions.twitchStreamId,
      set: { endedAt, durationMinutes, updatedAt: now },
    });
  }
}

export async function getAppToken() {
  const response = await fetch("https://id.twitch.tv/oauth2/token", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: clientId(),
      client_secret: clientSecret(),
      grant_type: "client_credentials",
    }),
  });
  if (!response.ok) throw new Error("Twitch app authorization failed");
  return (await response.json() as { access_token: string }).access_token;
}

export async function getUserAccessToken(userId: string) {
  const db = getDb();
  const [account] = await db.select().from(twitchAccounts).where(eq(twitchAccounts.userId, userId)).limit(1);
  if (!account) throw new Error("Twitch is not connected");
  if (new Date(account.tokenExpiresAt).getTime() > Date.now() + 60000) {
    const token = await decrypt(account.accessToken);
    await validateUserToken(token, account.twitchUserId);
    return token;
  }

  const response = await fetch("https://id.twitch.tv/oauth2/token", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: clientId(),
      client_secret: clientSecret(),
      grant_type: "refresh_token",
      refresh_token: await decrypt(account.refreshToken),
    }),
  });
  if (!response.ok) throw new Error("Twitch authorization expired");
  const token = await response.json() as { access_token: string; refresh_token: string; expires_in: number };
  await db.update(twitchAccounts).set({
    accessToken: await encrypt(token.access_token),
    refreshToken: await encrypt(token.refresh_token),
    tokenExpiresAt: new Date(Date.now() + token.expires_in * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
  }).where(eq(twitchAccounts.userId, userId));
  await validateUserToken(token.access_token, account.twitchUserId);
  return token.access_token;
}

export async function syncLiveStatus(userId: string) {
  const db = getDb();
  const [account] = await db.select().from(twitchAccounts).where(eq(twitchAccounts.userId, userId)).limit(1);
  if (!account) return { connected: false, live: false, account: null };

  const appToken = await getAppToken();
  await importRecentBroadcasts(userId, account.twitchUserId, appToken);
  const response = await fetch("https://api.twitch.tv/helix/streams?user_id=" + encodeURIComponent(account.twitchUserId), {
    headers: { Authorization: "Bearer " + appToken, "Client-Id": clientId() },
  });
  if (!response.ok) throw new Error("Twitch live status failed");
  const stream = (await response.json() as { data: Array<{ id: string; started_at: string }> }).data[0];
  const now = new Date().toISOString();
  const [openSession] = await db.select().from(streamSessions)
    .where(and(eq(streamSessions.userId, userId), isNull(streamSessions.endedAt)))
    .orderBy(desc(streamSessions.startedAt)).limit(1);

  if (stream) {
    await db.insert(streamSessions).values({
      id: userId + ":" + stream.id,
      userId,
      twitchStreamId: stream.id,
      startedAt: stream.started_at,
      createdAt: now,
      updatedAt: now,
    }).onConflictDoNothing();
  } else if (openSession) {
    const duration = Math.max(1, Math.round((Date.now() - new Date(openSession.startedAt).getTime()) / 60000));
    await db.update(streamSessions).set({ endedAt: now, durationMinutes: duration, updatedAt: now }).where(eq(streamSessions.id, openSession.id));
  }

  return {
    connected: true,
    live: Boolean(stream),
    account: {
      login: account.login,
      displayName: account.displayName,
      profileImageUrl: account.profileImageUrl,
    },
  };
}

export async function createTwitchClip(userId: string) {
  const db = getDb();
  const [account] = await db.select().from(twitchAccounts).where(eq(twitchAccounts.userId, userId)).limit(1);
  if (!account) throw new Error("Twitch is not connected");
  const token = await getUserAccessToken(userId);
  const response = await fetch("https://api.twitch.tv/helix/clips?broadcaster_id=" + encodeURIComponent(account.twitchUserId), {
    method: "POST",
    headers: { Authorization: "Bearer " + token, "Client-Id": clientId() },
  });
  if (!response.ok) throw new Error("Twitch could not create a clip");
  const clip = (await response.json() as { data: Array<{ id: string; edit_url: string }> }).data[0];
  return { id: clip.id, url: "https://clips.twitch.tv/" + clip.id, editUrl: clip.edit_url };
}
