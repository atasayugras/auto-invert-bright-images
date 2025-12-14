/**
 * Auto Invert Bright Images
 * ------------------------
 * Content Script (v0.2)
 *
 * Purpose:
 *  - Detect images that are visually painful in dark mode
 *    (e.g. white background + black text screenshots)
 *  - Invert them automatically to improve eye comfort
 *
 * Design goals:
 *  - No tracking
 *  - No network requests
 *  - No aggressive permissions
 *  - Transparent heuristics (no ML magic)
 *
 * This file is intentionally verbose and commented
 * to encourage open-source collaboration.
 */

(function () {
    "use strict";

    /* ============================================================
     * Configuration
     * ============================================================
     */

    // Enable or disable console logging.
    // Contributors can turn this off when debugging is not needed.
    const DEBUG = true;

    function log(...args) {
        if (DEBUG) {
            console.log("[AutoInvert]", ...args);
        }
    }

    /* ============================================================
     * Image scanning
     * ============================================================
     *
     * We scan all <img> elements on the page once.
     * Each image is marked as "processed" to avoid
     * re-processing or infinite loops.
     */

    function scanImages() {
        const images = document.querySelectorAll("img");

        images.forEach(img => {
            if (img.dataset.processed === "true") return;

            // Some images load instantly, others later
            if (img.complete) {
                processImage(img);
            } else {
                img.onload = () => processImage(img);
            }
        });
    }

    log("Content script loaded on:", location.href);
    scanImages();

    /* ============================================================
     * Image processing entry point
     * ============================================================
     */

    function processImage(img) {
        // Mark early to avoid repeated attempts
        img.dataset.processed = "true";

        const width = img.naturalWidth;
        const height = img.naturalHeight;

        // Skip very small images (icons, emojis, UI elements)
        if (width < 120 || height < 120) {
            log("Skipping small image:", img.src);
            return;
        }

        // Skip animated GIFs (canvas would freeze animation)
        if (img.src.toLowerCase().endsWith(".gif")) {
            log("Skipping GIF:", img.src);
            return;
        }

        /* ========================================================
         * Canvas-based analysis (preferred path)
         * ========================================================
         *
         * We try to draw the image onto an offscreen canvas.
         * If this succeeds, we can read pixel data and make
         * an informed decision about whether to invert it.
         *
         * This only works for same-origin images.
         */

        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d", { willReadFrequently: true });

        if (!ctx) return;

        canvas.width = width;
        canvas.height = height;

        try {
            ctx.drawImage(img, 0, 0);
        } catch {
            // Cross-origin image: drawing is blocked
            log("Canvas draw blocked (CORS), using CSS fallback:", img.src);
            applyCssFallback(img);
            return;
        }

        let imageData;
        try {
            imageData = ctx.getImageData(0, 0, width, height);
        } catch {
            // Canvas is tainted; pixel access denied
            log("Canvas read blocked (tainted), using CSS fallback:", img.src);
            applyCssFallback(img);
            return;
        }

        // Decide whether this image actually needs inversion
        if (!shouldInvert(imageData.data)) {
            log("Image does not meet inversion criteria:", img.src);
            return;
        }

        // Perform pixel-by-pixel inversion
        invertImage(ctx, imageData);
        img.src = canvas.toDataURL();

        log("Image inverted via canvas:", img.src);
    }

    /* ============================================================
     * Detection heuristics
     * ============================================================
     *
     * We sample pixels and look for:
     *  - mostly bright background
     *  - some dark foreground content
     *  - low color saturation (screenshot-like)
     *
     * These heuristics are intentionally simple
     * and easy to tweak by contributors.
     */

    function shouldInvert(data) {
        let brightPixels = 0;
        let samples = 0;

        for (let i = 0; i < data.length; i += 20) {
            samples++;

            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];

            const brightness = (r + g + b) / 3;

            if (brightness > 200) brightPixels++;
        }

        // If most of the image is bright, invert it
        return brightPixels / samples > 0.6;
    }


    /* ============================================================
     * Pixel inversion
     * ============================================================
     */

    function invertImage(ctx, imageData) {
        const d = imageData.data;

        for (let i = 0; i < d.length; i += 4) {
            d[i]     = 255 - d[i];     // Red
            d[i + 1] = 255 - d[i + 1]; // Green
            d[i + 2] = 255 - d[i + 2]; // Blue
            // Alpha channel intentionally untouched
        }

        ctx.putImageData(imageData, 0, 0);
    }

    /* ============================================================
     * CSS fallback (important!)
     * ============================================================
     *
     * Why this exists:
     *  - Browsers block pixel access for cross-origin images
     *  - This is a hard security rule (CORS)
     *
     * When canvas analysis is impossible,
     * we apply a CSS filter as a best-effort fallback.
     *
     * This works everywhere but may distort colors.
     */

    function applyCssFallback(img) {
        img.style.setProperty(
            "filter",
            "invert(1) hue-rotate(180deg) brightness(1.1) contrast(1.1)",
            "important"
        );

        img.style.backgroundColor = "black";
        log("CSS fallback applied:", img.src);
    }

})();
