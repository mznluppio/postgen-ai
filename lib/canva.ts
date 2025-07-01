// lib/canva.ts
import { randomBytes, createHash } from "crypto";

export const CANVA_AUTH_URL = "https://www.canva.com/api/oauth/authorize";
export const CANVA_TOKEN_URL = "https://api.canva.com/rest/v1/oauth/token";
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
  console.log("🛠️ PKCE verifier:", verifier);
  console.log("🛠️ PKCE challenge:", challenge);

  const clientId = process.env.CANVA_CLIENT_ID!;
  const redirect = process.env.CANVA_REDIRECT_URI!;
  const scope =
    "brandtemplate:content:read profile:read folder:permission:write asset:write asset:read app:write " +
    "brandtemplate:meta:read app:read design:content:read folder:write comment:write folder:read " +
    "design:permission:read design:meta:read design:content:write folder:permission:read " +
    "design:permission:write comment:read";

  const params = new URLSearchParams({
    response_type: "code",
    client_id: clientId,
    redirect_uri: redirect,
    scope,
    code_challenge: challenge,
    code_challenge_method: "s256", // <–– en minuscule
  });

  return {
    url: `${CANVA_AUTH_URL}?${params.toString()}`,
    verifier,
  };
}

export async function exchangeCanvaCode(code: string, verifier: string) {
  console.log("🛠️ Exchange code with verifier:", verifier);
  const params = new URLSearchParams({
    grant_type: "authorization_code",
    code,
    redirect_uri: process.env.CANVA_REDIRECT_URI!,
    client_id: process.env.CANVA_CLIENT_ID!,
    client_secret: process.env.CANVA_CLIENT_SECRET!,
    code_verifier: verifier,
  });

  const res = await fetch(CANVA_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: params.toString(),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(
      `Canva token exchange failed: HTTP ${res.status} – ${errText}`,
    );
  }

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
    body: JSON.stringify({
      template_id: "social-square",
      data,
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(
      `Canva design creation failed: HTTP ${res.status} – ${errText}`,
    );
  }

  return res.json();
}
