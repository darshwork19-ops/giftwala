"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import {
  INDIAN_STATES,
  summariseCart,
  validateBilling,
  validateContact,
  validateDelivery,
  type BillingDetails,
  type CartSummary,
  type ContactDetails,
  type DeliveryDetails,
  type Errors,
} from "@/lib/checkout";
import { saveCheckoutDraft, useCart, useCheckoutDraft, type CheckoutDraft } from "@/lib/cart";
import { allAreaNames, findArea, zoneLabels } from "@/lib/finder/areas";
import { formatShortDate } from "@/lib/finder/dates";
import type { Profile } from "@/lib/profile";
import { routes } from "@/lib/routes";
import { ArrowRightIcon } from "@/components/ui/icons";
import { CheckoutSteps, Field, Redirect, fieldClass, OrderSummary, PageTitle, primaryPill, Skeleton, useRequireProfile, useToday } from "./shared";

export function AddressStep() {
  const profile = useRequireProfile();
  const lines = useCart();
  const draft = useCheckoutDraft();
  const today = useToday();

  if (!profile || lines === undefined || !draft || !today) return <Skeleton />;
  const cart = summariseCart(lines, today);
  if (cart.lines.length === 0 || cart.zones.length === 0) return <Redirect to={routes.cart} />;
  return <AddressForm cart={cart} draft={draft} profile={profile} />;
}

