/**
 * Stands in for a product photo we don't have permission to show: a calm
 * tile with the shop's name and the kind of product, never a fake image.
 */
export function TextTile({ kicker, title }: { kicker: string; title: string }) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-linen/50 p-6 text-center">
      <span className="text-xs tracking-wide text-muted uppercase">{kicker}</span>
      <span className="font-serif text-2xl leading-snug text-charcoal">{title}</span>
      <span className="text-xs text-muted">Photo on the shop&apos;s site</span>
    </div>
  );
}
