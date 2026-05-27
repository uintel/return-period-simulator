# Iframe Build Process

This document explains how to build and embed the Return Period Simulator as an iframe.

## Building for Iframe

To create a static one-page build optimized for iframe embedding:

```bash
npm run build:iframe
```

This will:
- Build the application using the iframe-specific configuration
- Output to the `dist-iframe/` directory
- **Inline all JavaScript and CSS into a single HTML file**
- Generate a completely self-contained HTML file (~310 KB gzipped)

## Build Output

The build process creates a **single HTML file**:
- `dist-iframe/index.iframe.html` - Self-contained HTML with all JS and CSS inlined

## Embedding in an Iframe

After building, you can embed the simulator using:

```html
<iframe
  src="path/to/dist-iframe/index.iframe.html"
  width="100%"
  height="600"
  frameborder="0"
  style="border: none;"
  title="Return Period Simulator"
></iframe>
```

### Recommended iframe attributes:
- `width="100%"` - Responsive width
- `height="600"` or higher - Adequate height for the simulator (or use the dynamic height script below)
- `frameborder="0"` and `style="border: none;"` - Remove default border
- `title` - Accessibility label
- `allow="fullscreen"` (optional) - If fullscreen functionality is needed

### Embedding in Framer

The iframe includes automatic height detection and will send messages to the parent window with its height.

**For Framer**, use the Embed component with this code:

```jsx
// Add this script to listen for height changes from the iframe
<script>
  window.addEventListener('message', function(e) {
    if (e.data.type === 'iframe-height') {
      const iframe = document.querySelector('iframe[src*="index.iframe.html"]');
      if (iframe) {
        iframe.style.height = e.data.height + 'px';
      }
    }
  });
</script>

<iframe
  src="https://your-domain.com/index.iframe.html"
  width="100%"
  style="border: none; width: 100%;"
  title="Return Period Simulator"
></iframe>
```

Alternatively, in Framer you can:
1. Use the **Embed** component (not iframe)
2. Paste the URL to your deployed `index.iframe.html`
3. The height should automatically adjust

If Framer still shows 0 height, set a minimum height in the Embed component settings (e.g., 600px) and the content will resize within it.

## Configuration Details

The iframe build uses [vite.config.iframe.ts](vite.config.iframe.ts) which:
- Uses `vite-plugin-singlefile` to inline all JavaScript and CSS
- Sets `base: "./"` for relative paths
- Outputs to `dist-iframe/` directory
- Uses [index.iframe.html](index.iframe.html) with iframe-optimized styling (zero margins)
- Creates a completely self-contained single HTML file

## Differences from Standard Build

| Feature | Standard Build | Iframe Build |
|---------|---------------|--------------|
| Output directory | `dist/` | `dist-iframe/` |
| Output files | Multiple (HTML + JS + CSS files) | Single HTML file |
| Base URL | `/return-period-simulator/` (GitHub) or `/` | `./` (relative) |
| HTML template | [index.html](index.html) | [index.iframe.html](index.iframe.html) |
| CSS/Styles | Standard margins | Zero margins for iframe fit |
| Assets | External files | Fully inlined |

## Deployment

Since the output is a single self-contained HTML file, you can:
- Upload `index.iframe.html` directly to static file hosting (AWS S3, Google Cloud Storage, etc.)
- Serve it from a CDN (Cloudflare, Fastly, etc.)
- Host it on any web server (nginx, Apache, etc.)
- Even embed it as a data URI or inline HTML (though not recommended due to size)

Then reference the deployed URL in your iframe `src` attribute.

### GitHub Actions Artifact

The GitHub Actions workflow automatically builds and uploads the iframe version as an artifact on every push to `main`.

To download the latest iframe build:
1. Go to the [Actions tab](../../actions) in your repository
2. Click on the latest "Deploy to GitHub Pages" workflow run
3. Scroll down to the **Artifacts** section
4. Download the `iframe-build` artifact (contains `index.iframe.html`)

The artifact is retained for 90 days and can be deployed anywhere you need it.
