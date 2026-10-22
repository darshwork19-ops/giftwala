import type { Metadata } from "next";
import { Suspense } from "react";
import { LoginForm } from "@/components/auth/login-form";
import { GiftImage } from "@/components/ui/gift-image";
import { heroImage } from "@/lib/hero-image";

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in to GIFTWALA to add gifts, build a gift box and track your requests.",
};

export default function LoginPage() {
  const image = heroImage();
  return (
    <div className="page-container pt-10 pb-20 sm:pt-14">
      <div className="grid items-center gap-12 lg:grid-cols-[1fr_1.1fr] lg:gap-20">
        <div className="relative mx-auto hidden aspect-[4/5] w-full max-w-md overflow-hidden rounded-[1.25rem] bg-berry lg:block lg:max-w-none">
          <GiftImage src={image.src} alt={image.alt} sizes="40vw" preload />
        </div>
        <div className="max-w-xl">
          <Suspense fallback={<div className="h-96 animate-pulse rounded-[1.25rem] bg-linen/60" />}>
            <LoginForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
