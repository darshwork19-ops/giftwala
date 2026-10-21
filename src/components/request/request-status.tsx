"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { formatShortDate } from "@/lib/finder/dates";
import { formatPrice } from "@/lib/format";
import {
  orderMessage,
  updateStatus,
  useOrderRequests,
  type OrderRequest,
  type RequestStatus,
} from "@/lib/order-requests";
import { routes } from "@/lib/routes";
import { Button, ButtonLink } from "@/components/ui/button";

const STEPS: { status: RequestStatus; title: string; body: string }[] = [
  { status: "ready", title: "Request ready", body: "Your order details are written up for the maker." },
  { status: "sent", title: "Sent to the maker", body: "You sent the request on WhatsApp or by email." },
  { status: "confirmed", title: "Maker confirmed", body: "The maker replied that they can deliver by your date." },
];

export function RequestStatusView() {
  const ref = useSearchParams().get("ref");
  const requests = useOrderRequests();

  if (!ref) return <RequestList requests={requests} />;
  const request = requests.find((r) => r.ref === ref);
  if (!request) {
    return (
      <div className="rounded-lg border border-linen bg-white p-6">
        <h1 className="font-serif text-3xl">We can&apos;t find request {ref}</h1>
        <p className="mt-2 text-muted">
          Requests are saved in the browser they were made in. Open this page on the same device, or make a new
          request.
        </p>
        <ButtonLink href={routes.giftFinder} className="mt-5">Find a gift</ButtonLink>
      </div>
    );
  }
  return <RequestDetail request={request} />;
}

