# Smiley's Auto: unofficial concept site (v3, blueprint)

A student design project for an auto repair shop in Altus, Oklahoma. **Not made by or affiliated with Smiley's Auto.** Business details come from public listings and the shop's own website and may be out of date; call the shop to confirm. The real site is <https://smileysservicecenter.com/>.

## Design

A technical-drawing look: navy blueprint grid, fine cyan line work, dimension lines, callouts and part numbers, with one amber accent. Brand is the plain wordmark "SMILEY'S AUTO". No photos and no logo mark; every drawing is original SVG line art.

## Motion

- **Exploded view:** a pinned, scroll-scrubbed exploded car (body shell, cabin, door, hood, wheels, brakes, suspension, engine, transmission, exhaust, battery, A/C, oil filter). Parts travel along leader lines and reassemble on scroll back; each callout is tied to a service. Simplified vertical stack on mobile.
- Service rows slide in from alternating sides and slide out as you leave; each part diagram draws itself (stroke-dashoffset).
- Counters (4.9★, 300+ reviews), cards sliding in, section exit transitions, scroll-progress hairline.
- `prefers-reduced-motion` and no-JS/no-CDN give a static page (exploded view shown fully exploded).

## Tech

Plain HTML/CSS/JS, no build step. GSAP 3 + ScrollTrigger from jsDelivr (free standard license). The page carries `noindex`.
