import { requireRuntimeValue } from "./runtime";

const encoder = new TextEncoder();
const decoder = new TextDecoder();

function toBase64Url(bytes: Uint8Array) {
  let binary = "";
  bytes.forEach((byte) => { binary += String.fromCharCode(byte); });
  return btoa(binary).replaceAll("+", "-").replaceAll("/", "_").replace(/=+$/g, "");
}

function fromBase64Url(value: string) {
  const padded = value.replaceAll("-", "+").replaceAll("_", "/") + "===".slice((value.length + 3) % 4);
  const binary = atob(padded);
  return Uint8Array.from(binary, (character) => character.charCodeAt(0));
}

async function keyBytes() {
  return new Uint8Array(await crypto.subtle.digest("SHA-256", encoder.encode(requireRuntimeValue("APP_SECRET"))));
}

async function encryptionKey() {
  return crypto.subtle.importKey("raw", await keyBytes(), { name: "AES-GCM" }, false, ["encrypt", "decrypt"]);
}

async function signingKey() {
  return crypto.subtle.importKey("raw", await keyBytes(), { name: "HMAC", hash: "SHA-256" }, false, ["sign", "verify"]);
}

export async function encrypt(value: string) {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const ciphertext = new Uint8Array(await crypto.subtle.encrypt({ name: "AES-GCM", iv }, await encryptionKey(), encoder.encode(value)));
  return toBase64Url(iv) + "." + toBase64Url(ciphertext);
}

export async function decrypt(value: string) {
  const [iv, ciphertext] = value.split(".");
  const plain = await crypto.subtle.decrypt({ name: "AES-GCM", iv: fromBase64Url(iv) }, await encryptionKey(), fromBase64Url(ciphertext));
  return decoder.decode(plain);
}

export async function sign(value: string) {
  const signature = new Uint8Array(await crypto.subtle.sign("HMAC", await signingKey(), encoder.encode(value)));
  return value + "." + toBase64Url(signature);
}

export async function verify(signed: string | undefined) {
  if (!signed) return null;
  const split = signed.lastIndexOf(".");
  if (split < 1) return null;
  const value = signed.slice(0, split);
  const valid = await crypto.subtle.verify("HMAC", await signingKey(), fromBase64Url(signed.slice(split + 1)), encoder.encode(value));
  return valid ? value : null;
}
