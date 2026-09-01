const armourTitles = [
  'Ahrim the Blighted',
  'Dharok the Wretched',
  'Guthan the Infested',
  'Karil the Tainted',
  'Torag the Corrupted',
  'Verac the Defiled',
  'Crystal armour',
  'Anima Core of Seren',
  'Trimmed masterwork armour',
  'Custom-fit trimmed masterwork armour',
  'Cryptbloom armour',
  'Achto armour',
  'Vestments of Havoc',
  'Elite tectonic armour',
  'Elite Dracolich armour',
  'Deathwarden robe armour',
  'Deathdealer robe armour',
  "First Necromancer's equipment",
];

let cached: { expires: number; images: Record<string, string> } | null = null;

const featuredImages: Record<string, string> = {
  'Guthan the Infested':
    'https://runescape.wiki/images/thumb/Guthan_the_Infested.png/160px-Guthan_the_Infested.png?f4033',
};

export async function GET() {
  try {
    if (cached && cached.expires > Date.now()) {
      return Response.json(
        { ...cached, images: { ...cached.images, ...featuredImages } },
        { headers: { 'Cache-Control': 'no-store' } },
      );
    }
    const params = new URLSearchParams({
      action: 'query',
      format: 'json',
      redirects: '1',
      prop: 'pageimages',
      piprop: 'thumbnail',
      pithumbsize: '240',
      titles: armourTitles.join('|'),
    });
    const response = await fetch(`https://runescape.wiki/api.php?${params}`, {
      headers: { 'user-agent': 'Ironpath/1.0 (Group Ironman companion)' },
    });
    if (!response.ok) throw new Error('RuneScape Wiki request failed');
    const result = (await response.json()) as {
      query?: { pages?: Record<string, { title?: string; thumbnail?: { source?: string } }> };
    };
    const images = Object.values(result.query?.pages || {}).reduce<Record<string, string>>(
      (all, page) => {
        if (page.title && page.thumbnail?.source) all[page.title] = page.thumbnail.source;
        return all;
      },
      {},
    );
    cached = {
      images: { ...images, ...featuredImages },
      expires: Date.now() + 21_600_000,
    };
    return Response.json(cached, { headers: { 'Cache-Control': 'no-store' } });
  } catch {
    return Response.json({ images: {} });
  }
}
