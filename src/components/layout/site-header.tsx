"use client";

import Form from "next/form";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import { occasions } from "@/data/taxonomy";
import { routes } from "@/lib/routes";
import {
  BagIcon,
  ChevronDownIcon,
  CloseIcon,
  MenuIcon,
  ReceiptIcon,
  SearchIcon,
  UserIcon,
} from "@/components/ui/icons";
import { useCart } from "@/lib/cart";
import { useProfile } from "@/lib/profile";
import { Wordmark } from "./wordmark";

type Panel = "none" | "occasions" | "search" | "mobile";

const navLink =
  "text-sm font-medium text-charcoal transition-colors hover:text-burgundy aria-[current=page]:text-burgundy";
const iconButton =
  "inline-flex h-10 w-10 items-center justify-center rounded-md text-charcoal transition-colors hover:bg-linen/70 hover:text-burgundy";

export function SiteHeader() {
  const pathname = usePathname();
  const profile = useProfile();
  const cartCount = (useCart() ?? []).reduce((sum, l) => sum + l.quantity, 0);
  const [panel, setPanel] = useState<Panel>("none");
  const headerRef = useRef<HTMLElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const occasionMenuId = useId();
  const searchPanelId = useId();
  const mobileMenuId = useId();

  const toggle = (next: Panel) => setPanel((p) => (p === next ? "none" : next));
  const close = () => setPanel("none");

  // Close any open panel on Escape or a click outside the header.
  useEffect(() => {
    if (panel === "none") return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setPanel("none");
    const onClick = (e: MouseEvent) => {
      if (!headerRef.current?.contains(e.target as Node)) setPanel("none");
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onClick);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onClick);
    };
  }, [panel]);

  useEffect(() => {
    if (panel === "search") searchInputRef.current?.focus();
  }, [panel]);

  const isActive = (href: string) =>
    href === routes.home ? pathname === href : pathname.startsWith(href);
  const current = (href: string) => (isActive(href) ? "page" : undefined);

  return (
    <header
      ref={headerRef}
      className="sticky top-0 z-40 border-b border-linen bg-ivory"
    >
      <div className="page-container flex h-16 items-center gap-4 lg:h-20">
        {/* Mobile menu toggle */}
        <button
          type="button"
          className={`${iconButton} -ml-2 lg:hidden`}
          aria-expanded={panel === "mobile"}
          aria-controls={mobileMenuId}
          onClick={() => toggle("mobile")}
        >
          {panel === "mobile" ? <CloseIcon /> : <MenuIcon />}
          <span className="sr-only">
            {panel === "mobile" ? "Close menu" : "Open menu"}
          </span>
        </button>

        <Wordmark className="lg:mr-6" />

        {/* Desktop navigation */}
        <nav aria-label="Main" className="hidden lg:block">
          <ul className="flex items-center gap-8">
            <li>
              <Link href={routes.giftFinder} className={navLink} aria-current={current(routes.giftFinder)}>
                Gift Finder
              </Link>
            </li>
            <li>
              <Link href={routes.gifts} className={navLink} aria-current={current(routes.gifts)}>
                Discover
              </Link>
            </li>
            <li>
              <Link href={routes.giftBox} className={navLink} aria-current={current(routes.giftBox)}>
                Gift Box
              </Link>
            </li>
            <li className="relative">
              <button
                type="button"
                className={`${navLink} inline-flex items-center gap-1`}
                aria-expanded={panel === "occasions"}
                aria-controls={occasionMenuId}
                onClick={() => toggle("occasions")}
              >
                Shop by Occasion
                <ChevronDownIcon
                  width={16}
                  height={16}
                  className={`transition-transform ${panel === "occasions" ? "rotate-180" : ""}`}
                />
              </button>
              <div
                id={occasionMenuId}
                hidden={panel !== "occasions"}
                className="absolute top-full left-1/2 mt-4 w-64 -translate-x-1/2 rounded-lg border border-linen bg-white p-2 shadow-soft"
              >
                <ul>
                  {occasions.map((o) => (
                    <li key={o.id}>
                      <Link
                        href={routes.giftsForOccasion(o.id)}
                        onClick={close}
                        className="flex flex-col rounded-md px-3 py-2.5 hover:bg-blush"
                      >
                        <span className="text-sm font-medium">{o.label}</span>
                        <span className="text-xs text-muted">{o.blurb}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </li>
            <li>
              <Link href={routes.makers} className={navLink} aria-current={current(routes.makers)}>
                Meet the Makers
              </Link>
            </li>
          </ul>
        </nav>

        {/* Utility actions */}
        <div className="ml-auto flex items-center gap-1">
          <button
            type="button"
            className={iconButton}
            aria-expanded={panel === "search"}
            aria-controls={searchPanelId}
            onClick={() => toggle("search")}
          >
            <SearchIcon />
            <span className="sr-only">Search gifts</span>
          </button>
          <Link
            href={routes.orders}
            className={iconButton}
            aria-current={current(routes.orders)}
          >
            <ReceiptIcon />
            <span className="sr-only">Your orders</span>
          </Link>
          <Link href={routes.cart} className={`${iconButton} relative`} aria-current={current(routes.cart)}>
            <BagIcon />
            {cartCount > 0 && (
              <span aria-hidden="true" className="absolute top-1 right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-burgundy px-1 text-[0.65rem] font-medium text-white">
                {cartCount}
              </span>
            )}
            <span className="sr-only">{cartCount > 0 ? `Cart, ${cartCount} ${cartCount === 1 ? "item" : "items"}` : "Cart, empty"}</span>
          </Link>
          <Link href={routes.login} className={iconButton} aria-current={current(routes.login)}>
            {profile ? (
              <span aria-hidden="true" className="flex h-7 w-7 items-center justify-center rounded-full bg-burgundy font-serif text-sm text-white">
                {profile.name.charAt(0).toUpperCase()}
              </span>
            ) : (
              <UserIcon />
            )}
            <span className="sr-only">{profile ? `Your account (${profile.name})` : "Sign in"}</span>
          </Link>
        </div>
      </div>

      {/* Search panel */}
      <div
        id={searchPanelId}
        hidden={panel !== "search"}
        className="border-t border-linen bg-ivory"
      >
        <div className="page-container py-4">
          <Form action={routes.gifts} onSubmit={close} className="flex gap-2" role="search">
            <label htmlFor="site-search" className="sr-only">
              Search gifts
            </label>
            <input
              ref={searchInputRef}
              id="site-search"
              name="q"
              type="search"
              required
              placeholder="Try “candle for a friend” or “under ₹1,500”"
              className="h-11 min-w-0 flex-1 rounded-md border border-linen bg-white px-4 text-sm placeholder:text-muted/80 focus:border-burgundy"
            />
            <button
              type="submit"
              className="h-11 shrink-0 rounded-md bg-burgundy px-5 text-sm font-medium text-white hover:bg-burgundy-hover"
            >
              Search
            </button>
          </Form>
        </div>
      </div>

      {/* Mobile menu */}
      <div
        id={mobileMenuId}
        hidden={panel !== "mobile"}
        className="max-h-[calc(100dvh-4rem)] overflow-y-auto border-t border-linen bg-ivory lg:hidden"
      >
        <nav aria-label="Mobile" className="page-container py-6">
          <ul className="space-y-1">
            {[
              { href: routes.giftFinder, label: "Gift Finder" },
              { href: routes.gifts, label: "Discover all gifts" },
              { href: routes.giftBox, label: "Mix and match a gift box" },
              { href: routes.makers, label: "Meet the Makers" },
              { href: routes.cart, label: "Your cart" },
              { href: routes.orders, label: "Your orders" },
            ].map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={close}
                  aria-current={current(item.href)}
                  className="block py-2.5 font-serif text-2xl aria-[current=page]:text-burgundy"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
          <p className="eyebrow mt-8 mb-3">Shop by occasion</p>
          <ul className="grid grid-cols-2 gap-2">
            {occasions.map((o) => (
              <li key={o.id}>
                <Link
                  href={routes.giftsForOccasion(o.id)}
                  onClick={close}
                  className="block rounded-md border border-linen bg-white px-3 py-3 text-sm font-medium"
                >
                  {o.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  );
}
