import { ClockIcon, HandIcon, PenIcon, ReceiptIcon } from "@/components/ui/icons";

/**
 * Reassurance limited to what the product data actually supports: we show
 * maker details, dispatch times and return rules per product, and never
 * promise delivery dates.
 */
const points = [
  {
    icon: PenIcon,
    title: "Personalisation you can check",
    body: "Only the options a product supports are shown, with any extra cost and added time listed before you add it to your cart.",
  },
  {
    icon: HandIcon,
    title: "Know who made it",
    body: "Every gift names its maker and where they work, with a profile to read more.",
  },
  {
    icon: ClockIcon,
    title: "Honest dispatch times",
    body: "Each product lists how long its maker needs to prepare it. Personalised items can take a little longer, and we say so.",
  },
  {
    icon: ReceiptIcon,
    title: "Clear return rules",
    body: "Return eligibility is shown on each product. Fresh flowers, food and personalised items usually can't be returned.",
  },
];

export function TrustSection() {
  return (
    <section aria-labelledby="trust-title" className="border-t border-linen">
      <div className="page-container py-16 lg:py-20">
        <h2 id="trust-title" className="sr-only">
          Ordering with GIFTWALA
        </h2>
        <ul className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
          {points.map(({ icon: Icon, title, body }) => (
            <li key={title}>
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-blush text-burgundy">
                <Icon />
              </span>
              <p className="mt-4 font-medium">{title}</p>
              <p className="mt-1.5 text-sm text-muted">{body}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
