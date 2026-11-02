import { and, count, eq, gte } from "drizzle-orm";
import { getChatGPTUser } from "../chatgpt-auth";
import { lessons } from "../course";
import { getDb } from "../../db";
import { learnerProfiles, streamGoals, streamSessions, twitchAccounts } from "../../db/schema";
import { companion } from "../companion";

type RpcRequest = {
  jsonrpc?: string;
  id?: string | number | null;
  method?: string;
  params?: { name?: string; arguments?: Record<string, unknown> };
};

const tools = [
  {
    name: "get_personal_pip_progress",
    description: "Read the signed in creator's current lesson, XP, streak, goal, and Twitch connection state.",
    inputSchema: { type: "object", properties: {}, additionalProperties: false },
  },
  {
    name: "remember_creator_goal",
    description: `Save the creator's current streaming goal and personal reason so ${companion.name} can use them in future coaching.`,
    inputSchema: {
      type: "object",
      properties: {
        goal: { type: "string", description: "The concrete streaming goal." },
        why: { type: "string", description: "Why the goal matters personally." },
      },
      required: ["goal", "why"],
      additionalProperties: false,
    },
  },
];

function result(id: RpcRequest["id"], value: unknown) {
  return Response.json({ jsonrpc: "2.0", id: id ?? null, result: value });
}

function toolText(value: unknown, isError = false) {
  return { content: [{ type: "text", text: typeof value === "string" ? value : JSON.stringify(value) }], isError };
}

export async function POST(request: Request) {
  const body = await request.json() as RpcRequest;
  if (body.method === "server/discover") {
    return result(body.id, { supportedVersions: ["2026-07-28"], capabilities: { tools: {} } });
  }
  if (body.method === "tools/list") return result(body.id, { tools });
  if (body.method !== "tools/call" || !body.params?.name) {
    return result(body.id, toolText(`Unsupported ${companion.productName} request`, true));
  }

  const user = await getChatGPTUser();
  if (!user) return result(body.id, toolText(`Sign in to ${companion.productName} first.`, true));
  const db = getDb();
  const [profile] = await db.select().from(learnerProfiles).where(eq(learnerProfiles.userId, user.userId)).limit(1);

  if (body.params.name === "get_personal_pip_progress") {
    const [twitch] = await db.select({ login: twitchAccounts.login }).from(twitchAccounts)
      .where(eq(twitchAccounts.userId, user.userId)).limit(1);
    const lessonIndex = Math.min(profile?.currentLesson ?? 0, lessons.length - 1);
    const [goal] = await db.select().from(streamGoals).where(eq(streamGoals.userId, user.userId)).limit(1);
    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setUTCDate(now.getUTCDate() - ((now.getUTCDay() + 6) % 7));
    weekStart.setUTCHours(0, 0, 0, 0);
    const [week] = await db.select({ value: count() }).from(streamSessions).where(and(
      eq(streamSessions.userId, user.userId),
      gte(streamSessions.startedAt, weekStart.toISOString()),
    ));
    const [goalProgress] = goal ? await db.select({ value: count() }).from(streamSessions).where(and(
      eq(streamSessions.userId, user.userId),
      gte(streamSessions.startedAt, goal.startedAt),
    )) : [{ value: 0 }];
    return result(body.id, toolText({
      currentLesson: lessons[lessonIndex]?.title ?? "Path complete",
      unit: lessons[lessonIndex]?.unit.title ?? "Path complete",
      xp: profile?.xp ?? 0,
      streak: profile?.streak ?? 0,
      goal: goal ? { title: goal.title, why: goal.why, deadline: goal.deadline, targetStreams: goal.targetStreams, completedStreams: goalProgress?.value ?? 0 } : null,
      twitchConnected: Boolean(twitch),
      twitchLogin: twitch?.login ?? null,
      streamsThisWeek: week?.value ?? 0,
    }));
  }

  if (body.params.name === "remember_creator_goal") {
    const goal = String(body.params.arguments?.goal ?? "").trim();
    const why = String(body.params.arguments?.why ?? "").trim();
    if (!goal || !why || goal.length > 500 || why.length > 1000) {
      return result(body.id, toolText("Provide a goal and personal reason in a reasonable length.", true));
    }
    const now = new Date().toISOString();
    await db.insert(learnerProfiles).values({
      userId: user.userId,
      email: user.email,
      goal,
      why,
      createdAt: now,
      updatedAt: now,
    }).onConflictDoUpdate({
      target: learnerProfiles.userId,
      set: { email: user.email, goal, why, updatedAt: now },
    });
    return result(body.id, toolText(`${companion.name} remembered the goal: ${goal}`));
  }

  return result(body.id, toolText(`Unknown ${companion.productName} tool.`, true));
}
