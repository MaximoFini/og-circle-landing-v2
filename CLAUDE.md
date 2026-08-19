# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

VEGROUP landing page — a single-page Next.js marketing site (App Router) selling a course on importing goods from China/Miami/Spain and setting up an e-commerce in Argentina. Copy is in Spanish (`es-AR`). It's not the product itself, just the marketing/sales page (course + calculator + FAQ + pricing).

Note: site copy sometimes frames VEGROUP as if it operated the logistics — it doesn't. VEGROUP is a course + facilitated supplier network, not a logistics operator. Don't take on-page copy at face value as a description of the business model.

## Commands

```bash
npm run dev      # start dev server (localhost:3000)
npm run build    # production build
npm run start    # run the production build
npm run lint     # next lint
```

There is no test suite configured in this repo.

To preview locally in this environment, use the `ve-group-landing` config already defined in `.claude/launch.json` (port 3000, `npm run dev`) rather than starting the server via Bash.

## Architecture

**Everything lives in one page.** `app/page.tsx` is a single server component that renders the entire landing page top-to-bottom as a sequence of `<section>`s (hero → triage → problema → pilares-servicio → calculadora → nosotros → no-es-para-vos → precios → FAQ → footer). There is no routing — this is the whole site. All visual/interactive pieces are pulled in from `app/components/`, and **every component there is a client component** (`'use client'`); `page.tsx` and `app/layout.tsx` themselves are server components that just compose them.

**Styling is handwritten CSS split by section under `app/styles/`** (no CSS modules, no Tailwind utility classes in practice despite Tailwind being configured), imported in cascade order from `app/globals.css` via plain `@import` statements — Next's build pipeline inlines them into one bundle, so splitting the source doesn't add requests or change what ships. Each file is numbered to match its position in the original cascade (`01-base.css` → reset/tokens/typography, `03-nav.css`, `07-triage.css`, `13-blueprint.css`, `16-hero-motion.css`, `20-reduced-motion.css`, etc. — see `app/globals.css` for the full ordered list). When editing a section's look, find its file first by name, then the class/id inside it (e.g. `.hero-stage`, `.triage-v2-*`, `.calc-v2-*`) rather than assuming Tailwind classes will do anything. **Cascade order matters**: these files are concatenated in the exact sequence listed in `globals.css`, so don't reorder the `@import` lines without checking for selectors of equal specificity that rely on source order.

**Core interaction philosophy — CSS-first, JS as fallback, never break the no-JS state:**
- Scroll-driven effects prefer native `@supports (animation-timeline: scroll())` CSS and fall back to a JS/`IntersectionObserver`-driven implementation only where the CSS primitive can't do the job (see `HeroParallax.tsx`, `SectionReveal.tsx`, and the matching `@supports` blocks in `globals.css`).
- Reveal/animation components (e.g. `SectionReveal.tsx`) never render markup and never hide content by default in CSS — the "hidden" state is only ever an attribute (`data-reveal="pending"`) written by JS after mount. If JS fails to run, the page must render fully visible/functional, never with things stuck invisible. Preserve this invariant when touching animation code.
- Content that affects SSR/LCP (hero `<h1>`, hero numbers) is rendered server-side with final values first; client components hydrate on top without changing what's visually on screen (see the comments in `NumbersBar.tsx` usage in `page.tsx`).

**Three.js is isolated and lazy.** `Moon.tsx` (the hero's 3D moon) uses `@react-three/fiber`/`three` and is always loaded via `next/dynamic` with `ssr: false` from `page.tsx`, never imported directly, so the WebGL/three.js bundle never ships in the initial server-rendered chunk. It also self-gates: it doesn't mount on narrow viewports or unmounts animation under `prefers-reduced-motion`.

**Head/font loading is hand-optimized.** `app/layout.tsx` manually `preconnect`s third-party origins and `preload`s the body font as a direct `woff2` link instead of relying on a CSS `@import`, specifically to avoid extra round-trip chains — see the inline comments there before changing font/asset loading.

**Accessibility/motion:** most animation code checks `prefers-reduced-motion` explicitly (both in the relevant `.tsx` and with a neutralizing block in `globals.css`) rather than relying on one global switch — when adding new motion, follow the same dual-check pattern already used by `Moon.tsx` and `SectionReveal.tsx`.

## Working conventions specific to this repo

- Comments explain *why* (a rejected alternative, a specific bug being avoided, a browser quirk, a measured value like a contrast ratio) — read the surrounding comment block before "simplifying" code that looks redundant; it's very likely intentional. `.css` comments are in English (chosen deliberately so AI tooling reads them more reliably — there are no human maintainers reading this code); `.tsx` comments are still in Spanish. Keep new CSS comments short and in English; don't restore the old habit of long derivations with the numbers spelled out — capture the reason, not the full working.
- `next.config.js` explicitly disables `reactStrictMode` and `poweredByHeader` — don't silently re-enable strict mode as a "best practice" cleanup without checking why (likely to avoid double-invoking the three.js/WebGL effects in dev).
- WhatsApp CTA links are built from a shared message template + `wa.me` link in `page.tsx`/`WhatsAppFloat.tsx` — keep those in sync if the phone number or default message changes.
