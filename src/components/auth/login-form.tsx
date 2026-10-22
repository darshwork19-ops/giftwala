"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { todayInIndia } from "@/lib/finder/dates";
import {
  authMode,
  googleSignInEnabled,
  safeNext,
  saveProfile,
  sendEmailCode,
  signInWithGoogle,
  signOut,
  useAuthState,
  verifyEmailCode,
  type Profile,
} from "@/lib/profile";
import { ArrowRightIcon } from "@/components/ui/icons";

const PHONE = /^(\+?91)?[6-9]\d{9}$/;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const MIN_AGE = 13;

const fieldClass =
  "h-12 w-full rounded-full border border-charcoal/15 bg-white px-5 text-[0.95rem] placeholder:text-muted/70 focus:border-burgundy focus:outline-none aria-[invalid=true]:border-berry read-only:bg-linen/40 read-only:text-muted";
const primary =
  "inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-burgundy text-sm font-medium text-white transition-colors hover:bg-burgundy-hover disabled:opacity-60";

export function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const nextParam = params.get("next");
  const next = safeNext(nextParam);
  const auth = useAuthState();

  // Back from Google or the email link with a page to return to: go straight there
  const autoContinue = auth.status === "signed-in" && nextParam !== null;
  useEffect(() => {
    if (autoContinue) router.replace(next);
  }, [autoContinue, next, router]);

  if (auth.status === "loading" || autoContinue) return <div className="h-96 animate-pulse rounded-[1.25rem] bg-linen/60" />;

  if (auth.status === "signed-in") {
    const { profile } = auth;
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
            onClick={() => void signOut()}
            className="inline-flex h-12 items-center justify-center rounded-full border border-charcoal/20 px-6 text-sm font-medium transition-colors hover:border-burgundy hover:text-burgundy"
          >
            Sign out
          </button>
        </div>
      </div>
    );
  }

  if (auth.status === "needs-details") {
    return (
      <div>
        <p className="mb-4 text-sm tracking-wide text-muted">One last step</p>
        <h1 className="font-serif text-4xl leading-[1.05] tracking-tight sm:text-5xl">
          Tell us a little <span className="text-burgundy italic">about you.</span>
        </h1>
        <p className="mt-4 max-w-md text-muted">You&apos;re signed in as {auth.email}. We only ask for these once.</p>
        <DetailsForm
          email={auth.email}
          defaultName={auth.suggestedName}
          submitLabel="Save and continue"
          onSaved={() => router.replace(next)}
        />
        <button type="button" onClick={() => void signOut()} className="mt-6 text-sm text-muted underline underline-offset-4 hover:text-burgundy">
          Use a different account
        </button>
      </div>
    );
  }

  // Signed out
  return (
    <div>
      <p className="mb-4 text-sm tracking-wide text-muted">Sign in to GIFTWALA</p>
      <h1 className="font-serif text-4xl leading-[1.05] tracking-tight sm:text-5xl">
        A few details, <span className="text-burgundy italic">then the good part.</span>
      </h1>
      <p className="mt-4 max-w-md text-muted">Sign in to add gifts, build a box and keep track of your orders.</p>
      {authMode === "supabase" ? (
        <RealSignIn next={next} />
      ) : (
        <>
          <button
            type="button"
            disabled
            aria-describedby="google-soon"
            className="mt-8 inline-flex h-12 w-full cursor-not-allowed items-center justify-center gap-3 rounded-full border border-charcoal/15 bg-white text-sm font-medium text-charcoal/60"
          >
            <span aria-hidden="true" className="font-serif text-lg">G</span>
            Continue with Google
            <span id="google-soon" className="rounded-full bg-linen px-2 py-0.5 text-[0.7rem] text-muted">Coming soon</span>
          </button>
          <div className="my-6 flex items-center gap-4 text-xs text-muted" aria-hidden="true">
            <span className="h-px flex-1 bg-linen" />
            or sign in with your details
            <span className="h-px flex-1 bg-linen" />
          </div>
          <DetailsForm submitLabel="Sign in" onSaved={() => router.replace(next)} />
          <p className="mt-4 text-xs text-muted">
            Demo sign-in: your details are saved only in this browser and aren&apos;t verified or sent anywhere.
          </p>
        </>
      )}
    </div>
  );
}

