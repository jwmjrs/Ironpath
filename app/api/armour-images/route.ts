const armourTitles = [
  'Ahrim the Blighted',
  'Dharok the Wretched',
  'Guthan the Infested',
  'Karil the Tainted',
  'Torag the Corrupted',
  'Verac the Defiled',
  'Crystal armour',
  'Anima core of Seren armour',
  'Trimmed masterwork armour',
  'Custom-fit trimmed masterwork armour',
  'Cryptbloom armour',
  'Achto armour',
  'Vestments of Havoc',
  'Elite tectonic armour',
  'Elite dracolich armour',
  'Deathwarden robe armour',
  'Deathdealer robe armour',
  "First Necromancer's equipment",
];

// Set pages often have no representative thumbnail. Use a real body piece
// from that set instead of a guessed set filename or an unrelated image.
const representativePieces: Record<string, string> = {
  'Crystal armour': 'Crystal body',
  'Anima core of Seren armour': 'Anima core body of Seren',
  'Trimmed masterwork armour': 'Trimmed masterwork platebody',
  'Custom-fit trimmed masterwork armour': 'Custom-fit trimmed masterwork platebody',
  'Cryptbloom armour': 'Cryptbloom top',
  'Achto armour': 'Achto Teralith cuirass',
  'Vestments of Havoc': 'Vestments of havoc robe top',
  'Elite tectonic armour': 'Elite tectonic robe top',
  'Elite dracolich armour': 'Elite dracolich body',
  'Deathwarden robe armour': 'Deathwarden robe top (tier 90)',
  'Deathdealer robe armour': 'Deathdealer robe top (tier 90)',
  "First Necromancer's equipment": 'Robe top of the First Necromancer',
};

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
      piprop: 'thumbnail|original',
      pilicense: 'any',
      pithumbsize: '240',
      titles: [...armourTitles, ...Object.values(representativePieces)].join('|'),
    });
    const response = await fetch(`https://runescape.wiki/api.php?${params}`, {
      headers: { 'user-agent': 'Ironpath/1.0 (Group Ironman companion)' },
      signal: AbortSignal.timeout(8000),
    });
    if (!response.ok) throw new Error('RuneScape Wiki request failed');
    const result = (await response.json()) as {
      query?: { pages?: Record<string, { title?: string; thumbnail?: { source?: string }; original?: { source?: string } }>; redirects?: { from: string; to: string }[]; normalized?: { from: string; to: string }[] };
    };
    const images = Object.values(result.query?.pages || {}).reduce<Record<string, string>>(
      (all, page) => {
        const image = page.thumbnail?.source || page.original?.source;
        if (page.title && image) all[page.title] = image;
        return all;
      },
      {},
    );
    // MediaWiki returns canonical titles, which can differ from the request.
    for (const alias of [...(result.query?.redirects || []), ...(result.query?.normalized || [])]) {
      if (images[alias.to]) images[alias.from] = images[alias.to];
    }
    for (const [set, piece] of Object.entries(representativePieces)) {
      if (!images[set] && images[piece]) images[set] = images[piece];
    }
    cached = {
      images: { ...images, ...featuredImages },
      expires: Date.now() + 21_600_000,
    };
    return Response.json(cached, { headers: { 'Cache-Control': 'no-store' } });
  } catch {
    return Response.json({ images: {} });
  }
}
