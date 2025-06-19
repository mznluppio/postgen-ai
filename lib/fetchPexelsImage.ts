export async function fetchPexelsImage(prompt: string): Promise<string | null> {
  const apiKey = process.env.NEXT_PUBLIC_PEXELS_API_KEY;
  const response = await fetch(
    `https://api.pexels.com/v1/search?query=${encodeURIComponent(prompt)}&per_page=1`,
    {
      headers: {
        Authorization: apiKey!,
      },
    },
  );

  if (!response.ok) return null;

  const data = await response.json();
  return data.photos?.[0]?.src?.large || null;
}
