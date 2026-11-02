import { and, count, eq, gte, lte } from "drizzle-orm";
import { z } from "zod";
import { getChatGPTUser } from "../../../chatgpt-auth";
import { getDb } from "../../../../db";
import { learnerProfiles, streamGoals, streamSessions } from "../../../../db/schema";

const goalSchema = z.object({
  title: z.string().trim().min(3).max(140),
  why: z.string().trim().max(240).optional().default(""),
  targetStreams: z.number().int().min(1).max(100),
  deadline: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

async function goalResponse(userId: string) {
  const db = getDb();
  const [goal] = await db.select().from(streamGoals).where(eq(streamGoals.userId, userId)).limit(1);
  if (!goal) return { goal: null };

  const deadlineEnd = goal.deadline + "T23:59:59.999Z";
  const [progress] = await db.select({ value: count() }).from(streamSessions).where(and(
    eq(streamSessions.userId, userId),
    gte(streamSessions.startedAt, goal.startedAt),
    lte(streamSessions.startedAt, deadlineEnd),
  ));

  return {
    goal: {
      title: goal.title,
      why: goal.why,
      targetStreams: goal.targetStreams,
      deadline: goal.deadline,
      startedAt: goal.startedAt,
      completedStreams: progress?.value ?? 0,
    },
  };
}

export async function GET() {
  const user = await getChatGPTUser();
  if (!user) return Response.json({ error: "Sign in required" }, { status: 401 });
  return Response.json(await goalResponse(user.userId));
}

export async function POST(request: Request) {
  const user = await getChatGPTUser();
  if (!user) return Response.json({ error: "Sign in required" }, { status: 401 });

  const parsed = goalSchema.safeParse(await request.json());
  if (!parsed.success) return Response.json({ error: "Check your goal and deadline" }, { status: 400 });

  const deadline = new Date(parsed.data.deadline + "T23:59:59.999Z");
  if (Number.isNaN(deadline.getTime()) || deadline.getTime() < Date.now()) {
    return Response.json({ error: "Choose today or a future date" }, { status: 400 });
  }

  const db = getDb();
  const now = new Date().toISOString();
  await db.insert(learnerProfiles).values({
    userId: user.userId,
    email: user.email,
    createdAt: now,
    updatedAt: now,
  }).onConflictDoNothing();

  await db.insert(streamGoals).values({
    userId: user.userId,
    title: parsed.data.title,
    why: parsed.data.why || null,
    targetStreams: parsed.data.targetStreams,
    deadline: parsed.data.deadline,
    startedAt: now,
    createdAt: now,
    updatedAt: now,
  }).onConflictDoUpdate({
    target: streamGoals.userId,
    set: {
      title: parsed.data.title,
      why: parsed.data.why || null,
      targetStreams: parsed.data.targetStreams,
      deadline: parsed.data.deadline,
      startedAt: now,
      updatedAt: now,
    },
  });

  return Response.json(await goalResponse(user.userId));
}
