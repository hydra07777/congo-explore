# Kongo Explore — Product context

## What this is

Kongo Explore is a booking marketplace for tourism and leisure in the
Democratic Republic of the Congo, Kinshasa first. A visitor picks a city,
browses hotels, restaurants, cafés, events and local experiences, books a
slot, and pays.

This repository is a **static front-end mockup** (HTML / CSS / JS vanilla,
GSAP + ScrollTrigger from CDN, no backend). Everything the interface reads
comes from hand-authored mock data in `assets/js/data.js`.

## Who it is for

- Kinshasa residents planning a weekend: a dinner, a boat trip on the Congo,
  a concert at Stade des Martyrs, a hotel night for a visiting relative.
- Members of the diaspora and travelers landing in Kinshasa who need to know
  what exists, where, at what price, and whether it is trustworthy.
- Local venue owners with no digital storefront.

## The real usage scene

Almost all traffic is **mobile, on expensive metered data, often on a
mid-tier Android**, sometimes under unreliable connectivity. The interface
therefore leads with images that are compressed and locally hosted, keeps
page transitions cheap, and never hides content behind an animation that
needs to finish first.

Money is quoted in **USD** with a **CDF** equivalent, because both circulate.
Payment must read as native to the market: **mobile money (M-Pesa, Orange
Money, Airtel Money)** sits beside cards, not under them.

## Language

Interface is 100 % French. Lingala appears only where a local name or an
expression is genuinely the thing being labelled (venue names, neighborhood
names, one hero line).

## What this first surface must prove

The landing page must prove three things in one viewport: this product knows
Kinshasa specifically, browsing it feels premium, and booking is safe and
payable from a phone.

## Truth boundaries (mockup)

- Venues, prices, ratings and reviews are **authored mock data**, plausible
  for Kinshasa, not real listings. They are labelled synthetic in the UI
  (a "maquette" notice in the footer).
- Photos are real Wikimedia Commons photographs of Kinshasa and of African
  hospitality/leisure venues, with author and licence recorded in
  `assets/img/credits.json`. They illustrate; they are not the venues they
  are attached to.
- No payment is processed. The payment step is a demonstration flow.

## Standing conventions

- Design tokens live in `assets/css/tokens.css`; no raw hex in components.
- One design system across all seven screens; the landing page sets the bar.
- Mobile-first, 375 / 768 / 1024 / 1440 are the tested widths.
- `prefers-reduced-motion` is honored everywhere.
