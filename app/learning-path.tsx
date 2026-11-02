"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import { Check, Flame, LockKeyhole, Play, Radio, Sparkles, Star, Trophy, X } from "lucide-react";
import { course, lessons, type Lesson, type Unit } from "./course";
import { companion } from "./companion";
import MyTwitch, { type TwitchState } from "./my-twitch";
import MyPip from "./my-pip";

export type Progress = {
  current: number;
  xp: number;
  streak: number;
  lastPractice: string | null;
};

const initialProgress: Progress = { current: 0, xp: 0, streak: 0, lastPractice: null };
const initialTwitch: TwitchState = { configured: false, connected: false, live: false, streamsThisWeek: 0, minutesThisWeek: 0, totalStreams: 0, recentStreams: [] };

function playSuccess() {
  const AudioContextClass = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AudioContextClass) return;
  const context = new AudioContextClass();
  [523.25, 659.25, 783.99].forEach((frequency, index) => {
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.type = "sine";
    oscillator.frequency.value = frequency;
    gain.gain.setValueAtTime(0, context.currentTime + index * 0.09);
    gain.gain.linearRampToValueAtTime(0.16, context.currentTime + index * 0.09 + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + index * 0.09 + 0.28);
    oscillator.connect(gain).connect(context.destination);
    oscillator.start(context.currentTime + index * 0.09);
    oscillator.stop(context.currentTime + index * 0.09 + 0.3);
  });
  window.setTimeout(() => void context.close(), 800);
}

function LessonPlayer({
  item,
  onClose,
  onComplete,
}: {
  item: Lesson;
  onClose: () => void;
  onComplete: () => void;
}) {
  const [step, setStep] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [practiceAnswer, setPracticeAnswer] = useState("");
  const answers = useMemo(() => {
    const choices = [item.answer, "More equipment before any practice", "Waiting until the stream feels perfect"];
    const offset = Number(item.id.split(".")[1]) % choices.length;
    return choices.slice(offset).concat(choices.slice(0, offset));
  }, [item]);
  const correct = selected === item.answer;

  return (
    <div className="lessonOverlay" role="dialog" aria-modal="true" aria-label={item.title}>
      <div className="lessonTop">
        <button className="iconButton" onClick={onClose} aria-label="Close lesson"><X /></button>
        <div className="lessonProgress"><span style={{ width: String(((step + 1) / 3) * 100) + "%" }} /></div>
        <span className="heart">♥</span>
      </div>

      <main className="lessonStage">
        {step === 0 && (
          <section className="lessonCard enter">
            <div className="pipLesson"><Image src={companion.imagePath} alt={`${companion.name} cheering`} width={220} height={220} priority /></div>
            <span className="miniLabel">LESSON {item.id} · {item.minutes} MIN</span>
            <h1>{item.title}</h1>
            <p className="bigIdea">{item.takeaway}</p>
            <div className="exampleBox">
              <strong>Why {companion.name} cares</strong>
              <p>Simple, repeatable behavior beats waiting for perfect confidence.</p>
            </div>
          </section>
        )}

        {step === 1 && (
          <section className="lessonCard enter">
            <span className="miniLabel">CHECK YOUR INSTINCT</span>
            <h1>What matters most here?</h1>
            <div className="answerList">
              {answers.map((answer) => (
                <button
                  key={answer}
                  className={"answer " + (selected === answer ? "selected" : "")}
                  onClick={() => setSelected(answer)}
                >
                  {answer}
                </button>
              ))}
            </div>
            {selected && (
              <div className={"feedback " + (correct ? "right" : "tryAgain")}>
                {correct ? "Exactly. Keep it simple and useful." : "Not quite. Streaming improves through practice, not perfection."}
              </div>
            )}
          </section>
        )}

        {step === 2 && (
          <section className="lessonCard actionCard enter">
            <div className="sparkCircle"><Sparkles /></div>
            <span className="miniLabel">USE IT TODAY</span>
            <h1>{item.action}</h1>
            <p>Write your answer below so the lesson turns into something you can actually use.</p>
            <label className="practiceResponse">
              <span>Your answer</span>
              <textarea
                value={practiceAnswer}
                maxLength={500}
                rows={5}
                placeholder="Type your answer here…"
                onChange={(event) => setPracticeAnswer(event.target.value)}
                autoFocus
              />
              <small>Private and temporary. This response is not saved or sent to Twitch.</small>
            </label>
          </section>
        )}
      </main>

      <footer className="lessonFooter">
        {step < 2 ? (
          <button className="continueButton" disabled={step === 1 && !correct} onClick={() => setStep(step + 1)}>Continue</button>
        ) : (
          <button className="continueButton complete" disabled={practiceAnswer.trim().length < 2} onClick={onComplete}>Complete lesson · +10 XP</button>
        )}
      </footer>
    </div>
  );
}