const RESEND_SECONDS = 60;

/** Google, or a one-time code sent by email (Supabase Auth). */
function RealSignIn({ next }: { next: string }) {
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [step, setStep] = useState<"email" | "code">("email");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string>();
  const [cooldown, setCooldown] = useState(0);
  // Only offer Google once it's switched on in Supabase, so the button never leads to an error page
  const [google, setGoogle] = useState(false);
  useEffect(() => {
    let live = true;
    void googleSignInEnabled().then((on) => live && setGoogle(on));
    return () => {
      live = false;
    };
  }, []);
  // Counts down until another code can be sent
  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  async function startGoogle() {
    setBusy(true);
    const err = await signInWithGoogle(next);
    if (err) {
      setError(err);
      setBusy(false);
    }
  }

  async function sendCode(e?: FormEvent) {
    e?.preventDefault();
    const address = email.trim().toLowerCase();
    if (!EMAIL.test(address)) {
      setError("Add a valid email address.");
      return;
    }
    setBusy(true);
    setError(undefined);
    const err = await sendEmailCode(address);
    setBusy(false);
    if (err) {
      setError(err);
      return;
    }
    setCode("");
    setStep("code");
    setCooldown(RESEND_SECONDS);
    requestAnimationFrame(() => document.getElementById("login-code")?.focus());
  }

  async function checkCode(e: FormEvent) {
    e.preventDefault();
    const digits = code.replace(/\D/g, "");
    if (digits.length < 6) {
      setError("Enter the code from the email.");
      return;
    }
    setBusy(true);
    setError(undefined);
    const err = await verifyEmailCode(email.trim().toLowerCase(), digits);
    // On success the sign-in state changes and this screen is replaced
    if (err) {
      setError(err);
      setBusy(false);
    }
  }

  if (step === "code") {
    return (
      <form onSubmit={checkCode} noValidate className="mt-8">
        <p className="font-serif text-2xl">Enter your code</p>
        <p className="mt-2 text-sm text-muted">
          We emailed a sign-in code to <span className="text-charcoal">{email.trim()}</span>. It can take a minute; check
          spam too.
        </p>
        <label htmlFor="login-code" className="mt-6 mb-1.5 block pl-1 text-sm font-medium">Sign-in code</label>
        <input
          id="login-code"
          inputMode="numeric"
          autoComplete="one-time-code"
          pattern="[0-9]*"
          maxLength={10}
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
          placeholder="123456"
          className={`${fieldClass} text-center font-mono text-xl tracking-[0.4em]`}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? "login-code-error" : undefined}
        />
        {error && <p id="login-code-error" role="alert" className="mt-1.5 pl-1 text-xs font-medium text-berry">{error}</p>}
        <button type="submit" disabled={busy} className={`${primary} mt-4`}>
          {busy ? "Checking…" : "Sign in"} <ArrowRightIcon width={16} height={16} />
        </button>
        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 text-sm">
          <button
            type="button"
            disabled={busy || cooldown > 0}
            onClick={() => void sendCode()}
            className="text-muted underline underline-offset-4 hover:text-burgundy disabled:no-underline disabled:opacity-60"
          >
            {cooldown > 0 ? `Send a new code in ${cooldown}s` : "Send a new code"}
          </button>
          <button
            type="button"
            onClick={() => {
              setStep("email");
              setError(undefined);
            }}
            className="text-muted underline underline-offset-4 hover:text-burgundy"
          >
            Use a different email
          </button>
        </div>
      </form>
    );
  }

  return (
    <>
      {google && (
        <>
          <button
            type="button"
            onClick={startGoogle}
            disabled={busy}
            className="mt-8 inline-flex h-12 w-full items-center justify-center gap-3 rounded-full border border-charcoal/15 bg-white text-sm font-medium transition-colors hover:border-burgundy disabled:opacity-60"
          >
            <span aria-hidden="true" className="font-serif text-lg text-burgundy">G</span>
            Continue with Google
          </button>
          <div className="my-6 flex items-center gap-4 text-xs text-muted" aria-hidden="true">
            <span className="h-px flex-1 bg-linen" />
            or sign in with a code by email
            <span className="h-px flex-1 bg-linen" />
          </div>
        </>
      )}
      <form onSubmit={sendCode} noValidate className={google ? "" : "mt-8"}>
        <label htmlFor="login-email-code" className="mb-1.5 block pl-1 text-sm font-medium">Email address</label>
        <input
          id="login-email-code"
          type="email"
          inputMode="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          className={fieldClass}
          aria-invalid={Boolean(error)}
        />
        {error && <p role="alert" className="mt-1.5 pl-1 text-xs font-medium text-berry">{error}</p>}
        <button type="submit" disabled={busy} className={`${primary} mt-4`}>
          {busy ? "Sending…" : "Email me a code"} <ArrowRightIcon width={16} height={16} />
        </button>
      </form>
      <p className="mt-4 text-xs text-muted">New here? You&apos;ll add your name, mobile and birthday after signing in.</p>
    </>
  );
}

