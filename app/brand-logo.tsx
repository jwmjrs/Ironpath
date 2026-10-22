/** Shared illustrated lockup; the logo stays consistent with any chosen text font. */
export default function BrandLogo({ subtitle }: { subtitle?: string }) {
  return <span className="ironpath-brand-lockup">
    <img className="ironpath-brand-art" src="/ironpath-zaros-wordmark.png" alt="Ironpath" width={2172} height={724} />
    {subtitle && <span className="ironpath-brand-subtitle">{subtitle}</span>}
  </span>;
}
