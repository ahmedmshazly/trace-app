import { defineConfig } from 'vite';
import { viteStaticCopy } from 'vite-plugin-static-copy';

// The Trace design system ships as a precompiled global bundle (window.TRACE_UI)
// whose components reference a single global React. So this app:
//   - never bundles its own React (JSX compiles to global React.createElement);
//   - loads React UMD + ui-bundle.js + styles.css at runtime (see src/main.jsx);
//   - copies those design-system files into dist/ for production builds.
// React UMDs are vendored same-origin under /vendor (see scripts/sync-vendor.mjs).
const API_TARGET = process.env.VITE_API_PROXY || 'http://localhost:4000';

export default defineConfig({
  // Compile JSX against the global React (classic runtime); do NOT import react.
  esbuild: {
    jsx: 'transform',
    jsxFactory: 'React.createElement',
    jsxFragment: 'React.Fragment',
  },
  server: {
    port: 5173,
    strictPort: true,
    proxy: {
      // Keep API calls same-origin in dev; forwarded to the Express API.
      '/api': {
        target: API_TARGET,
        changeOrigin: true,
      },
    },
  },
  preview: {
    port: 4173,
    proxy: {
      '/api': {
        target: API_TARGET,
        changeOrigin: true,
      },
    },
  },
  plugins: [
    viteStaticCopy({
      targets: [
        { src: 'ui-bundle.js', dest: '.' },
        { src: 'styles.css', dest: '.' },
        { src: 'manifest.webmanifest', dest: '.' },
        { src: 'tokens', dest: '.' },
        { src: 'fonts', dest: '.' },
        { src: 'assets', dest: '.' },
      ],
    }),
  ],
});