function AddressForm({ cart, draft, profile }: { cart: CartSummary; draft: CheckoutDraft; profile: Profile }) {
  const router = useRouter();
  const [contact, setContact] = useState<ContactDetails>(
    draft.contact ?? { name: profile.name, email: profile.email, phone: profile.phone },
  );
  const [delivery, setDelivery] = useState<DeliveryDetails>({
    ...draft.delivery,
    recipientName: draft.delivery.recipientName,
    // A date earlier than the order can arrive is cleared rather than kept
    deliverBy: draft.delivery.deliverBy && cart.earliest && draft.delivery.deliverBy < cart.earliest ? "" : draft.delivery.deliverBy,
  });
  const [billing, setBilling] = useState<BillingDetails>(draft.billing);
  const [errors, setErrors] = useState<Errors>({});

  const d = (key: keyof DeliveryDetails) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setDelivery((v) => ({ ...v, [key]: e.target.value }));
  const b = (key: keyof BillingDetails) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setBilling((v) => ({ ...v, [key]: e.target.value }));
  const c = (key: keyof ContactDetails) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setContact((v) => ({ ...v, [key]: e.target.value }));

  // Only areas every maker in the cart delivers to
  const areaOptions = allAreaNames.filter((a) => {
    const m = findArea(a);
    return m && cart.zones.includes(m.zone);
  });

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    const found = { ...validateContact(contact), ...validateDelivery(delivery, cart), ...validateBilling(billing) };
    setErrors(found);
    const first = Object.keys(found)[0];
    if (first) {
      document.getElementById(`co-${first}`)?.focus();
      return;
    }
    saveCheckoutDraft({ contact, delivery, billing });
    router.push(routes.checkoutReview);
  }

  const err = (k: string) => errors[k];
  const inv = (k: string) => Boolean(errors[k]);

  return (
    <>
      <CheckoutSteps current={1} />
      <div className="mt-8">
        <PageTitle title="Where should it" accent="go?" />
      </div>
      <form onSubmit={onSubmit} noValidate className="mt-10 grid gap-10 lg:grid-cols-[1fr_22rem] lg:gap-14">
        <div className="space-y-12">
          <fieldset>
            <legend className="font-serif text-2xl">Your details</legend>
            <p className="mt-1 text-sm text-muted">For the order confirmation and delivery updates.</p>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <Field id="contact-name" label="Your name" error={err("contact-name")} className="sm:col-span-2">
                <input id="co-contact-name" className={fieldClass} value={contact.name} onChange={c("name")} autoComplete="name" aria-invalid={inv("contact-name")} />
              </Field>
              <Field id="contact-email" label="Email" error={err("contact-email")}>
                <input id="co-contact-email" type="email" inputMode="email" className={fieldClass} value={contact.email} onChange={c("email")} autoComplete="email" aria-invalid={inv("contact-email")} />
              </Field>
              <Field id="contact-phone" label="Mobile number" error={err("contact-phone")}>
                <input id="co-contact-phone" type="tel" inputMode="tel" className={fieldClass} value={contact.phone} onChange={c("phone")} autoComplete="tel" aria-invalid={inv("contact-phone")} />
              </Field>
            </div>
          </fieldset>

          <fieldset>
            <legend className="font-serif text-2xl">Delivery address</legend>
            <p className="mt-1 text-sm text-muted">
              The makers in your cart deliver to {cart.zones.map((z) => zoneLabels[z]).join(", ")}.
            </p>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <Field id="recipientName" label="Recipient's name" error={err("recipientName")}>
                <input id="co-recipientName" className={fieldClass} value={delivery.recipientName} onChange={d("recipientName")} autoComplete="off" aria-invalid={inv("recipientName")} />
              </Field>
              <Field id="recipientPhone" label="Recipient's mobile (optional)" hint="Only for the delivery partner." error={err("recipientPhone")}>
                <input id="co-recipientPhone" type="tel" inputMode="tel" className={fieldClass} value={delivery.recipientPhone} onChange={d("recipientPhone")} autoComplete="off" aria-invalid={inv("recipientPhone")} />
              </Field>
              <Field id="line1" label="Flat, house no., building" error={err("line1")} className="sm:col-span-2">
                <input id="co-line1" className={fieldClass} value={delivery.line1} onChange={d("line1")} autoComplete="address-line1" aria-invalid={inv("line1")} />
              </Field>
              <Field id="line2" label="Street, road (optional)" className="sm:col-span-2">
                <input id="co-line2" className={fieldClass} value={delivery.line2} onChange={d("line2")} autoComplete="address-line2" />
              </Field>
              <Field id="landmark" label="Landmark (optional)" className="sm:col-span-2">
                <input id="co-landmark" className={fieldClass} value={delivery.landmark} onChange={d("landmark")} placeholder="e.g. opposite the station" />
              </Field>
              <Field id="area" label="Area" error={err("area")}>
                <select id="co-area" className={fieldClass} value={delivery.area} onChange={d("area")} aria-invalid={inv("area")}>
                  <option value="">Choose an area</option>
                  {areaOptions.map((a) => <option key={a} value={a}>{a}</option>)}
                </select>
              </Field>
              <Field id="pin" label="PIN code" error={err("pin")}>
                <input id="co-pin" inputMode="numeric" maxLength={6} className={fieldClass} value={delivery.pin} onChange={d("pin")} autoComplete="postal-code" placeholder="400053" aria-invalid={inv("pin")} />
              </Field>
              <Field id="deliverBy" label="Arrive by" error={err("deliverBy")} className="sm:col-span-2"
                hint={cart.earliest ? `Earliest possible for this cart: ${formatShortDate(cart.earliest)} (sample lead times).` : undefined}>
                <input id="co-deliverBy" type="date" min={cart.earliest} className={fieldClass} value={delivery.deliverBy} onChange={d("deliverBy")} aria-invalid={inv("deliverBy")} />
              </Field>
            </div>
          </fieldset>

          <fieldset>
            <legend className="font-serif text-2xl">Billing address</legend>
            <label className="mt-4 flex cursor-pointer items-center gap-3 text-sm">
              <input type="checkbox" checked={billing.sameAsDelivery}
                onChange={(e) => setBilling((v) => ({ ...v, sameAsDelivery: e.target.checked }))}
                className="h-5 w-5 accent-burgundy" />
              Same as the delivery address
            </label>
            {!billing.sameAsDelivery && (
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <Field id="billing-name" label="Name on the bill" error={err("billing-name")} className="sm:col-span-2">
                  <input id="co-billing-name" className={fieldClass} value={billing.name} onChange={b("name")} autoComplete="billing name" aria-invalid={inv("billing-name")} />
                </Field>
                <Field id="billing-line1" label="Flat, house no., building" error={err("billing-line1")} className="sm:col-span-2">
                  <input id="co-billing-line1" className={fieldClass} value={billing.line1} onChange={b("line1")} autoComplete="billing address-line1" aria-invalid={inv("billing-line1")} />
                </Field>
                <Field id="billing-line2" label="Street, road (optional)" className="sm:col-span-2">
                  <input id="co-billing-line2" className={fieldClass} value={billing.line2} onChange={b("line2")} autoComplete="billing address-line2" />
                </Field>
                <Field id="billing-city" label="City" error={err("billing-city")}>
                  <input id="co-billing-city" className={fieldClass} value={billing.city} onChange={b("city")} autoComplete="billing address-level2" aria-invalid={inv("billing-city")} />
                </Field>
                <Field id="billing-state" label="State" error={err("billing-state")}>
                  <select id="co-billing-state" className={fieldClass} value={billing.state} onChange={b("state")} aria-invalid={inv("billing-state")}>
                    <option value="">Choose a state</option>
                    {INDIAN_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </Field>
                <Field id="billing-pin" label="PIN code" error={err("billing-pin")}>
                  <input id="co-billing-pin" inputMode="numeric" maxLength={6} className={fieldClass} value={billing.pin} onChange={b("pin")} autoComplete="billing postal-code" aria-invalid={inv("billing-pin")} />
                </Field>
              </div>
            )}
          </fieldset>
        </div>

        <OrderSummary cart={cart}>
          <button type="submit" className={`${primaryPill} mt-6 w-full`}>
            Review order <ArrowRightIcon width={16} height={16} />
          </button>
          <p className="mt-3 text-xs text-muted">Your addresses are saved in this browser for next time.</p>
        </OrderSummary>
      </form>
    </>
  );
}
