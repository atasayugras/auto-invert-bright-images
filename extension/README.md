# Auto Invert Bright Images

Automatically inverts eye-searing white-background images (screenshots,
documentation images, diagrams) when browsing in dark mode.

No ads. No tracking. Fully open source.

---

## The problem

You’re reading an article in dark mode.
Everything looks calm and readable.

Then suddenly:
- A pure white screenshot appears
- Black text on white background
- Your eyes hurt instantly

Most dark-mode tools handle text and UI,
but images are usually left untouched.

---

## What this extension does

This extension automatically detects images that are likely to be:
- screenshots
- terminal output
- documentation images
- black text on white background

And makes them dark-mode friendly.

Everything runs locally in your browser.

---

## How it works

### 1. Image scanning
All `<img>` elements on the page are scanned once.
Each image is processed only a single time.

### 2. Canvas-based analysis (preferred)
When possible, images are drawn to an offscreen canvas.
Pixel brightness and saturation are sampled to detect
white-background + dark-content images.

If the image matches the criteria, it is inverted pixel-by-pixel.

### 3. CSS fallback (when analysis is blocked)
Some images cannot be analyzed due to browser security rules.
In those cases, a CSS filter is applied as a fallback.

---

## Limitations (important)

### Cross-origin images
Browsers do not allow reading pixel data from images hosted on
different domains (CORS restriction).

Examples:
- Images served from CDNs
- Embedded external images
- Wikipedia-hosted images

In these cases:
- Canvas analysis is blocked
- A CSS-based inversion fallback is used instead

This is a browser security feature and cannot be bypassed safely.

---

### Visual accuracy
- Canvas inversion preserves clarity and contrast
- CSS fallback may slightly distort colors
- Photos may look unnatural when inverted

The goal is eye comfort, not perfect color fidelity.

---

## What this extension does NOT do

- It does not invert all images
- It does not aggressively modify photos
- It does not track users
- It does not make network requests
- It does not inject ads or analytics

---

## Installation (development)

Clone the repository:

    git clone https://github.com/atasayugras/auto-invert-bright-images.git

---

### Chrome / Chromium

1. Open `chrome://extensions`
2. Enable **Developer mode**
3. Click **Load unpacked**
4. Select the extension folder
5. (Optional) Enable **Allow access to file URLs**

---

### Firefox

1. Open `about:debugging`
2. Click **This Firefox**
3. Click **Load Temporary Add-on**
4. Select `manifest.json`

---

## Debugging

Open DevTools and check the **Console** tab.

All logs are prefixed with:

    [AutoInvert]

The logs explain:
- why an image was skipped
- whether canvas or CSS fallback was used
- when an image was inverted

---

## Contributing

Contributions are welcome.

Ideas for improvement:
- Better detection heuristics
- SVG handling
- Dynamic image loading
- Per-site enable / disable
- Performance optimizations

Please keep changes small and well documented.

---

## Project philosophy

This project intentionally:
- avoids aggressive permissions
- avoids tracking or analytics
- avoids network requests
- favors transparency over magic

The goal is simple:

**Reduce eye strain in dark mode without breaking the web.**

---

## License

MIT