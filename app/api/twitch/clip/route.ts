import { getChatGPTUser } from "../../../chatgpt-auth";
import { createTwitchClip, syncLiveStatus } from "../../../../lib/twitch";

export async function POST() {
  const user = await getChatGPTUser();
  if (!user) return Response.json({ error: "Sign in required" }, { status: 401 });
  const status = await syncLiveStatus(user.userId);
  if (!status.connected || !status.live) {
    return Response.json({ error: "A verified live stream is required" }, { status: 409 });
  }
  try {
    const clip = await createTwitchClip(user.userId);
    return Response.json({ ok: true, clip });
  } catch {
    return Response.json({ error: "Twitch could not create the clip" }, { status: 502 });
  }
}
