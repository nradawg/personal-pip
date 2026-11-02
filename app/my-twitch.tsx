"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { CalendarDays, CheckCircle2, Clock3, Radio, Sparkles, Target, Trophy } from "lucide-react";
import { companion } from "./companion";

export type TwitchState = {
  configured: boolean;
  connected: boolean;
  live: boolean;
  streamsThisWeek: number;
  minutesThisWeek: number;
  totalStreams: number;
  account?: { login: string; displayName: string; profileImageUrl?: string | null } | null;
  recentStreams: Array<{ startedAt: string; endedAt: string | null; durationMinutes: number | null }>;
};

type StreamGoal = {
  title: string;
  why: string | null;
  targetStreams: number;
  deadline: string;
  startedAt: string;
  completedStreams: number;
};

const emptyGoal = { title: "", why: "", targetStreams: 1, deadline: "" };

function daysUntil(date: string) {
  const end = new Date(date + "T23:59:59").getTime();
  return Math.max(0, Math.ceil((end - Date.now()) / 86400000));
}

function pipMessage(goal: StreamGoal | null) {
  if (!goal) return "Give me one goal and a deadline. I’ll keep the next step small and honest.";
  const left = Math.max(0, goal.targetStreams - goal.completedStreams);
  const days = daysUntil(goal.deadline);
  if (left === 0) return "You did it. That goal is real now, and I saw the streams that made it happen.";
  if (days <= 1 && goal.completedStreams === 0) return "Your deadline is almost here. A five minute stream today still counts as showing up.";
  if (days <= 3) return `You have ${days} days and ${left} stream${left === 1 ? "" : "s"} left. Let’s make the next one simple.`;
  return `${left} stream${left === 1 ? "" : "s"} left. Keep learning, then press Go Live before it feels perfect.`;
}

