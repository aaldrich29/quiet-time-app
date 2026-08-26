# Quiet Time

A minimal, installable timer app for structured devotional or quiet time sessions. Add your items (Bible reading, prayer, journaling, etc.), set durations, and start — it guides you through each one with gentle chimes.

**[Live App →](https://aaldrich29.github.io/quiet-time-app/)**

## Features

- **Custom items** — add any activity with a name and duration
- **Drag to reorder** — long-press or drag the handle to rearrange your list
- **Guided timer** — counts down each item in sequence, chimes when time's up
- **Pause / Skip / Stop** — full control during your session
- **Adaptive themes** — the background color shifts softly with each item
- **Survives backgrounding** — switch apps and the countdown stays on the right time
- **Notifications** — get alerted when each item's time is up, even from another app
- **Resumes after a restart** — if the app gets closed mid-session, it picks up where it left off
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

## Background Timing

Browsers throttle or freeze pages that aren't in front, which normally stops a JS
timer dead. Three things keep this one honest, without any server or background hacks:

1. **Wall-clock deadlines** — the countdown is derived from a timestamp, not decremented,
   so a throttled or suspended tab shows the correct time the instant it runs again.
   It re-syncs on `visibilitychange`, `pageshow`, and `focus`.
2. **Notifications** — when an item's time is up you get a system notification with
   vibration. Tap **Enable alerts** on the setup screen (or just press Start) to grant
   permission. The service worker holds a copy of the deadline and fires the notification
   itself if the page has been throttled; the page fires it otherwise. Both use one tag,
   so you never get two, and you get none at all if you're already looking at the app.
3. **Session persistence** — the running session is saved to `localStorage`, so if the
   OS kills the app entirely, reopening it within six hours restores your place.

### Known limitation

The web has no way to schedule a local notification for a future time without a server.
Notification Triggers (`TimestampTrigger`) never shipped, and Web Push requires a backend
to send the message. So if Android freezes the app outright, the alert lands when the
system next lets the app run rather than exactly on time.

In practice this mostly matters for long items with the screen off. To make it reliable:

- **Install it as a PWA** rather than using a browser tab — installed apps are frozen
  far less aggressively.
- **Exempt it from battery optimization** (Android: Settings → Apps → Quiet Time →
  Battery → Unrestricted).
- Leaving the screen on keeps it exact — the app holds a wake lock while a timer runs.

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
