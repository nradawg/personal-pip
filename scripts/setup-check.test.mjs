import assert from "node:assert/strict";
import test from "node:test";
import { buildSetupState, isRealValue, parseVars } from "./setup-check.mjs";

test("variable parser ignores comments and keeps values private", () => {
  assert.deepEqual(parseVars("# local only\nAPP_URL=https://pond.example\nAPP_SECRET='secret value'\n"), {
    APP_URL: "https://pond.example",
    APP_SECRET: "secret value",
  });
});

test("placeholder values are not treated as configured", () => {
  assert.equal(isRealValue("replace_with_your_client_id"), false);
  assert.equal(isRealValue("real-client-id"), true);
});

test("setup state calculates an exact Twitch callback", () => {
  const state = buildSetupState({
    vars: {
      APP_URL: "https://pond.site/",
      APP_SECRET: "a-long-random-value",
      TWITCH_CLIENT_ID: "client-id",
      TWITCH_CLIENT_SECRET: "client-secret",
    },
    hosting: { project_id: "site-id" },
    companionSource: "customized: true",
  });
  assert.equal(state.callback, "https://pond.site/api/twitch/callback");
  assert.equal(state.customized, true);
  assert.equal(state.siteCreated, true);
});