type Fields = { name: string; email: string; phone: string; dob: string; anniversary: string };

/** Name, email, mobile, birthday and (optional) anniversary. */
function DetailsForm({ email, defaultName = "", submitLabel, onSaved }: {
  /** Fixed email from the signed-in account; editable when absent (demo mode). */
  email?: string;
  defaultName?: string;
  submitLabel: string;
  onSaved: () => void;
}) {
  const [fields, setFields] = useState<Fields>({ name: defaultName, email: email ?? "", phone: "", dob: "", anniversary: "" });
  const [errors, setErrors] = useState<Partial<Record<keyof Fields | "save", string>>>({});
  const [saving, setSaving] = useState(false);
  const set = (key: keyof Fields) => (e: React.ChangeEvent<HTMLInputElement>) => setFields((f) => ({ ...f, [key]: e.target.value }));
  const today = todayInIndia();

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
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
    setSaving(true);
    const profile: Profile = {
      name: fields.name.trim(),
      email: fields.email.trim().toLowerCase(),
      phone: fields.phone.replace(/[\s-]/g, ""),
      dob: fields.dob,
      anniversary: fields.anniversary || undefined,
      createdAt: new Date().toISOString(),
    };
    const error = await saveProfile(profile);
    setSaving(false);
    if (error) setErrors({ save: error });
    else onSaved();
  }

  return (
    <form onSubmit={onSubmit} noValidate className="mt-8 grid gap-4 sm:grid-cols-2">
      <Field id="name" label="Full name" error={errors.name} className="sm:col-span-2">
        <input id="login-name" className={fieldClass} value={fields.name} onChange={set("name")} autoComplete="name" aria-invalid={Boolean(errors.name)} />
      </Field>
      <Field id="email" label="Email address" error={errors.email}>
        <input id="login-email" type="email" inputMode="email" className={fieldClass} value={fields.email} onChange={set("email")}
          readOnly={email !== undefined} autoComplete="email" placeholder="you@example.com" aria-invalid={Boolean(errors.email)} />
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
        {errors.save && <p role="alert" className="mb-3 text-sm font-medium text-berry">{errors.save}</p>}
        <button type="submit" disabled={saving} className={`${primary} mt-2`}>
          {saving ? "Saving…" : submitLabel} <ArrowRightIcon width={16} height={16} />
        </button>
      </div>
    </form>
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
