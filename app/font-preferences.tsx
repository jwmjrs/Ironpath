'use client';

import { useEffect, useState } from 'react';

const fontChoices = [
  ['original', 'Original'],
  ['comfortaa', 'Comfortaa'],
  ['quicksand', 'Quicksand'],
  ['nunito', 'Nunito'],
  ['manrope', 'Manrope'],
  ['outfit', 'Outfit'],
] as const;
type FontChoice = (typeof fontChoices)[number][0];
function validFont(value: string | null): value is FontChoice {
  return fontChoices.some(([id]) => id === value);
}

export default function FontPreferences({ inline = false }: { inline?: boolean }) {
  const [font, setFont] = useState<FontChoice>('original');
  useEffect(() => {
    const current = document.documentElement.dataset.font || null;
    if (validFont(current)) setFont(current);
    function sync(event: StorageEvent) {
      if (event.key !== 'ironpath-font' && event.key !== null) return;
      const value = validFont(event.newValue) ? event.newValue : 'original';
      document.documentElement.dataset.font = value;
      setFont(value);
    }
    window.addEventListener('storage', sync);
    return () => window.removeEventListener('storage', sync);
  }, []);
  function changeFont(value: string) {
    if (!validFont(value)) return;
    setFont(value);
    document.documentElement.dataset.font = value;
    try { window.localStorage.setItem('ironpath-font', value); } catch { /* Selection still works for this visit. */ }
  }
  const Wrapper = inline ? 'div' : 'footer';
  return <Wrapper className={inline ? "font-preferences-inline" : "site-font-preferences"} aria-label="Appearance preferences">
    <label className="site-font-control"><span>Font</span><select aria-label="Choose website font" value={font} onChange={event => changeFont(event.target.value)}>{fontChoices.map(([id, label]) => <option value={id} key={id}>{label}</option>)}</select></label>
    {!inline && <span className="site-font-hint">Applies across Ironpath · Saved in this browser</span>}
  </Wrapper>;
}
