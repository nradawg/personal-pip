import { eq } from "drizzle-orm";
import { z } from "zod";
import { getChatGPTUser } from "../../chatgpt-auth";
import { getDb } from "../../../db";
import { learnerProfiles } from "../../../db/schema";

const progressSchema = z.object({
  current: z.number().int().min(0).max(60),
  xp: z.number().int().min(0).max(1000000),
  streak: z.number().int().min(0).max(100000),
  lastPractice: z.string().nullable(),
});

export async function GET() {
  const user = await getChatGPTUser();
  if (!user) return Response.json({ error: "Sign in required" }, { status: 401 });

  const db = getDb();
  const [existing] = await db
    .select()
    .from(learnerProfiles)
    .where(eq(learnerProfiles.userId, user.userId))
    .limit(1);

  if (!existing) {
    const now = new Date().toISOString();
    await db.insert(learnerProfiles).values({
      userId: user.userId,
      email: user.email,
      createdAt: now,
      updatedAt: now,
    });
    return Response.json({ current: 0, xp: 0, streak: 0, lastPractice: null });
  }

  return Response.json({
    current: existing.currentLesson,
    xp: existing.xp,
    streak: existing.streak,
    lastPractice: existing.lastPractice,
  });
}

export async function POST(request: Request) {
  const user = await getChatGPTUser();
  if (!user) return Response.json({ error: "Sign in required" }, { status: 401 });

  const parsed = progressSchema.safeParse(await request.json());
  if (!parsed.success) return Response.json({ error: "Invalid progress" }, { status: 400 });

  const now = new Date().toISOString();
  const db = getDb();
  await db
    .insert(learnerProfiles)
    .values({
      userId: user.userId,
      email: user.email,
      currentLesson: parsed.data.current,
      xp: parsed.data.xp,
      streak: parsed.data.streak,
      lastPractice: parsed.data.lastPractice,
      createdAt: now,
      updatedAt: now,
    })
    .onConflictDoUpdate({
      target: learnerProfiles.userId,
      set: {
        email: user.email,
        currentLesson: parsed.data.current,
        xp: parsed.data.xp,
        streak: parsed.data.streak,
        lastPractice: parsed.data.lastPractice,
        updatedAt: now,
      },
    });

  return Response.json({ ok: true });
}
