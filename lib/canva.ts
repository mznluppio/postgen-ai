import { randomBytes, createHash } from "crypto";

export const CANVA_AUTH_URL = "https://www.canva.com/api/oauth/authorize";
export const CANVA_TOKEN_URL = "https://www.canva.com/oauth2/token";
export const CANVA_API_BASE = "https://api.canva.com";

function base64url(input: Buffer) {
  return input
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

export function generateCanvaAuth() {
  const verifier = base64url(randomBytes(32));
  const challenge = base64url(createHash("sha256").update(verifier).digest());
  const clientId = process.env.CANVA_CLIENT_ID;
  const redirect = process.env.CANVA_REDIRECT_URI;
  const scope =
    "brandtemplate:content:read profile:read folder:permission:write asset:write asset:read app:write brandtemplate:meta:read app:read design:content:read folder:write comment:write folder:read design:permission:read design:meta:read design:content:write folder:permission:read design:permission:write comment:read";
  const url = `${CANVA_AUTH_URL}?code_challenge_method=s256&response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(
    redirect || "",
  )}&scope=${encodeURIComponent(scope)}&code_challenge=${challenge}`;
  return { url, verifier };
}

export async function exchangeCanvaCode(code: string, verifier: string) {
  const res = await fetch(CANVA_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code,
      client_id: process.env.CANVA_CLIENT_ID || "",
      client_secret: process.env.CANVA_CLIENT_SECRET || "",
      redirect_uri: process.env.CANVA_REDIRECT_URI || "",
      code_verifier: verifier,
    }).toString(),
  });
  if (!res.ok) throw new Error("Failed to get Canva token");
  return res.json();
}

export async function createCanvaDesign(
  accessToken: string,
  data: { title: string; content: string },
) {
  const res = await fetch(`${CANVA_API_BASE}/v1/designs`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ template_id: "social-square", data }),
  });
  if (!res.ok) throw new Error("Failed to create Canva design");
  return res.json();
}
