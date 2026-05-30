# Quiet Time

A minimal, installable timer app for structured devotional or quiet time sessions. Add your items (Bible reading, prayer, journaling, etc.), set durations, and start — it guides you through each one with gentle chimes.

**[Live App →](https://aaldrich29.github.io/quiet-time-app/)**

## Features

- **Custom items** — add any activity with a name and duration
- **Drag to reorder** — long-press or drag the handle to rearrange your list
- **Guided timer** — counts down each item in sequence, chimes when time's up
- **Pause / Skip / Stop** — full control during your session
- **Adaptive themes** — the background color shifts softly with each item
- **Offline support** — works without an internet connection after first load
- **Installable PWA** — add to your home screen on iOS, Android, or desktop

## Installing as an App

### iOS / iPadOS
1. Open the app in Safari
2. Tap the **Share** button → **Add to Home Screen**
3. Tap **Add**

### Android
1. Open in Chrome
2. Tap the menu (⋮) → **Add to Home screen**

### Desktop (Chrome / Edge)
1. Look for the install icon (⊕) in the address bar
2. Click **Install**

## Running Locally

No build step required — it's plain HTML/CSS/JS.

```bash
# Any static server works, e.g.:
npx serve .
# or
python -m http.server 8080
```

Open `http://localhost:8080` in your browser.

> **Note:** The service worker requires a secure context (HTTPS or localhost). Opening `index.html` directly as a `file://` URL will skip PWA features.

## Project Structure

```
quiet-time-app/
├── index.html        # App shell + all JS/CSS (single file)
├── manifest.json     # PWA manifest
├── sw.js             # Service worker (offline + caching)
├── favicon.png
└── icons/
    ├── icon-192.png
    ├── icon-512.png
    └── logo.svg
```

## License

MIT
