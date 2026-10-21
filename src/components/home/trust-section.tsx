import { ClockIcon, HandIcon, PenIcon, ReceiptIcon, SparkIcon } from "@/components/ui/icons";

/**
 * Reassurance limited to what the site actually does: arrival checks from
 * maker lead times, maker details and structured order requests.
 */
const points = [
  {
    icon: SparkIcon,
    title: "Ideas are labelled as ideas",
    body: "When we don't stock what fits, we suggest it as a gift idea, with no invented prices, sellers or buy buttons.",
  },
  {
    icon: PenIcon,
    title: "Personalisation you can check",
    body: "Only the options a product supports are shown, with any extra cost and added time listed before you send a request.",
  },
  {
    icon: HandIcon,
    title: "Know who made it",
    body: "Every catalogue gift names its maker and where they work. Makers in this demo are sample profiles.",
  },
  {
    icon: ClockIcon,
    title: "Delivery checked only with data",
    body: "Catalogue gifts get an arrival estimate only when you give a Mumbai area or PIN and a date, using sample maker lead times. We don't promise delivery slots.",
  },
  {
    icon: ReceiptIcon,
    title: "A clear order, not a DM thread",
    body: "Your request goes to the maker as one structured message: gift, personalisation, date and address. You track it on a status page.",
  },
];

export function TrustSection() {
  return (
    <section aria-labelledby="trust-title" className="border-t border-linen">
      <div className="page-container py-16 lg:py-20">
        <h2 id="trust-title" className="sr-only">
          Ordering with GIFTWALA
        </h2>
        <ul className="grid gap-10 sm:grid-cols-2 lg:grid-cols-5 lg:gap-6">
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
