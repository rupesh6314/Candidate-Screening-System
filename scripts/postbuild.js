import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');
const webDist = path.resolve(projectRoot, 'apps/web/dist');
const rootDist = path.resolve(projectRoot, 'dist');

if (!fs.existsSync(webDist)) {
  fs.mkdirSync(webDist, { recursive: true });
}
if (!fs.existsSync(rootDist)) {
  fs.mkdirSync(rootDist, { recursive: true });
}

const entryContent = `// Auto-generated Vercel fullstack bridge entrypoint
import { app } from '../../../apps/api/dist/app.js';
export default app;
`;

const rootEntryContent = `// Auto-generated Vercel fullstack bridge entrypoint
import { app } from './apps/api/dist/app.js';
export default app;
`;

['index.js', 'server.js', 'app.js', 'index.cjs', 'server.cjs', 'app.cjs'].forEach((filename) => {
  fs.writeFileSync(path.join(webDist, filename), entryContent);
});

['index.js', 'server.js', 'app.js'].forEach((filename) => {
  fs.writeFileSync(path.join(rootDist, filename), rootEntryContent);
});

// Ensure both dist directories are perfectly synchronized
if (fs.existsSync(rootDist)) {
  fs.cpSync(rootDist, webDist, { recursive: true });
}
if (fs.existsSync(webDist)) {
  fs.cpSync(webDist, rootDist, { recursive: true });
}

console.log('✅ Postbuild: Both ./dist and ./apps/web/dist contain production build and entrypoints.');
