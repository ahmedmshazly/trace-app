import { mkdirSync, copyFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.dirname(fileURLToPath(import.meta.url));
const destDir = path.join(root, '..', 'public', 'vendor');
mkdirSync(destDir, { recursive: true });

const copies = [
  ['react/umd/react.production.min.js', 'react.production.min.js'],
  ['react-dom/umd/react-dom.production.min.js', 'react-dom.production.min.js'],
];

for (const [from, name] of copies) {
  copyFileSync(path.join(root, '..', 'node_modules', from), path.join(destDir, name));
}

console.log('Synced React UMD builds to public/vendor');
