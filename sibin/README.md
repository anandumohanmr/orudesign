# Sibin & Midhuna — Animated Wedding Invitation

A responsive HTML/CSS/JavaScript wedding invitation built from the supplied invitation, save-the-date artwork, and photo ZIP.

## Included
- Responsive wedding invitation website
- Three.js 3D animated backgrounds, floating hearts, rings and particles
- Animated couple photo gallery
- 3D storybook/fairytale couple illustration
- Countdown to **Sunday, 25 October 2026 at 11:00 AM IST**
- Google Maps search/embed for **St. Mary's Church, NAD Puram, Aluva**
- Mobile-friendly layout
- Generated romantic ambient Web Audio that starts after the visitor taps "Enter Our Story"
- Processed photos with EXIF rotation correction, brightness/color/contrast/sharpness enhancement

## Important date note
The printed invitation supplied with the project says **Sunday, 25th October 2026 at 11:00 AM**. The separate save-the-date image says **26.10.2026**. This website follows the printed invitation and calendar-consistent Sunday date: **25 October 2026**.

## Music
The website does not bundle an AR Rahman recording. The included music is a small original Web Audio ambient sequence so the invitation is self-contained and avoids redistributing copyrighted music.

If you have a licensed AR Rahman BGM file, add it under `assets/music/wedding-bgm.mp3` and replace the Web Audio section in `js/main.js` with an HTML5 `<audio>` player. Browser autoplay policies may still require a tap.

## Run
For the most reliable local preview, run a local server from this folder:

```bash
python -m http.server 5500
```

Then open:

`http://localhost:5500`

You can also upload the whole folder to Netlify, GitHub Pages, Vercel, or any static hosting service.
