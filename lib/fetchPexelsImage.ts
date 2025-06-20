export async function fetchPexelsImage(prompt: string): Promise<string | null> {
  try {
    // Utiliser une clé API publique ou une URL de fallback
    const apiKey = process.env.NEXT_PUBLIC_PEXELS_API_KEY || 'YOUR_PEXELS_API_KEY';
    
    const response = await fetch(
      `https://api.pexels.com/v1/search?query=${encodeURIComponent(prompt)}&per_page=1&orientation=landscape`,
      {
        headers: {
          Authorization: apiKey,
        },
      },
    );

    if (!response.ok) {
      // Fallback vers des images de placeholder si l'API Pexels échoue
      return `https://picsum.photos/800/600?random=${Math.floor(Math.random() * 1000)}`;
    }

    const data = await response.json();
    return data.photos?.[0]?.src?.large || `https://picsum.photos/800/600?random=${Math.floor(Math.random() * 1000)}`;
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'image:', error);
    // Fallback vers une image placeholder
    return `https://picsum.photos/800/600?random=${Math.floor(Math.random() * 1000)}`;
  }
}