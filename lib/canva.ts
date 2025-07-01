export const CANVA_AUTH_URL = "https://www.canva.com/oauth2/authorize";
export const CANVA_TOKEN_URL = "https://www.canva.com/oauth2/token";
export const CANVA_API_BASE = "https://api.canva.com";

export function getCanvaAuthUrl() {
  const clientId = process.env.CANVA_CLIENT_ID;
  const redirect = process.env.CANVA_REDIRECT_URI;
  const scope = encodeURIComponent("designs:write designs:read");
  return `${CANVA_AUTH_URL}?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(
    redirect || "",
  )}&scope=${scope}`;
}

export async function exchangeCanvaCode(code: string) {
  const res = await fetch(CANVA_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      grant_type: "authorization_code",
      code,
      client_id: process.env.CANVA_CLIENT_ID,
      client_secret: process.env.CANVA_CLIENT_SECRET,
      redirect_uri: process.env.CANVA_REDIRECT_URI,
    }),
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
