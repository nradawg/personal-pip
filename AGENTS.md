# Personal Pip setup contract

When a person clones this repository and asks you to set it up, own the complete setup journey with them.

## Start here

1. Read this file and `README.md` completely.

2. Inspect the repository and run `npm run setup:check` before changing anything.

3. Ask one short question at a time. Do not overwhelm a new streamer with a long form.

4. Never print, paste into chat, or commit client secrets, access tokens, refresh tokens, cookies, or generated app secrets.

## Create their pond companion

1. Ask which pond animal they want. Accept any real or imaginative pond animal.

2. Ask what they want to name it.

3. Ask for one visual preference only if their answer does not provide enough direction.

4. Use the available image generation capability to create a friendly, original, animated looking mascot. Do not imitate a named living artist or copy another product mascot. Prefer a transparent or simple light background and a centered full body pose that remains readable at phone size.

5. Save the generated image as `public/companion-mascot.png`.

6. Update `app/companion.ts` with `customized: true`, the chosen name, species, product name, and brand initial. Do not put the person’s legal name, email, Twitch username, or other private information in source.

7. Show the person the generated mascot and let them request one revision.

## Install and verify locally

1. Install dependencies with the locked package file.

2. Use local secret files only. `.dev.vars` and `.env.local` are ignored by Git.

3. Generate a strong `APP_SECRET` locally and save it without displaying it in chat.

4. Run `npm run typecheck`, `npm test`, `npm run lint`, and `npm run build`.

5. Run the local D1 migrations before testing saved progress.

## Hosting

1. Prefer an owner private OpenAI Site when the person has Sites access. Read the current Sites instructions before creating or publishing anything.

2. The repository intentionally has no Site project identifier. Create a new Site for this clone and let the Sites workflow write its own identifier into `.openai/hosting.json`.

3. Keep the Site private unless the person explicitly requests public access.

4. Store `APP_URL`, `APP_SECRET`, `TWITCH_CLIENT_ID`, and `TWITCH_CLIENT_SECRET` as protected runtime settings. Never put them in source control.

5. If Sites is unavailable, keep the local app working and explain that another host needs equivalent private identity headers and a D1 compatible database. Do not claim a Codex subscription guarantees Sites access.

## Twitch connection

1. Read the current official Twitch authentication, app registration, token validation, and Clips documentation before making integration claims.

2. Run `npm run setup:check` after deployment and use the exact callback it prints.

3. Help the person create their own Twitch Developer application. Twitch requires two factor authentication for developer app registration.

4. Pause only when the person must sign in, complete two factor authentication, enter a credential, or authorize Twitch.

5. The current app requests only `clips:edit`. Explain that this permits a user initiated clip request while live.

6. Verify the connected Twitch username shown in the app. Never use example or previous owner data as proof.

7. Verify a real live stream before claiming live detection works. Verify a real returned clip before claiming clip creation works.

## Finish

1. Run `npm run setup:check` again.

2. Report where the Site, D1 data, protected settings, Twitch tokens, and local source live.

3. State what was verified and what still requires a real stream.

4. Give exactly one next action if a human account step remains.

