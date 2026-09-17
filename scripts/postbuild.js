import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import esbuild from 'esbuild';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');
const webDist = path.resolve(projectRoot, 'apps/web/dist');
const rootDist = path.resolve(projectRoot, 'dist');
const apiDir = path.resolve(projectRoot, 'api');

if (!fs.existsSync(webDist)) {
  fs.mkdirSync(webDist, { recursive: true });
}
if (!fs.existsSync(rootDist)) {
  fs.mkdirSync(rootDist, { recursive: true });
}
if (!fs.existsSync(apiDir)) {
  fs.mkdirSync(apiDir, { recursive: true });
}

// 1. Bundle API for Vercel Serverless Function
try {
  esbuild.buildSync({
    entryPoints: [path.resolve(projectRoot, 'apps/api/src/app.ts')],
    outfile: path.resolve(apiDir, 'index.js'),
    bundle: true,
    platform: 'node',
    target: 'node20',
    format: 'esm',
    packages: 'external',
    footer: {
      js: '\nexport default app;\n',
    },
  });
  console.log('✅ Postbuild: Standalone api/index.js serverless bundle generated successfully.');
} catch (err) {
  console.warn('⚠️ Postbuild: esbuild bundle warning, falling back to direct import:', err.message);
  fs.writeFileSync(
    path.resolve(apiDir, 'index.js'),
    `import { app } from '../apps/api/dist/app.js';\nexport default app;\n`
  );
}

// Write TypeScript wrapper in api/
fs.writeFileSync(
  path.resolve(apiDir, 'index.ts'),
  `import { app } from '../apps/api/src/app.js';\nexport default app;\n`
);

// 2. Sync web static outputs to root dist and apps/web/dist
if (fs.existsSync(rootDist) && fs.existsSync(webDist)) {
  fs.cpSync(webDist, rootDist, { recursive: true });
  fs.cpSync(rootDist, webDist, { recursive: true });
}

console.log('✅ Postbuild: Both ./dist and ./apps/web/dist synchronized with production static assets and entrypoints.');
