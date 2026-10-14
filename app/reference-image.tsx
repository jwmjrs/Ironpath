'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { ImageOff } from 'lucide-react';

// Share lookups across repeated cards; a failed request can be retried later.
const lookups = new Map<string, Promise<string | null>>();
let active = 0;
const queue: (() => void)[] = [];
async function limitedLookup(title: string) {
  if (active >= 6) await new Promise<void>(resolve => queue.push(resolve));
  active++;
  try {
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        const response = await fetch(`/api/item-image?item=${encodeURIComponent(title)}`, { signal: AbortSignal.timeout(20000) });
        if (!response.ok) throw new Error('Image lookup unavailable');
        return ((await response.json()) as { image?: string | null }).image || null;
      } catch {
        if (attempt === 2) return null;
        await new Promise(resolve => setTimeout(resolve, 500 * (attempt + 1)));
      }
    }
    return null;
  } finally { active--; queue.shift()?.(); }
}
function lookupImage(title: string) {
  const cached = lookups.get(title);
  if (cached) return cached;
  const request = limitedLookup(title)
    .then(image => {
      if (!image) lookups.delete(title);
      return image;
    }).catch(() => { lookups.delete(title); return null; });
  if (lookups.size >= 500) lookups.delete(lookups.keys().next().value!);
  lookups.set(title, request);
  return request;
}

function ImageAttempt({ src, title, alt, className, fallback, loading = 'lazy' }: {
  src?: string | null;
  title?: string;
  alt: string;
  className?: string;
  fallback?: ReactNode;
  loading?: 'lazy' | 'eager';
}) {
  const [failed, setFailed] = useState(false);
  const [resolved, setResolved] = useState<string | null>(null);
  const [resolvedFailed, setResolvedFailed] = useState(false);
  const [assetRetries, setAssetRetries] = useState(0);
  useEffect(() => {
    if ((src && !failed) || !title) return;
    let cancelled = false;
    void lookupImage(title).then(image => {
      if (!cancelled && image !== src) setResolved(image);
    });
    return () => { cancelled = true; };
  }, [src, title, failed]);
  const current = src && !failed ? src : !resolvedFailed ? resolved : null;
  if (!current) return <span className={`reference-image-fallback ${className || ''}`}
    role={alt ? 'img' : undefined} aria-label={alt ? `${alt}: image unavailable` : undefined}
    aria-hidden={!alt || undefined} title={`${title || alt || 'Reference'}: image unavailable`}>
    {fallback || <ImageOff size={20} />}
  </span>;
  return <img className={className} src={assetRetries && current.startsWith('/api/item-image?') ? `${current}&retry=${assetRetries}` : current} alt={alt} loading={loading}
    decoding="async" onError={() => {
      if (src && !failed) setFailed(true);
      else if (current.startsWith('/api/item-image?') && assetRetries < 2) {
        setTimeout(() => setAssetRetries(value => value + 1), 750);
      } else setResolvedFailed(true);
    }} />;
}

export default function ReferenceImage(props: Parameters<typeof ImageAttempt>[0]) {
  // A different subject gets a fresh attempt, rather than inheriting old failures.
  return <ImageAttempt key={`${props.src || ''}:${props.title || ''}`} {...props} />;
}
