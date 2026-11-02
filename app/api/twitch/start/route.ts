import { cookies } from "next/headers";
import { chatGPTSignInPath, getChatGPTUser } from "../../../chatgpt-auth";
import { sign } from "../../../../lib/crypto";
import { runtimeValue } from "../../../../lib/runtime";

export async function GET(request: Request) {
  const user = await getChatGPTUser();
  if (!user) return Response.redirect(new URL(chatGPTSignInPath("/"), request.url));

  const clientId = runtimeValue("TWITCH_CLIENT_ID");
  const appUrl = runtimeValue("APP_URL");
  if (!clientId || !appUrl) return Response.redirect(new URL("/?twitch=setup", request.url));

  const nonce = crypto.randomUUID();
  const state = await sign(user.userId + ":" + nonce);
  (await cookies()).set("pip_twitch_oauth_state", state, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: 600,
  });

  const url = new URL("https://id.twitch.tv/oauth2/authorize");
  url.search = new URLSearchParams({
    client_id: clientId,
    redirect_uri: appUrl + "/api/twitch/callback",
    response_type: "code",
    scope: "clips:edit",
    state,
  }).toString();
  return Response.redirect(url);
}