function UnitTestPlayer({
  unit,
  onClose,
  onPass,
}: {
  unit: Unit;
  onClose: () => void;
  onPass: () => void;
}) {
  const questions = unit.lessons.slice(0, 3);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const item = questions[questionIndex];
  const answers = useMemo(() => {
    const choices = [item.answer, "More equipment before any practice", "Waiting until everything feels perfect"];
    const offset = (unit.number + questionIndex) % choices.length;
    return choices.slice(offset).concat(choices.slice(0, offset));
  }, [item, questionIndex, unit.number]);
  const correct = selected === item.answer;
  const finalQuestion = questionIndex === questions.length - 1;

  const continueTest = () => {
    if (!correct) return;
    if (finalQuestion) {
      onPass();
      return;
    }
    setQuestionIndex(questionIndex + 1);
    setSelected(null);
  };

  return (
    <div className="lessonOverlay" role="dialog" aria-modal="true" aria-label={"Test out of " + unit.title}>
      <div className="lessonTop">
        <button className="iconButton" onClick={onClose} aria-label="Close unit test"><X /></button>
        <div className="lessonProgress"><span style={{ width: String(((questionIndex + 1) / questions.length) * 100) + "%" }} /></div>
        <span className="testScore">{questionIndex + 1}/{questions.length}</span>
      </div>

      <main className="lessonStage">
        <section className="lessonCard enter">
          <div className="testBadge"><Trophy /></div>
          <span className="miniLabel">TEST OUT · UNIT {unit.number}</span>
          <h1>What matters most for {item.title.toLowerCase()}?</h1>
          <p className="testHelp">Get all three right to complete this unit and unlock the next one.</p>
          <div className="answerList">
            {answers.map((answer) => (
              <button
                key={answer}
                className={"answer " + (selected === answer ? "selected" : "")}
                onClick={() => setSelected(answer)}
              >
                {answer}
              </button>
            ))}
          </div>
          {selected && (
            <div className={"feedback " + (correct ? "right" : "tryAgain")}>
              {correct ? "Correct. You know this principle." : "Not yet. Choose again. You will not lose any progress."}
            </div>
          )}
        </section>
      </main>

      <footer className="lessonFooter">
        <button className="continueButton" disabled={!correct} onClick={continueTest}>
          {finalQuestion ? "Pass unit · +20 XP" : "Next question"}
        </button>
      </footer>
    </div>
  );
}

