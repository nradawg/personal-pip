import { and, count, desc, eq, gte } from "drizzle-orm";
import { getChatGPTUser } from "../../../chatgpt-auth";
import { getDb } from "../../../../db";
import { streamSessions } from "../../../../db/schema";
import { runtimeValue } from "../../../../lib/runtime";
import { syncLiveStatus } from "../../../../lib/twitch";

export async function GET() {
  const user = await getChatGPTUser();
  if (!user) return Response.json({ error: "Sign in required" }, { status: 401 });

  const configured = Boolean(runtimeValue("TWITCH_CLIENT_ID") && runtimeValue("TWITCH_CLIENT_SECRET") && runtimeValue("APP_URL"));
  if (!configured) return Response.json({ configured: false, connected: false, live: false, streamsThisWeek: 0, minutesThisWeek: 0, totalStreams: 0, recentStreams: [] });

  try {
    const status = await syncLiveStatus(user.userId);
    const now = new Date();
    const start = new Date(now);
    start.setUTCDate(now.getUTCDate() - ((now.getUTCDay() + 6) % 7));
    start.setUTCHours(0, 0, 0, 0);
    const db = getDb();
    const [weeklyTotal] = await db.select({ value: count() }).from(streamSessions)
      .where(and(eq(streamSessions.userId, user.userId), gte(streamSessions.startedAt, start.toISOString())));
    const sessions = await db.select().from(streamSessions)
      .where(eq(streamSessions.userId, user.userId))
      .orderBy(desc(streamSessions.startedAt));
    const thisWeek = sessions.filter((session) => session.startedAt >= start.toISOString());
    return Response.json({
      configured: true,
      ...status,
      streamsThisWeek: weeklyTotal?.value ?? 0,
      minutesThisWeek: thisWeek.reduce((sum, session) => sum + (session.durationMinutes ?? 0), 0),
      totalStreams: sessions.length,
      recentStreams: sessions.slice(0, 5).map((session) => ({
        startedAt: session.startedAt,
        endedAt: session.endedAt,
        durationMinutes: session.durationMinutes,
      })),
    });
  } catch {
    return Response.json({ configured: true, connected: false, live: false, streamsThisWeek: 0, minutesThisWeek: 0, totalStreams: 0, recentStreams: [], error: "Twitch needs to be reconnected" });
  }
}
