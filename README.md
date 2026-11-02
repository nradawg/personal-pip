# Personal Pip

Personal Pip is a private, Duolingo inspired learning path for people who want to become consistent Twitch streamers. It includes 60 short lessons, unit skip quizzes, a separate daily practice streak, verified weekly Twitch activity, personal goals, and live clip requests.

Every clone starts empty. It contains no creator account, Twitch token, stream history, goal, email, Site identifier, or production secret.

## Start with Codex

1. Clone this repository.

2. Open the folder in Codex.

3. Paste this message into the chat:

> Set up Personal Pip for me. Follow AGENTS.md. Ask me one question at a time. Help me choose and generate my own pond animal companion, run the app, create my private Site if Sites is available, and connect my Twitch account. Keep every secret out of chat and Git. Continue all independent work while I handle account sign ins.

Codex will ask which pond animal you want, generate an original mascot, update the app identity, verify the project, and guide the Twitch connection.

## What each person owns

1. Their own generated pond companion image and name.

2. Their own private Site and D1 database when Sites is available.

3. Their own Twitch Developer application, client identifier, and client secret.

4. Their own encrypted Twitch access and refresh tokens.

5. Their own lessons, streak, goals, and verified stream history.

## Local setup

1. Install Node.js 22.13 or newer and Git.

2. Run `npm install`.

3. Copy `.dev.vars.example` to `.dev.vars` and replace every placeholder locally.

4. Run `npm run setup:check`. It reports which settings are missing without printing their values.

5. Run `npm run build` once, then apply the SQL migrations in `drizzle/` to the local D1 database using the generated Wrangler configuration.

6. Run `npm run dev` and open the URL it prints.

The local Sites development runtime provides a test ChatGPT identity on loopback. A hosted Site uses its real ChatGPT sign in identity headers.

## Twitch setup

Each installation must create a separate Twitch Developer application. Do not share a client identifier between cloned installations.

1. Enable two factor authentication on the Twitch account.

2. Register an application in the Twitch Developer Console.

3. Run `npm run setup:check` after choosing the final `APP_URL`.

4. Copy the exact OAuth callback shown by the check into the Twitch application.

5. Store the client identifier and secret in local ignored files or protected hosting settings.

6. Open Personal Pip and choose Connect my Twitch.

The server uses Twitch’s authorization code flow. Tokens are encrypted at rest with `APP_SECRET`. The app requests `clips:edit`, which is required for a user initiated clip request while the broadcaster is live.

Official references:

1. [Twitch app registration](https://dev.twitch.tv/docs/authentication/register-app)

2. [Twitch authentication](https://dev.twitch.tv/docs/authentication)

3. [Twitch Clips](https://dev.twitch.tv/docs/api/clips)

4. [Using Codex with a ChatGPT plan](https://help.openai.com/en/articles/11369540-using-codex-with-your-chatgpt-plan)

## Privacy and cost

The core application has no OpenAI API dependency and does not assume that a ChatGPT subscription pays for hosted API calls. Lessons, quizzes, goals, progress calculations, and Twitch synchronization are deterministic.

OpenAI Sites availability and limits can vary by account or workspace. Anyone with Codex access can customize and run the repository locally. The private phone accessible deployment requires Sites access or another host with equivalent identity and storage capabilities.

Twitch tokens are encrypted before storage. The repository ignores local settings, Site runtime files, build output, and private keys. The application never requests screen, camera, or microphone permission.

## Verification

Run:

```text
npm run typecheck
npm test
npm run lint
npm run build
```

Do not claim a Twitch connection, live event, or clip works for a new installation until it has been verified with that person’s real account and stream.

## License

MIT