function RequestDetail({ request }: { request: OrderRequest }) {
  const [copy, setCopy] = useState<"idle" | "copied" | "failed">("idle");
  const message = orderMessage(request);
  const stepIndex = STEPS.findIndex((s) => s.status === request.status);
  const whatsapp = `https://wa.me/?text=${encodeURIComponent(message)}`;
  const email = `mailto:?subject=${encodeURIComponent(`GIFTWALA order request ${request.ref}`)}&body=${encodeURIComponent(message)}`;

  const markSent = (channel: string) => {
    if (request.status === "ready") updateStatus(request.ref, "sent", channel);
  };
  const copyMessage = async () => {
    try {
      await navigator.clipboard.writeText(message);
      setCopy("copied");
    } catch {
      setCopy("failed");
    }
  };

  return (
    <div className="grid gap-10 lg:grid-cols-[3fr_2fr] lg:gap-14">
      <div>
        <p className="eyebrow mb-3">Order request {request.ref}</p>
        <h1 className="font-serif text-4xl leading-tight tracking-tight">{request.productName}</h1>
        <p className="mt-2 text-muted">
          From {request.makerName}, arriving by {formatShortDate(request.deliverBy)} for {request.recipientName}.
        </p>

        <ol className="mt-8 space-y-0" aria-label="Request status">
          {STEPS.map((step, i) => {
            const done = i <= stepIndex;
            const entry = request.history.find((h) => h.status === step.status);
            return (
              <li key={step.status} className="relative flex gap-4 pb-6 last:pb-0">
                {i < STEPS.length - 1 && (
                  <span aria-hidden="true" className={`absolute top-7 left-[13px] h-full w-px ${i < stepIndex ? "bg-sage" : "bg-linen"}`} />
                )}
                <span
                  aria-hidden="true"
                  className={`relative z-10 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-xs font-semibold ${
                    done ? "border-sage bg-sage text-white" : "border-linen bg-white text-muted"
                  }`}
                >
                  {done ? "✓" : i + 1}
                </span>
                <div>
                  <p className={`font-medium ${done ? "" : "text-muted"}`}>
                    {step.title}
                    <span className="sr-only">{done ? " (done)" : " (not yet)"}</span>
                  </p>
                  <p className="text-sm text-muted">{step.body}</p>
                  {entry && (
                    <p className="mt-0.5 text-xs text-muted">
                      {new Date(entry.at).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}
                      {entry.note ? ` · ${entry.note}` : ""}
                    </p>
                  )}
                </div>
              </li>
            );
          })}
        </ol>

        <div className="mt-8 rounded-lg border border-linen bg-white p-5">
          {request.status === "ready" && (
            <>
              <h2 className="font-serif text-xl">Send it to the maker</h2>
              <p className="mt-1 text-sm text-muted">
                Sample makers have no real contact details, so WhatsApp and email open with the message ready and
                you choose who to send it to.
              </p>
              <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                <ButtonLink href={whatsapp} target="_blank" rel="noopener noreferrer" onClick={() => markSent("WhatsApp")}>
                  Send on WhatsApp
                </ButtonLink>
                <ButtonLink href={email} variant="secondary" onClick={() => markSent("Email")}>
                  Send by email
                </ButtonLink>
                <Button variant="secondary" onClick={copyMessage}>
                  {copy === "copied" ? "Copied" : "Copy message"}
                </Button>
              </div>
              {copy === "failed" && (
                <p role="alert" className="mt-3 text-sm text-berry">
                  Your browser blocked copying. Select the message on this page and copy it instead.
                </p>
              )}
              <button
                type="button"
                onClick={() => markSent("Sent another way")}
                className="mt-4 text-sm text-muted underline underline-offset-4 hover:text-burgundy"
              >
                I&apos;ve sent it another way
              </button>
            </>
          )}
          {request.status === "sent" && (
            <>
              <h2 className="font-serif text-xl">Waiting for the maker</h2>
              <p className="mt-1 text-sm text-muted">
                When {request.makerName} replies that they can deliver by {formatShortDate(request.deliverBy)}, mark it
                confirmed here.
              </p>
              <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                <Button onClick={() => updateStatus(request.ref, "confirmed")}>Maker confirmed</Button>
                <ButtonLink href={whatsapp} variant="secondary" target="_blank" rel="noopener noreferrer">
                  Send again
                </ButtonLink>
              </div>
            </>
          )}
          {request.status === "confirmed" && (
            <p className="flex items-center gap-2 font-medium text-sage">
              <span aria-hidden="true">✓</span> Confirmed. Agree payment with {request.makerName} directly.
            </p>
          )}
        </div>
        <p className="mt-4 text-xs text-muted">
          Demo: this status is saved only in this browser and updated by you. No payment has been taken.
        </p>
      </div>

      <aside>
        <h2 className="font-serif text-xl">The message the maker gets</h2>
        <pre className="mt-3 rounded-lg border border-linen bg-white p-4 font-sans text-sm leading-relaxed whitespace-pre-wrap">
          {message}
        </pre>
        <dl className="mt-4 text-sm">
          <div className="flex justify-between border-t border-linen py-2">
            <dt>Total</dt>
            <dd className="font-semibold">{formatPrice(request.total)}</dd>
          </div>
        </dl>
        <Link href={routes.requests} className="text-sm text-burgundy underline-offset-4 hover:underline">
          All your requests
        </Link>
      </aside>
    </div>
  );
}

function RequestList({ requests }: { requests: OrderRequest[] }) {
  return (
    <div>
      <p className="eyebrow mb-3">Your requests</p>
      <h1 className="font-serif text-4xl tracking-tight">Order requests</h1>
      {requests.length === 0 ? (
        <div className="mt-6 rounded-lg border border-linen bg-white p-6">
          <p className="text-muted">No requests yet. Find a gift and request it to see it here.</p>
          <ButtonLink href={routes.giftFinder} className="mt-5">Find their perfect gift</ButtonLink>
        </div>
      ) : (
        <ul className="mt-6 divide-y divide-linen rounded-lg border border-linen bg-white">
          {requests.map((r) => (
            <li key={r.ref}>
              <Link href={routes.requestStatus(r.ref)} className="flex flex-col gap-1 p-4 hover:bg-blush/50 sm:flex-row sm:items-center sm:justify-between">
                <span>
                  <span className="font-medium">{r.productName}</span>
                  <span className="text-sm text-muted"> · {r.ref} · for {r.recipientName}</span>
                </span>
                <span className="text-sm">
                  {STEPS.find((s) => s.status === r.status)?.title} · by {formatShortDate(r.deliverBy)}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
      <p className="mt-4 text-xs text-muted">Saved in this browser only.</p>
    </div>
  );
}
