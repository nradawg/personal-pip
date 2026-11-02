import { env } from "cloudflare:workers";

export function runtimeValue(name: string) {
  return (env as unknown as Record<string, string | undefined>)[name] ?? "";
}

export function requireRuntimeValue(name: string) {
  const value = runtimeValue(name);
  if (!value) throw new Error(name + " is not configured");
  return value;
}
