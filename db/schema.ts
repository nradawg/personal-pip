import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const learnerProfiles = sqliteTable("learner_profiles", {
  userId: text("user_id").primaryKey(),
  email: text("email").notNull(),
  currentLesson: integer("current_lesson").notNull().default(0),
  xp: integer("xp").notNull().default(0),
  streak: integer("streak").notNull().default(0),
  lastPractice: text("last_practice"),
  goal: text("goal"),
  why: text("why"),
  companionName: text("companion_name").notNull().default("Pip"),
  companionStyle: text("companion_style").notNull().default("duck"),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export const twitchAccounts = sqliteTable("twitch_accounts", {
  userId: text("user_id").primaryKey().references(() => learnerProfiles.userId),
  twitchUserId: text("twitch_user_id").notNull().unique(),
  login: text("login").notNull(),
  displayName: text("display_name").notNull(),
  profileImageUrl: text("profile_image_url"),
  accessToken: text("access_token").notNull(),
  refreshToken: text("refresh_token").notNull(),
  tokenExpiresAt: text("token_expires_at").notNull(),
  connectedAt: text("connected_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export const streamSessions = sqliteTable("stream_sessions", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => learnerProfiles.userId),
  twitchStreamId: text("twitch_stream_id").notNull().unique(),
  startedAt: text("started_at").notNull(),
  endedAt: text("ended_at"),
  durationMinutes: integer("duration_minutes"),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export const streamGoals = sqliteTable("stream_goals", {
  userId: text("user_id").primaryKey().references(() => learnerProfiles.userId),
  title: text("title").notNull(),
  why: text("why"),
  targetStreams: integer("target_streams").notNull().default(1),
  deadline: text("deadline").notNull(),
  startedAt: text("started_at").notNull(),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});
