import { companion } from "./companion";

export type Lesson = {
  id: string;
  title: string;
  takeaway: string;
  action: string;
  answer: string;
  minutes: number;
};

export type Unit = {
  number: number;
  title: string;
  promise: string;
  color: string;
  lessons: Lesson[];
};

type LessonSeed = [title: string, takeaway: string, action: string, answer: string];

const units: Array<Omit<Unit, "number" | "lessons"> & { seeds: LessonSeed[] }> = [
  {
    title: "Start before you feel ready",
    promise: "Turn an account into your first real stream",
    color: "grape",
    seeds: [
      ["Choose your reason", "A personal reason is more useful than a vague goal to grow.", "Finish this sentence: I want to stream because…", "A reason that matters to you"],
      ["Use the gear you have", "A phone or computer is enough. Clear audio matters more than an expensive camera.", "Name the simplest setup you could use today.", "The simplest reliable setup"],
      ["Make your account ready", "A recognizable name, short bio, and clear image help people understand who they found.", "Draft a one line channel bio.", "A clear description of you and the stream"],
      ["Learn the live button", "The goal of a first test is to learn the controls, not impress an audience.", "Choose when you could run a five minute test.", "A short controlled test"],
    ],
  },
  {
    title: "Help people find you",
    promise: "Describe the stream clearly before it starts",
    color: "blue",
    seeds: [
      ["Pick the honest category", "Choose the category that best describes what viewers will actually see.", "Name the closest category for your next stream.", "The category that matches the activity"],
      ["Write a useful title", "A strong title names the activity and the expected result.", "Write a title using action plus result.", "A specific activity and outcome"],
      ["Use tags for context", "Tags add details that a broad category cannot communicate.", "Choose three truthful tags.", "Accurate details about the stream"],
      ["Set the expectation", "Tell viewers what is happening now, not what your channel might become someday.", "Say your next stream in one plain sentence.", "What viewers will see today"],
    ],
  },
  {
    title: "Go live simply",
    promise: "Make the first minutes calm and repeatable",
    color: "coral",
    seeds: [
      ["Check sound first", "Viewers can tolerate simple video more easily than unclear audio.", "Record twenty seconds and listen back.", "A short audio recording"],
      ["Protect private information", "Only capture the window or scene you intend viewers to see.", "Name one thing you must hide before going live.", "A reviewed and limited capture"],
      ["Open with direction", "The first sentence should tell people what you are doing and why it matters.", "Rehearse your first sentence once.", "The activity and its purpose"],
      ["Finish five minutes", "A completed small stream builds more confidence than another hour of planning.", "Choose the smallest useful thing you can finish live.", "A complete short stream"],
    ],
  },
  {
    title: "Never fear silence",
    promise: "Keep talking without pretending chat is busy",
    color: "mint",
    seeds: [
      ["Narrate the decision", "Explain what you are choosing, the alternatives, and why you chose it.", "Explain one decision from your work.", "Choice, alternatives, and reason"],
      ["Use the three question loop", "When you go quiet, ask: What am I doing, why, and what happens next?", "Practice the loop on your current task.", "What, why, and next"],
      ["Think aloud with boundaries", "Share useful reasoning without exposing passwords, customer details, or private messages.", "Name one safe detail and one private detail.", "Useful reasoning without private data"],
      ["Return after a tangent", "A simple recap brings viewers back when your thinking wanders.", "Write your return phrase.", "A one sentence recap"],
    ],
  },
  {
    title: "Make a watchable story",
    promise: "Give every stream a beginning, middle, and payoff",
    color: "gold",
    seeds: [
      ["Promise one result", "A specific finish line gives the stream direction even when nobody chats.", "Choose one result you can show.", "One visible result"],
      ["Plan three beats", "Most beginner streams only need a setup, the work, and a reveal.", "Name your three beats.", "Setup, work, and payoff"],
      ["Create transitions", "Brief recaps help a new viewer understand the stream at any moment.", "Write one transition sentence.", "Recap what changed and what comes next"],
      ["End with the payoff", "Show what changed before you thank viewers and leave.", "Practice your final recap.", "A visible before and after"],
    ],
  },
  {
    title: "Invite participation",
    promise: "Make chat welcome without depending on it",
    color: "grape",
    seeds: [
      ["Ask answerable questions", "Specific choices are easier to answer than broad requests for thoughts.", "Turn one broad question into two choices.", "A specific low pressure choice"],
      ["Leave room for replies", "Ask once, continue working, and check chat naturally.", "Practice asking and continuing.", "Invite once and keep moving"],
      ["Acknowledge real chat", "Respond to the actual message and add context for everyone else.", "Practice a response that includes context.", "Answer the real message clearly"],
      ["Never invent viewers", "Prepared prompts are private coaching cues, not viewer questions.", "State the difference in your own words.", "Label coaching as coaching"],
    ],
  },
  {
    title: "Build consistency",
    promise: "Create a habit that survives difficult weeks",
    color: "blue",
    seeds: [
      ["Choose a minimum stream", "A small minimum removes the pressure to produce a perfect show.", "Choose your minimum stream length.", "A length you can repeat"],
      ["Attach streaming to work", "Streaming something you already do lowers the cost of starting.", "Name one existing task you could stream.", "Existing useful work"],
      ["Use a start ritual", "The same short sequence reduces decisions before every stream.", "Create your five step ritual.", "A repeatable short checklist"],
      ["Recover without punishment", "A missed week is information about capacity, not proof you failed.", "Choose your gentle restart action.", "A smaller next action"],
    ],
  },
  {
    title: "Stream with confidence",
    promise: "Handle common problems without ending the habit",
    color: "coral",
    seeds: [
      ["Use a preview", "A preview confirms framing, capture, and audio before viewers arrive.", "List three things you will inspect.", "Video, audio, and privacy"],
      ["Keep backup notes", "Three short cues can restart you when nerves erase your plan.", "Write your three rescue cues.", "Three short reminders"],
      ["Handle a mistake", "Name the issue calmly, fix what you can, and continue.", "Practice one calm recovery sentence.", "Acknowledge, fix, and recap"],
      ["End when needed", "A clear early ending is better than staying live while uncomfortable or unsafe.", "Write your safe exit line.", "A clear respectful ending"],
    ],
  },
  {
    title: "Create a safe channel",
    promise: "Protect yourself and make expectations clear",
    color: "mint",
    seeds: [
      ["Set chat boundaries", "Simple rules tell people what participation is welcome.", "Write three short channel rules.", "Clear behavior expectations"],
      ["Use moderation tools", "Blocking, timing out, and reporting are normal safety tools.", "Find the moderation controls before you need them.", "Act early on harmful behavior"],
      ["Respect music rights", "Only use audio you have permission to broadcast and republish.", "Choose your safe audio approach.", "Audio you can legally use"],
      ["Separate public and private", "Decide in advance which business details stay off stream.", "Create a short never show list.", "A planned privacy boundary"],
    ],
  },
  {
    title: "Become recognizable",
    promise: "Help the right viewers know what they will get",
    color: "gold",
    seeds: [
      ["Name your recurring theme", "A repeatable theme makes the next stream easier to understand.", "Write your recurring theme.", "A repeatable viewer promise"],
      ["Create a simple series", "A series connects separate streams without requiring a scripted show.", "Name a three stream series.", "Connected streams with a clear sequence"],
      ["Keep visuals readable", "Simple consistent colors and large text work better than a crowded layout.", "Remove one unnecessary visual element.", "Fewer clearer elements"],
      ["Repeat the promise", "New viewers arrive at different times, so brief natural context helps.", "Write your reintroduction line.", "A short current context"],
    ],
  },
  {
    title: "Improve every stream",
    promise: "Use evidence without drowning in analytics",
    color: "grape",
    seeds: [
      ["Review one moment", "Inspect the opening, one middle moment, and the ending instead of rewatching everything.", "Choose the three timestamps you will review.", "Opening, middle, and ending"],
      ["Choose one improvement", "One change is easier to remember and test than a long critique.", "Write exactly one improvement.", "One observable behavior"],
      ["Compare with yourself", "Your previous streams are the fairest baseline for early progress.", "Name one measure you can compare next week.", "Your own previous performance"],
      ["Keep what worked", "Improvement also means protecting a behavior that already helped.", "Name one behavior to repeat.", "A proven helpful behavior"],
    ],
  },
  {
    title: "Grow a real community",
    promise: "Turn occasional viewers into familiar people",
    color: "blue",
    seeds: [
      ["Welcome without spotlighting", "Acknowledge participation without forcing quiet viewers to speak.", "Practice a low pressure welcome.", "Make every level of participation comfortable"],
      ["Remember context", "Relevant public context can make returning viewers feel recognized.", "Choose what public context is appropriate to remember.", "Relevant public context"],
      ["Make a clear invitation", "Tell interested viewers exactly why they might return.", "Write one honest invitation.", "A reason to return"],
      ["Support other creators", "Genuine participation in related communities works better than self promotion.", "Identify one relevant creator community.", "Contribute before promoting"],
    ],
  },
  {
    title: "Capture what matters",
    promise: "Leave every stream with shareable proof",
    color: "coral",
    seeds: [
      ["Spot a complete moment", "A useful clip has enough context to make sense on its own.", "Name the beginning and end of one complete explanation.", "Context, insight, and payoff"],
      ["Mark the change", "Decisions, surprises, first results, and before and after reveals are strong candidates.", "Choose two moments worth watching for.", "A meaningful change"],
      ["Reject filler", "Publishing nothing is better than publishing a clip with no value.", "Describe one moment you would not publish.", "A moment with clear viewer value"],
      ["Add context for sharing", "A short caption should explain why the moment matters without exaggeration.", "Write one honest clip caption.", "Specific value without hype"],
    ],
  },
  {
    title: "Run growth experiments",
    promise: "Learn what attracts and keeps the right viewers",
    color: "mint",
    seeds: [
      ["Change one variable", "Testing one change at a time makes results easier to understand.", "Choose one variable for your next stream.", "One controlled change"],
      ["Measure the right signal", "Choose a signal connected to the experiment instead of watching every number.", "Match one signal to your experiment.", "A signal that tests the idea"],
      ["Collaborate with purpose", "A good collaboration gives both audiences a clear shared activity.", "Draft one collaboration concept.", "A useful shared activity"],
      ["Reuse the best lesson", "Turn a proven stream moment into a future opening, title, lesson, or clip.", "Choose one thing worth repeating.", "A proven valuable moment"],
    ],
  },
  {
    title: "Build a sustainable practice",
    promise: "Keep streaming useful as your channel grows",
    color: "gold",
    seeds: [
      ["Protect your energy", "A sustainable schedule leaves room for the work that makes streams worth watching.", "Choose a schedule you can keep for one month.", "A realistic repeatable schedule"],
      ["Raise the challenge slowly", "Increase duration or frequency only after the current habit feels stable.", "Choose the next small difficulty increase.", "One gradual increase"],
      ["Define your next threshold", "A meaningful threshold can be consistency, confidence, participation, or audience quality.", "Define your next threshold.", "A behavior you can verify"],
      ["Keep learning in public", "Useful work creates value even before the audience grows.", `Write the rule you want ${companion.name} to remind you of.`, "Useful work shared clearly and improved consistently"],
    ],
  },
];

export const course: Unit[] = units.map((unit, unitIndex) => ({
  number: unitIndex + 1,
  title: unit.title,
  promise: unit.promise,
  color: unit.color,
  lessons: unit.seeds.map((seed, lessonIndex) => ({
    id: String(unitIndex + 1) + "." + String(lessonIndex + 1),
    title: seed[0],
    takeaway: seed[1],
    action: seed[2],
    answer: seed[3],
    minutes: 5,
  })),
}));

export const lessons = course.flatMap((unit) =>
  unit.lessons.map((item) => ({ ...item, unit })),
);