export default function MyTwitch({
  twitch,
  requestClip,
  clipMessage,
}: {
  twitch: TwitchState;
  requestClip: () => void;
  clipMessage: string | null;
}) {
  const [goal, setGoal] = useState<StreamGoal | null>(null);
  const [draft, setDraft] = useState(emptyGoal);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [goalError, setGoalError] = useState<string | null>(null);

  useEffect(() => {
    void fetch("/api/twitch/goal", { cache: "no-store" })
      .then((response) => response.ok ? response.json() as Promise<{ goal: StreamGoal | null }> : null)
      .then((result) => {
        if (!result) return;
        setGoal(result.goal);
        if (result.goal) setDraft({
          title: result.goal.title,
          why: result.goal.why ?? "",
          targetStreams: result.goal.targetStreams,
          deadline: result.goal.deadline,
        });
      });
  }, []);

  const goalPercent = useMemo(() => goal ? Math.min(100, (goal.completedStreams / goal.targetStreams) * 100) : 0, [goal]);

  const saveGoal = (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setGoalError(null);
    void fetch("/api/twitch/goal", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(draft),
    }).then(async (response) => {
      const result = await response.json() as { goal?: StreamGoal; error?: string };
      if (!response.ok || !result.goal) throw new Error(result.error ?? "Goal could not be saved");
      setGoal(result.goal);
      setEditing(false);
    }).catch((error: unknown) => {
      setGoalError(error instanceof Error ? error.message : "Goal could not be saved");
    }).finally(() => setSaving(false));
  };

  return (
    <main className="twitchColumn">
      <section className="twitchHero">
        <div>
          <span className="eyebrow">MY TWITCH</span>
          <h1>{twitch.connected ? `Welcome, ${twitch.account?.displayName ?? "creator"}` : `Connect once. ${companion.name} keeps score.`}</h1>
          <p>{twitch.connected ? "Your verified streams and goal progress live here. Twitch still handles the broadcast." : `${companion.productName} reads your real live status and stream history without becoming another creator dashboard.`}</p>
          {twitch.connected ? (
            <div className="connectedIdentity">
              {twitch.account?.profileImageUrl && <Image unoptimized src={twitch.account.profileImageUrl} alt="" width={38} height={38} />}
              <span>{twitch.live ? "Live now" : "Twitch connected"}</span>
            </div>
          ) : (
            <a className="connectButton" href="/api/twitch/start">{twitch.configured ? "Connect my Twitch" : "Finish Twitch setup"}</a>
          )}
        </div>
        <div className={"twitchOrb " + (twitch.live ? "live" : "")}><Radio /></div>
      </section>

      <section className="statGrid" aria-label="Twitch statistics">
        <article><Radio /><strong>{twitch.streamsThisWeek}</strong><span>streams this week</span></article>
        <article><Clock3 /><strong>{twitch.minutesThisWeek}</strong><span>minutes this week</span></article>
        <article><Trophy /><strong>{twitch.totalStreams}</strong><span>verified streams</span></article>
        <article><Sparkles /><strong>{twitch.live ? "LIVE" : "READY"}</strong><span>current status</span></article>
      </section>

      <section className="pipCoachCard">
        <Image src={companion.imagePath} alt={companion.name} width={150} height={150} />
        <div><span>{companion.name.toUpperCase()} SAYS</span><h2>{pipMessage(goal)}</h2>{goal?.why && <p>Remember why: {goal.why}</p>}</div>
      </section>

      <section className="goalCard">
        <div className="sectionHeading">
          <div><span className="eyebrow">YOUR DEADLINE</span><h2>{goal ? goal.title : "Set your first streaming goal"}</h2></div>
          {goal && <button className="textButton" onClick={() => setEditing(!editing)}>{editing ? "Cancel" : "Change goal"}</button>}
        </div>

        {goal && !editing ? (
          <div className="goalProgress">
            <div className="goalNumbers"><strong>{goal.completedStreams} of {goal.targetStreams} streams</strong><span><CalendarDays /> {daysUntil(goal.deadline)} days left</span></div>
            <div className="goalMeter"><span style={{ width: `${goalPercent}%` }} /></div>
            {goalPercent === 100 && <div className="goalWin"><CheckCircle2 /> Goal reached. {companion.name} is proud of you.</div>}
          </div>
        ) : (
          <form className="goalForm" onSubmit={saveGoal}>
            <label>What do you want to make happen?<input value={draft.title} maxLength={140} required placeholder="Go live while I build my business" onChange={(event) => setDraft({ ...draft, title: event.target.value })} /></label>
            <label>Why does this matter to you?<textarea value={draft.why} maxLength={240} placeholder="I want to stop overthinking and build in public" onChange={(event) => setDraft({ ...draft, why: event.target.value })} /></label>
            <div className="goalFormRow">
              <label>How many streams?<input type="number" min="1" max="100" required value={draft.targetStreams} onChange={(event) => setDraft({ ...draft, targetStreams: Number(event.target.value) })} /></label>
              <label>By when?<input type="date" required min={new Date().toISOString().slice(0, 10)} value={draft.deadline} onChange={(event) => setDraft({ ...draft, deadline: event.target.value })} /></label>
            </div>
            {goalError && <p className="formError">{goalError}</p>}
            <button className="saveGoalButton" disabled={saving}><Target /> {saving ? "Saving…" : "Set my goal"}</button>
          </form>
        )}
      </section>

      <section className="activityCard">
        <div className="sectionHeading"><div><span className="eyebrow">VERIFIED BY TWITCH</span><h2>Recent streams</h2></div>{twitch.live && <button className="clipButton compact" onClick={requestClip}>Clip this moment</button>}</div>
        {clipMessage && <p className="clipMessage">{clipMessage}</p>}
        {!twitch.connected ? <p className="emptyActivity">Connect Twitch to let {companion.name} recognize when you show up.</p> : twitch.recentStreams.length === 0 ? <p className="emptyActivity">No verified streams yet. Your first one will appear here after {companion.name} sees you live.</p> : (
          <div className="activityList">{twitch.recentStreams.map((stream) => (
            <div key={stream.startedAt}><span className="activityDot" /><div><strong>{new Date(stream.startedAt).toLocaleDateString(undefined, { month: "short", day: "numeric" })}</strong><small>{stream.endedAt ? `${stream.durationMinutes ?? 0} minutes` : "Live now"}</small></div></div>
          ))}</div>
        )}
      </section>
    </main>
  );
}
