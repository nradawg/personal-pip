import { cookies } from "next/headers";
import { eq } from "drizzle-orm";
import { getChatGPTUser } from "../../../chatgpt-auth";
import { getDb } from "../../../../db";
import { learnerProfiles, twitchAccounts } from "../../../../db/schema";
import { encrypt, verify } from "../../../../lib/crypto";
import { requireRuntimeValue } from "../../../../lib/runtime";

export async function GET(request: Request) {
  const user = await getChatGPTUser();
  if (!user) return Response.json({ error: "ChatGPT sign in required" }, { status: 401 });

  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const storedState = (await cookies()).get("pip_twitch_oauth_state")?.value;
  const verified = await verify(state ?? undefined);
  (await cookies()).delete("pip_twitch_oauth_state");

  if (!code || !state || state !== storedState || !verified || !verified.startsWith(user.userId + ":")) {
    return Response.json({ error: "Invalid Twitch connection state" }, { status: 400 });
  }

  const clientId = requireRuntimeValue("TWITCH_CLIENT_ID");
  const appUrl = requireRuntimeValue("APP_URL");
  const response = await fetch("https://id.twitch.tv/oauth2/token", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: requireRuntimeValue("TWITCH_CLIENT_SECRET"),
      code,
      grant_type: "authorization_code",
      redirect_uri: appUrl + "/api/twitch/callback",
    }),
  });
  if (!response.ok) return Response.redirect(appUrl + "/?twitch=failed");

  const token = await response.json() as {
    access_token: string;
    refresh_token: string;
    expires_in: number;
  };
  const userResponse = await fetch("https://api.twitch.tv/helix/users", {
    headers: { Authorization: "Bearer " + token.access_token, "Client-Id": clientId },
  });
  if (!userResponse.ok) return Response.redirect(appUrl + "/?twitch=failed");
  const twitchUser = (await userResponse.json() as {
    data: Array<{ id: string; login: string; display_name: string; profile_image_url: string }>;
  }).data[0];

  const db = getDb();
  const now = new Date().toISOString();
  await db.insert(learnerProfiles).values({
    userId: user.userId,
    email: user.email,
    createdAt: now,
    updatedAt: now,
  }).onConflictDoUpdate({
    target: learnerProfiles.userId,
    set: { email: user.email, updatedAt: now },
  });
  await db.insert(twitchAccounts).values({
    userId: user.userId,
    twitchUserId: twitchUser.id,
    login: twitchUser.login,
    displayName: twitchUser.display_name,
    profileImageUrl: twitchUser.profile_image_url,
    accessToken: await encrypt(token.access_token),
    refreshToken: await encrypt(token.refresh_token),
    tokenExpiresAt: new Date(Date.now() + token.expires_in * 1000).toISOString(),
    connectedAt: now,
    updatedAt: now,
  }).onConflictDoUpdate({
    target: twitchAccounts.userId,
    set: {
      twitchUserId: twitchUser.id,
      login: twitchUser.login,
      displayName: twitchUser.display_name,
      profileImageUrl: twitchUser.profile_image_url,
      accessToken: await encrypt(token.access_token),
      refreshToken: await encrypt(token.refresh_token),
      tokenExpiresAt: new Date(Date.now() + token.expires_in * 1000).toISOString(),
      updatedAt: now,
    },
  });

  await db.update(twitchAccounts).set({ updatedAt: now }).where(eq(twitchAccounts.userId, user.userId));
  return Response.redirect(appUrl + "/?twitch=connected");
}
