// Runtime bootstrap.
//
// The Trace design system is a precompiled bundle that attaches its components
// to window.TRACE_UI and expects a single *global* React. We therefore load
// the stylesheet, React/ReactDOM UMD, and ui-bundle.js as plain DOM tags here,
// then dynamically import the app so every screen module evaluates only after
// `window.React`, `window.ReactDOM`, and `window.TRACE_UI` exist.

const REACT_UMD = 'https://unpkg.com/react@18.3.1/umd/react.production.min.js';
const REACT_DOM_UMD = 'https://unpkg.com/react-dom@18.3.1/umd/react-dom.production.min.js';

function addStylesheet(href) {
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = href;
  document.head.appendChild(link);
}

function loadScript(src, { crossOrigin } = {}) {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = src;
    if (crossOrigin) script.crossOrigin = crossOrigin;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`Failed to load ${src}`));
    document.head.appendChild(script);
  });
}

function renderFatal(message) {
  const root = document.getElementById('root');
  if (!root) return;
  root.innerHTML = `
    <div style="min-height:100vh;display:flex;align-items:center;justify-content:center;
                font-family:system-ui,sans-serif;color:#c9c9d4;background:#15151f;padding:24px;text-align:center">
      <div style="max-width:420px">
        <p style="font-size:15px;line-height:1.5;margin:0 0 8px">Trace could not start.</p>
        <p style="font-size:13px;color:#8a8a99;margin:0">${message}</p>
      </div>
    </div>`;
}

async function boot() {
  // Tokens, fonts, base reset. Served from the dev-server root and copied to
  // dist/ at build time (see vite.config.js).
  addStylesheet('/styles.css');

  try {
    await loadScript(REACT_UMD, { crossOrigin: 'anonymous' });
    await loadScript(REACT_DOM_UMD, { crossOrigin: 'anonymous' });
    await loadScript('/ui-bundle.js');
  } catch (err) {
    renderFatal(
      'A required asset failed to load. Check your network connection and that the design-system bundle is present.',
    );
    throw err;
  }

  if (!window.React || !window.ReactDOM || !window.TRACE_UI) {
    renderFatal('The design system did not initialize as expected.');
    return;
  }

  // Imported only now, so its (and its children's) top-level reads of
  // window.TRACE_UI and global React resolve correctly.
  const { mountApp } = await import('./App.jsx');
  mountApp(document.getElementById('root'));
}

boot();
