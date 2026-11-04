# Smiley's Auto: unofficial concept site

A student design project for an auto repair shop in Altus, Oklahoma. **Not made by or affiliated with Smiley's Auto.** Business details come from public listings and the shop's own website and may be out of date; call the shop to confirm. The real site is <https://smileysservicecenter.com/>.

## Design

Dark graphite palette with a single deep-red accent, a clean grid, and a strong type hierarchy (Barlow Condensed + Inter). Original line-art icons, an "S" mark drawn as inline SVG (no smiley face anywhere), and one stock photo (generic, not the shop).

Sections: sticky header with Official site and Call buttons, hero, services (8), why us (Trust / Talent / Time + amenities), reviews, hours + map, contact, footer.

## Links to the real shop site

- Official site: <https://smileysservicecenter.com/> (header nav, hero, contact, footer, mobile bar)
- Appointments: <https://smileysservicecenter.com/appointments/> (hero, contact, footer)
- Services: <https://smileysservicecenter.com/services/> ("Learn more" on each service)

## Motion (v4, GSAP + ScrollTrigger, vendored in `js/`)

- Hero: slow image zoom-in, headline words slide up line by line, photo parallax and copy fade as you scroll past
- Scroll-scrubbed services strip (two rows moving in opposite directions)
- A red line draws down the page connecting the sections
- Section headers mask-reveal word by word
- Service cards slide in from alternating sides with a slight 3D tilt; the icon strokes draw themselves
- Trust / Talent / Time slide in while a red line draws across
- Count-up for 4.9 and 300+; map and hours panel slide up
- Blocks gently fade out as they scroll off the top and replay when you scroll back
- Magnetic hover on buttons (mouse devices only)
- Transforms and opacity only, no pinning, so it stays smooth on iOS Safari
- Content is visible by default. If the scripts fail or `prefers-reduced-motion` is set, nothing is hidden and nothing moves

## Caching

Assets use versioned filenames (`css/site.v4.css`, `js/site.v4.js`, `img/hero-v4-*.jpg`). When you change one, bump the `v4` in its name and in `index.html`, because GitHub Pages lets browsers cache static files for about 10 minutes. The old `style.css` / `main.js` are left in place only so a cached older `index.html` keeps working.

## History

This is the v2 design with the v4 motion layer. The v3 blueprint / exploded-view version is preserved in git history at commit `f8de101` (`git checkout f8de101`).

## Credits

Hero photo: "A white car on a lift in a garage" by Mathias Reding on [Unsplash](https://unsplash.com/photos/a-white-car-on-a-lift-in-a-garage-itJ8E4_bDW0), free under the [Unsplash License](https://unsplash.com/license). Resized and darkened; it does not depict this shop.

Plain HTML/CSS/JS, no build step. The page carries `noindex`.
