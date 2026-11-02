import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

const requiredVars = ["APP_URL", "APP_SECRET", "TWITCH_CLIENT_ID", "TWITCH_CLIENT_SECRET"];

export function parseVars(source) {
  return Object.fromEntries(source
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith("#") && line.includes("="))
    .map((line) => {
      const split = line.indexOf("=");
      return [line.slice(0, split).trim(), line.slice(split + 1).trim().replace(/^['"]|['"]$/g, "")];
    }));
}

export function isRealValue(value) {
  return Boolean(value && !/replace_|your_|example/i.test(value));
}

export function buildSetupState({ vars, hosting, companionSource }) {
  const configured = Object.fromEntries(requiredVars.map((name) => [name, isRealValue(vars[name])]));
  const appUrl = configured.APP_URL ? vars.APP_URL.replace(/\/$/, "") : null;
  return {
    configured,
    customized: /customized:\s*true/.test(companionSource),
    siteCreated: Boolean(hosting.project_id),
    callback: appUrl ? `${appUrl}/api/twitch/callback` : null,
  };
}

function readIfPresent(path) {
  return existsSync(path) ? readFileSync(path, "utf8") : "";
}

export function runSetupCheck(cwd = process.cwd()) {
  const vars = {
    ...parseVars(readIfPresent(resolve(cwd, ".env.local"))),
    ...parseVars(readIfPresent(resolve(cwd, ".dev.vars"))),
    ...process.env,
  };
  const hosting = JSON.parse(readFileSync(resolve(cwd, ".openai/hosting.json"), "utf8"));
  const companionSource = readFileSync(resolve(cwd, "app/companion.ts"), "utf8");
  const state = buildSetupState({ vars, hosting, companionSource });

  console.log("Personal Pip setup check");
  console.log("");
  console.log(`${state.customized ? "READY" : "TODO "}  Pond companion customized`);
  console.log(`${state.siteCreated ? "READY" : "TODO "}  Private Site created`);
  for (const name of requiredVars) {
    console.log(`${state.configured[name] ? "READY" : "TODO "}  ${name}`);
  }
  console.log("");
  console.log(`Twitch OAuth callback: ${state.callback ?? "Set APP_URL after deployment to calculate this"}`);
  console.log("");
  console.log("Secret values were not printed.");
  return state;
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  runSetupCheck();
}

