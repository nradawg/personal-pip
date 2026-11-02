"use client";

import Image from "next/image";
import { Bell, CheckCircle2, Flame, GraduationCap, Radio, Smartphone, Sparkles } from "lucide-react";
import type { Lesson } from "./course";
import type { TwitchState } from "./my-twitch";
import { companion } from "./companion";

type Progress = { current: number; xp: number; streak: number; lastPractice: string | null };

function dailyMessage(progress: Progress, twitch: TwitchState, current: Lesson, completed: boolean) {
  if (twitch.live) return "You are live. Keep the promise simple and finish the thought you are on.";
  if (completed) return "You finished the first path. Your job now is to keep learning in public.";
  if (progress.lastPractice === new Date().toISOString().slice(0, 10)) return "Lesson done. The useful next step is to practice it during real work or go live.";
  if (twitch.streamsThisWeek === 0) return `Give me three minutes on “${current.title}.” Then choose one small thing you could stream.`;
  return `You already showed up this week. Today, practice “${current.title}” and keep the streak easy.`;
}

export default function MyPip({
  progress,
  twitch,
  current,
  completed,
  onLearn,
  onTwitch,
}: {
  progress: Progress;
  twitch: TwitchState;
  current: Lesson;
  completed: boolean;
  onLearn: () => void;
  onTwitch: () => void;
}) {
  return (
    <main className="pipColumn">
      <section className="pipHero">
        <div className="pipHeroCopy">
          <span className="eyebrow">MY {companion.name.toUpperCase()}</span>
          <h1>{dailyMessage(progress, twitch, current, completed)}</h1>
          <p>{companion.name} uses your lesson progress, real Twitch activity, and deadline to choose one useful action. It never pretends you streamed or invents viewer activity.</p>
          <div className="pipActions">
            <button onClick={onLearn}><GraduationCap /> Do today’s lesson</button>
            <button className="secondary" onClick={onTwitch}><Radio /> Check my goal</button>
          </div>
        </div>
        <Image src={companion.imagePath} alt={`${companion.name}, your ${companion.species} streaming practice companion`} width={360} height={360} priority />
      </section>

      <section className="pipEvidenceGrid">
        <article><GraduationCap /><span>NEXT LESSON</span><strong>{completed ? "Path complete" : current.title}</strong><small>{completed ? "Keep practicing" : `${current.minutes} minutes`}</small></article>
        <article><Flame /><span>DAILY PRACTICE</span><strong>{progress.streak} day streak</strong><small>{progress.xp} XP earned</small></article>
        <article><Radio /><span>TWITCH EVIDENCE</span><strong>{twitch.streamsThisWeek} this week</strong><small>{twitch.connected ? `${twitch.totalStreams} verified total` : "Connect Twitch"}</small></article>
      </section>

      <section className="phoneSetupCard">
        <div className="phoneIcon"><Smartphone /></div>
        <div>
          <span className="eyebrow">PUT {companion.name.toUpperCase()} ON YOUR PHONE</span>
          <h2>Open {companion.productName} in Safari, tap Share, then Add to Home Screen.</h2>
          <p>Sign in with the same ChatGPT account. Your lessons, Twitch connection, goal, and streak stay with you.</p>
        </div>
      </section>

      <section className="notificationCard">
        <div className="notificationTop"><Bell /><div><span className="eyebrow">{companion.name.toUpperCase()} REMINDERS</span><h2>One useful morning nudge</h2></div></div>
        <p>{companion.name} can check your saved progress each morning and send a short ChatGPT notification. The message changes when you practice, stream, reach a goal, or get close to a deadline.</p>
        <div className="notificationRules">
          <span><CheckCircle2 /> No paid API calls</span>
          <span><CheckCircle2 /> No fake urgency</span>
          <span><CheckCircle2 /> Based on your real progress</span>
        </div>
        <div className="notificationHint"><Sparkles /> Turn on ChatGPT notifications on your phone so {companion.name}’s reminder can appear.</div>
      </section>
    </main>
  );
}