export default function LearningPath() {
  const [progress, setProgress] = useState<Progress>(initialProgress);
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [celebrating, setCelebrating] = useState(false);
  const [twitch, setTwitch] = useState<TwitchState>(initialTwitch);
  const [clipMessage, setClipMessage] = useState<string | null>(null);
  const [view, setView] = useState<"learn" | "twitch" | "pip">("learn");
  const [activeUnitTest, setActiveUnitTest] = useState<{ unit: Unit; firstIndex: number } | null>(null);
  const currentRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const saved = window.localStorage.getItem("personal-pip-progress");
      if (saved) setProgress(JSON.parse(saved) as Progress);
      void fetch("/api/progress", { cache: "no-store" })
        .then((response) => response.ok ? response.json() as Promise<Progress> : null)
        .then((remote) => {
          if (remote) setProgress(remote);
          setLoaded(true);
        })
        .catch(() => setLoaded(true));
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (loaded) window.localStorage.setItem("personal-pip-progress", JSON.stringify(progress));
  }, [loaded, progress]);

  useEffect(() => {
    const sync = () => {
      void fetch("/api/twitch/status", { cache: "no-store" })
        .then((response) => response.ok ? response.json() as Promise<TwitchState> : null)
        .then((status) => { if (status) setTwitch(status); });
    };
    sync();
    const timer = window.setInterval(sync, 60000);
    return () => window.clearInterval(timer);
  }, []);

  const requestClip = () => {
    setClipMessage("Requesting a Twitch clip…");
    void fetch("/api/twitch/clip", { method: "POST" })
      .then(async (response) => {
        const result = await response.json() as { clip?: { url: string }; error?: string };
        setClipMessage(result.clip ? "Clip created: " + result.clip.url : result.error ?? "No clip was created");
      })
      .catch(() => setClipMessage("No clip was created"));
  };

  const completeLesson = () => {
    const today = new Date().toISOString().slice(0, 10);
    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
    const next = {
      current: Math.min(progress.current + 1, lessons.length),
      xp: progress.xp + 10,
      streak: progress.lastPractice === today ? progress.streak : progress.lastPractice === yesterday ? progress.streak + 1 : 1,
      lastPractice: today,
    };
    setProgress(next);
    void fetch("/api/progress", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(next),
    });
    playSuccess();
    setCelebrating(true);
    setActiveLesson(null);
    window.setTimeout(() => setCelebrating(false), 1200);
  };

  const completeUnitTest = () => {
    if (!activeUnitTest) return;
    const next = {
      ...progress,
      current: Math.max(progress.current, activeUnitTest.firstIndex + activeUnitTest.unit.lessons.length),
      xp: progress.xp + 20,
    };
    setProgress(next);
    void fetch("/api/progress", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(next),
    });
    playSuccess();
    setCelebrating(true);
    setActiveUnitTest(null);
    window.setTimeout(() => setCelebrating(false), 1200);
  };

  const currentLessonIndex = progress.current;

  useEffect(() => {
    if (loaded) window.setTimeout(() => currentRef.current?.scrollIntoView({ behavior: "smooth", block: "center" }), 250);
  }, [loaded, currentLessonIndex]);

  const current = lessons[Math.min(progress.current, lessons.length - 1)];
  const completed = progress.current >= lessons.length;

  return (
    <div className="appShell">
      {celebrating && <div className="celebration" aria-hidden="true">✦ ✧ ✦ ✧ ✦</div>}
      <header className="appHeader">
        <div className="brand"><span className="brandMark">{companion.brandInitial}</span><strong>{companion.productName}</strong></div>
        <div className="stats">
          <span><Flame />{progress.streak}</span>
          <span><Star />{progress.xp}</span>
          <span className={"twitchStatus " + (twitch.live ? "isLive" : "")}><Radio />{twitch.live ? "LIVE" : twitch.connected ? "CONNECTED" : "TWITCH"}</span>
        </div>
      </header>

      <div className="layout">
        <aside className="leftRail">
          <nav>
            <button className={view === "learn" ? "active" : ""} onClick={() => setView("learn")}><Play />Learn</button>
            <button className={view === "twitch" ? "active" : ""} onClick={() => setView("twitch")}><Radio />My Twitch</button>
            <button className={view === "pip" ? "active" : ""} onClick={() => setView("pip")}><Sparkles />My {companion.name}</button>
          </nav>
          <button className={"twitchConnector " + (twitch.connected ? "connected" : "")} onClick={() => setView("twitch")}>
            <span><Radio /></span><div><small>TWITCH CONNECTOR</small><strong>{twitch.connected ? twitch.account?.displayName ?? "Connected" : "Connect account"}</strong></div>
          </button>
          <div className="railPip">
            <Image src={companion.imagePath} alt={companion.name} width={210} height={210} />
            <p>One tiny lesson. Then go make something real.</p>
          </div>
        </aside>

        {view === "learn" ? <main id="path" className="pathColumn">
          <section className="welcomeCard">
            <div>
              <span>YOUR NEXT USEFUL ACTION</span>
              <h1>{completed ? "You finished the first path" : current.title}</h1>
              <p>{completed ? `Keep streaming. ${companion.name} will build your next level from real progress.` : current.takeaway}</p>
              {!completed && <button onClick={() => setActiveLesson(current)}>Start lesson <Play fill="currentColor" /></button>}
            </div>
            <Image src={companion.imagePath} alt={`${companion.name} cheering you on`} width={260} height={260} priority />
          </section>

          {course.map((unit) => {
            const firstIndex = lessons.findIndex((item) => item.id === unit.lessons[0].id);
            const unitUnlocked = firstIndex <= progress.current;
            return (
              <section className={"unit " + unit.color + (unitUnlocked ? "" : " unitLocked")} key={unit.number}>
                <div className="unitBanner">
                  <div><span>UNIT {unit.number}</span><h2>{unit.title}</h2><p>{unit.promise}</p></div>
                  <div className="unitBannerActions">
                    <strong>{unit.lessons.filter((_, index) => firstIndex + index < progress.current).length} / {unit.lessons.length}</strong>
                    {progress.current < firstIndex + unit.lessons.length && (
                      <button className="testOutButton" onClick={() => setActiveUnitTest({ unit, firstIndex })}>
                        <Trophy /> Test out
                      </button>
                    )}
                  </div>
                </div>
                <div className="nodes">
                  {unit.lessons.map((item, index) => {
                    const absoluteIndex = firstIndex + index;
                    const state = absoluteIndex < progress.current ? "done" : absoluteIndex === progress.current ? "current" : "locked";
                    return (
                      <div className={"nodeRow position" + String(index % 3)} key={item.id}>
                        <button
                          ref={state === "current" ? currentRef : undefined}
                          className={"node " + state}
                          disabled={state !== "current"}
                          onClick={() => setActiveLesson(item)}
                          aria-label={item.title + ", " + state}
                        >
                          {state === "done" ? <Check /> : state === "current" ? <Star fill="currentColor" /> : <LockKeyhole />}
                        </button>
                        {state === "current" && (
                          <div className="nodeLabel">
                            <span>START</span><strong>{item.title}</strong><small>{item.minutes} min · +10 XP</small>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
                {[3, 7, 11].includes(unit.number) && (
                  <div id={unit.number === 3 ? "quests" : undefined} className="streamQuest">
                    <div className="questIcon"><Radio /></div>
                    <div>
                      <span>REAL WORLD QUEST</span>
                      <h3>{unit.number === 3 ? "Complete your first 5 minute stream" : unit.number === 7 ? "Complete one stream this week" : "Improve one thing on your next stream"}</h3>
                      <p>Twitch verification moves quests forward. Lessons remain available while you build the habit.</p>
                    </div>
                    {twitch.connected ? (
                      <span className="questConnected">{twitch.live ? "Live now" : "Connected"}</span>
                    ) : (
                      <a className="questButton" href="/api/twitch/start">{twitch.configured ? "Connect Twitch" : "Twitch setup"}</a>
                    )}
                  </div>
                )}
              </section>
            );
          })}
          <div className="sourceNote">Course principles use durable creator practices and current Twitch Creator Camp guidance. Platform details are reviewed separately so the core lessons do not expire.</div>
        </main> : view === "twitch" ? <MyTwitch twitch={twitch} requestClip={requestClip} clipMessage={clipMessage} /> : <MyPip progress={progress} twitch={twitch} current={current} completed={completed} onLearn={() => setView("learn")} onTwitch={() => setView("twitch")} />}

        {view === "learn" && <aside className="rightRail">
          <section className="sideCard streakCard">
            <div className="cardTitle"><Flame /><strong>{progress.streak} day streak</strong></div>
            <p>Practice once today. Streaming is a separate goal.</p>
            <div className="weekDots">{"SMTWTFS".split("").map((day, index) => <span className={index < Math.min(progress.streak, 7) ? "filled" : ""} key={day + String(index)}>{day}</span>)}</div>
          </section>
          <section className="sideCard">
            <span className="sideLabel">THIS WEEK</span>
            <h3>{twitch.streamsThisWeek} of 1 streams</h3>
            <div className="meter"><span style={{ width: twitch.streamsThisWeek > 0 ? "100%" : "4%" }} /></div>
            <p>Start with one useful stream. A difficult week lowers the next target, not your worth.</p>
            {twitch.live && <button className="clipButton" onClick={requestClip}>Clip this moment</button>}
            {clipMessage && <p className="clipMessage">{clipMessage}</p>}
          </section>
          <section className="sideCard pipNote" id="profile">
            <Image src={companion.imagePath} alt={companion.name} width={90} height={90} />
            <div><span>{companion.name.toUpperCase()} SAYS</span><p>{completed ? "You know enough to keep learning in public." : "Three minutes now gets you closer to " + current.unit.promise.toLowerCase() + "."}</p></div>
          </section>
        </aside>}
      </div>

      <nav className="mobileNav" aria-label="Primary navigation">
        <button className={view === "learn" ? "active" : ""} onClick={() => setView("learn")}><Play /><span>Learn</span></button>
        <button className={view === "twitch" ? "active" : ""} onClick={() => setView("twitch")}><Radio /><span>My Twitch</span></button>
        <button className={view === "pip" ? "active" : ""} onClick={() => setView("pip")}><Sparkles /><span>My {companion.name}</span></button>
      </nav>

      {activeLesson && <LessonPlayer item={activeLesson} onClose={() => setActiveLesson(null)} onComplete={completeLesson} />}
      {activeUnitTest && <UnitTestPlayer unit={activeUnitTest.unit} onClose={() => setActiveUnitTest(null)} onPass={completeUnitTest} />}
    </div>
  );
}
