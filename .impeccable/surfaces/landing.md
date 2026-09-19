# Surface brief — Landing page (Kongo Explore)

Target: `index.html` (primary), with the visual system reused by the six
inner screens.

Mode: **Persuade**.

Approach: code-led (no image-generation tool exists in this harness; photos
are sourced real photographs, recorded with provenance in
`assets/img/credits.json`).

## Audience and job

Kinshasa residents and incoming diaspora/travelers, on a phone, on metered
data. Job: understand in seconds that this product covers *their* city
concretely, then start a search. Second job: believe a booking can be paid
for from a phone (mobile money).

## Concept

A **printed Kinshasa city guide** — the kind sold on the corner of Avenue du
Commerce: numbered entries, a ruled grid, captions that name a commune, a
price in USD and CDF, and photographs printed full-bleed on warm paper.
The market's own graphic tradition, not a template of a booking site.

What that refuses: the category default (hero search bar over a stock
skyline, three icon cards, logo strip, four-column footer). Entries here are
numbered like a guide's index, the palette is paper and one ink, and the
search affordance is a "fiche de recherche" — a small printed form, not a
floating pill.

## Direction contract

THESIS: Kongo Explore is a printed city guide for Kinshasa that happens to be
interactive. A ruled index of numbered entries carries the page; the category
default of a floating search pill over a generic skyline hero is refused.

OWN-WORLD: warm paper (#F7F3EC) ground, near-black ink (#141210), one hue
owns action and emphasis — DRC flag yellow (#F2C200) used as a printed
highlight (blocks, underlines, stamps), with flag-sky blue (#4A90D9) and a
muted brick (#C0392B) as secondary inks. Hairline rules (1px, ink at 12 %)
do the work cards usually do. Type: a display with editorial weight for
titles, a humanist workhorse for interface. Numbered entries, caption
typography in small caps with tracked letters, USD/CDF price pairs set in the
same line.

STORY: the visitor sees 12 real Kinshasa entries — a pool in Bandal, a
maquis in Matonge, a rooftop in Gombe, a boat on the Congo — with commune,
price and availability, understands the four-step path, sees that payment
runs on M-Pesa/Orange Money/Airtel Money as well as cards, and starts a
search.

FIRST VIEWPORT: full-width photograph of the Congo at Kinshasa, treated as a
printed plate (paper margin, thin ink rule, caption line at the bottom edge
naming the commune and the subject). Over it, left-aligned, the headline
"Heure par heure, Kinshasa se réserve." set large in the display face, an
ink-on-paper fiche de recherche below it holding Ville / Catégorie / Date,
and a numbered index strip entering from the bottom edge. In the top right,
a small stamp that reads "12 adresses vérifiées · Kinshasa".

Signature interaction: the hero plate and the entry index are bound to scroll
with scrub — the plate eases upward behind the paper margin while the index
strip comes forward, and each numbered entry's thumbnail unmasks with
`clip-path` as its row enters. One authored moment, not an entrance on
every section.

FINISH: unreviewed and undocumented is unfinished; this build ends with the
finish review, the verdict, DESIGN.md, and every shipping raster carrying its
provenance.

## Unresolved

- Real venue partners are unknown; all listings are authored mock data.
- Payment providers are named but not integrated.
