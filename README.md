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

### Known limitation (web only)

The web has no way to schedule a local notification for a future time without a server.
Notification Triggers (`TimestampTrigger`) never shipped, and Web Push requires a backend
to send the message. So if Android freezes the app outright, the alert lands when the
system next lets the app run rather than exactly on time. Installing as a PWA and marking
it battery-unrestricted shrinks that window a lot.

**The Android build has no such limitation** — see below.

## Android App

The Android build wraps the same `index.html` in [Capacitor](https://capacitorjs.com) and
swaps the notification layer for a real OS alarm (`@capacitor/local-notifications`,
scheduled with `allowWhileIdle` so it punches through Doze). The alert fires at the right
second whether or not the app is running — even if Android has killed it entirely. The
app declares `USE_EXACT_ALARM`, which is granted at install time for alarm and timer apps.

The web and native paths live side by side in `index.html` and are chosen at runtime via
`Capacitor.isNativePlatform()`; the service worker is only registered on the web.

### Getting the APK

A GitHub Actions workflow builds and signs it on every push. Go to the **Actions** tab →
latest **Build Android APK** run → download the artifact → open the APK on your phone and
tap to install (you'll need to allow "install unknown apps" for your browser or file
manager the first time).

Three repository secrets are required (Settings → Secrets and variables → Actions):

| Secret | Value |
| --- | --- |
| `ANDROID_KEYSTORE_BASE64` | the keystore file, base64-encoded |
| `ANDROID_KEYSTORE_PASSWORD` | keystore password |
| `ANDROID_KEY_PASSWORD` | key password |

The key alias is `quiet-time`. **Keep the keystore backed up** — Android refuses to install
an update signed with a different key, and uninstalling to switch keys wipes your saved
items.

### Building locally

Requires the Android SDK and JDK 17 (Gradle 8.2.1 does not support JDK 21):

```bash
npm install
npm run sync                 # copies web assets into www/ and syncs the native project
cd android && ./gradlew assembleRelease \
  -PQT_KEYSTORE_FILE=/path/to/quiet-time-release.jks \
  -PQT_KEYSTORE_PASSWORD=... -PQT_KEY_ALIAS=quiet-time -PQT_KEY_PASSWORD=...
```

Omit the `-P` flags for an unsigned build. The APK lands in
`android/app/build/outputs/apk/release/`.

## Project Structure

```
quiet-time-app/
├── index.html        # App shell + all JS/CSS (single file)
├── manifest.json     # PWA manifest
├── sw.js             # Service worker (offline + web alerting)
├── capacitor.config.json
├── scripts/
│   └── build-www.mjs # Copies static assets into www/ for the APK
├── android/          # Capacitor Android project
├── favicon.png
└── icons/
    ├── icon-192.png
    ├── icon-512.png
    └── logo.svg
```

## License

MIT
