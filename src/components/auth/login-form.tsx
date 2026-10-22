"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, type FormEvent } from "react";
import { todayInIndia } from "@/lib/finder/dates";
import { safeNext, saveProfile, signOut, useProfile } from "@/lib/profile";
import { ArrowRightIcon } from "@/components/ui/icons";

const PHONE = /^(\+?91)?[6-9]\d{9}$/;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const MIN_AGE = 13;

const fieldClass =
  "h-12 w-full rounded-full border border-charcoal/15 bg-white px-5 text-[0.95rem] placeholder:text-muted/70 focus:border-burgundy focus:outline-none aria-[invalid=true]:border-berry";

type Fields = { name: string; email: string; phone: string; dob: string; anniversary: string };

export function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const next = safeNext(params.get("next"));
  const profile = useProfile();
  const [fields, setFields] = useState<Fields>({ name: "", email: "", phone: "", dob: "", anniversary: "" });
  const [errors, setErrors] = useState<Partial<Record<keyof Fields, string>>>({});
  const set = (key: keyof Fields) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setFields((f) => ({ ...f, [key]: e.target.value }));

  // Waiting for the browser to say whether someone is signed in
  if (profile === undefined) return <div className="h-96 animate-pulse rounded-[1.25rem] bg-linen/60" />;

  if (profile) {
    return (
      <div>
        <h1 className="font-serif text-4xl leading-tight tracking-tight sm:text-5xl">
          Welcome back, <span className="text-burgundy italic">{profile.name.split(" ")[0]}</span>.
        </h1>
        <p className="mt-4 text-muted">
          Signed in as {profile.email} · {profile.phone}
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link
            href={next}
            className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-burgundy px-6 text-sm font-medium text-white transition-colors hover:bg-burgundy-hover"
          >
            Continue <ArrowRightIcon width={16} height={16} />
          </Link>
          <button
            type="button"
            onClick={signOut}
            className="inline-flex h-12 items-center justify-center rounded-full border border-charcoal/20 px-6 text-sm font-medium transition-colors hover:border-burgundy hover:text-burgundy"
          >
            Sign out
          </button>
        </div>
      </div>
    );
  }

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    const today = todayInIndia();
    const [y, m, d] = today.split("-");
    const latestDob = `${Number(y) - MIN_AGE}-${m}-${d}`;
    const e: typeof errors = {};
    if (fields.name.trim().length < 2) e.name = "Add your name.";
    if (!EMAIL.test(fields.email.trim())) e.email = "Add a valid email address.";
    if (!PHONE.test(fields.phone.replace(/[\s-]/g, ""))) e.phone = "Add a 10-digit Indian mobile number.";
    if (!fields.dob) e.dob = "Add your date of birth.";
    else if (fields.dob > latestDob) e.dob = `You need to be at least ${MIN_AGE} to sign in.`;
    if (fields.anniversary && fields.anniversary > today) e.anniversary = "An anniversary date can't be in the future.";
    setErrors(e);
    const first = Object.keys(e)[0];
    if (first) {
      document.getElementById(`login-${first}`)?.focus();
      return;
    }
    saveProfile({
      name: fields.name.trim(),
      email: fields.email.trim().toLowerCase(),
      phone: fields.phone.replace(/[\s-]/g, ""),
      dob: fields.dob,
      anniversary: fields.anniversary || undefined,
      createdAt: new Date().toISOString(),
    });
    router.replace(next);
  }

  const today = todayInIndia();

  return (
    <div>
      <p className="mb-4 text-sm tracking-wide text-muted">Sign in to GIFTWALA</p>
      <h1 className="font-serif text-4xl leading-[1.05] tracking-tight sm:text-5xl">
        A few details, <span className="text-burgundy italic">then the good part.</span>
      </h1>
      <p className="mt-4 max-w-md text-muted">
        Sign in to add gifts, build a box and keep track of your requests.
      </p>

      <button
        type="button"
        disabled
        aria-describedby="google-soon"
        className="mt-8 inline-flex h-12 w-full cursor-not-allowed items-center justify-center gap-3 rounded-full border border-charcoal/15 bg-white text-sm font-medium text-charcoal/60"
      >
        <span aria-hidden="true" className="font-serif text-lg">G</span>
        Continue with Google
        <span id="google-soon" className="rounded-full bg-linen px-2 py-0.5 text-[0.7rem] text-muted">
          Coming soon
        </span>
      </button>

      <div className="my-6 flex items-center gap-4 text-xs text-muted" aria-hidden="true">
        <span className="h-px flex-1 bg-linen" />
        or sign in with your details
        <span className="h-px flex-1 bg-linen" />
      </div>

      <form onSubmit={onSubmit} noValidate className="grid gap-4 sm:grid-cols-2">
        <Field id="name" label="Full name" error={errors.name} className="sm:col-span-2">
          <input id="login-name" className={fieldClass} value={fields.name} onChange={set("name")} autoComplete="name" aria-invalid={Boolean(errors.name)} />
        </Field>
        <Field id="email" label="Email address" error={errors.email}>
          <input id="login-email" type="email" inputMode="email" className={fieldClass} value={fields.email} onChange={set("email")} autoComplete="email" placeholder="you@example.com" aria-invalid={Boolean(errors.email)} />
        </Field>
        <Field id="phone" label="Mobile number" error={errors.phone}>
          <input id="login-phone" type="tel" inputMode="tel" className={fieldClass} value={fields.phone} onChange={set("phone")} autoComplete="tel" placeholder="98765 43210" aria-invalid={Boolean(errors.phone)} />
        </Field>
        <Field id="dob" label="Date of birth" error={errors.dob}>
          <input id="login-dob" type="date" max={today} className={fieldClass} value={fields.dob} onChange={set("dob")} autoComplete="bday" aria-invalid={Boolean(errors.dob)} />
        </Field>
        <Field id="anniversary" label="Anniversary (optional)" error={errors.anniversary}>
          <input id="login-anniversary" type="date" max={today} className={fieldClass} value={fields.anniversary} onChange={set("anniversary")} aria-invalid={Boolean(errors.anniversary)} />
        </Field>
        <div className="sm:col-span-2">
          <button
            type="submit"
            className="mt-2 inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-burgundy text-sm font-medium text-white transition-colors hover:bg-burgundy-hover"
          >
            Sign in <ArrowRightIcon width={16} height={16} />
          </button>
          <p className="mt-4 text-xs text-muted">
            Demo sign-in: your details are saved only in this browser and aren&apos;t verified or sent anywhere.
          </p>
        </div>
      </form>
    </div>
  );
}

function Field({ id, label, error, className = "", children }: {
  id: string; label: string; error?: string; className?: string; children: React.ReactNode;
}) {
  return (
    <div className={className}>
      <label htmlFor={`login-${id}`} className="mb-1.5 block pl-1 text-sm font-medium">{label}</label>
      {children}
      {error && <p className="mt-1.5 pl-1 text-xs font-medium text-berry" role="alert">{error}</p>}
    </div>
  );
}
