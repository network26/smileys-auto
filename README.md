# Smiley's Auto: unofficial concept site

A student design project for an auto repair shop in Altus, Oklahoma. **Not made by or affiliated with Smiley's Auto.** Business details come from public listings and the shop's own website and may be out of date; call the shop to confirm. The real site is <https://smileysservicecenter.com/>.

## Design

Dark graphite palette with a single deep-red accent, a clean grid, and a strong type hierarchy (Barlow Condensed + Inter). Original line-art icons, a plain "S" wordmark mark (no smiley face anywhere), and one stock photo (generic, not the shop).

Sections: sticky header with Official site and Call buttons, hero, services (8), why us (Trust / Talent / Time + amenities), reviews, hours + map, contact, footer.

## Links to the real shop site

- Official site: <https://smileysservicecenter.com/> (header nav, hero, contact, footer, mobile bar)
- Appointments: <https://smileysservicecenter.com/appointments/> (hero, contact, footer)
- Services: <https://smileysservicecenter.com/services/> ("Learn more" on each service)

## Motion (all restrained)

- Fade/slide-in as sections enter the viewport
- Light parallax on the hero photo
- One horizontal reveal: a red line draws across the Trust / Talent / Time row as you scroll
- Thin scroll-progress hairline under the header
- `prefers-reduced-motion` gives a fully static layout

## History

This is the v2 design. The v3 blueprint / exploded-view version is preserved in git history at commit `f8de101` (`git checkout f8de101`).

## Credits

Hero photo: "A white car on a lift in a garage" by Mathias Reding on [Unsplash](https://unsplash.com/photos/a-white-car-on-a-lift-in-a-garage-itJ8E4_bDW0), free under the [Unsplash License](https://unsplash.com/license). Resized and darkened; it does not depict this shop.

Plain HTML/CSS/JS, no build step. The page carries `noindex`.
