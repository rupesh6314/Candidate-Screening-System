import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

console.log('====================================================');
console.log('?? Smart Candidate Screening System — Placement Cell');
console.log('====================================================');
console.log('?? Launching Full-Stack Application...');
console.log('?? Backend REST API:  http://localhost:4000');
console.log('?? Frontend Portal:    http://localhost:5173\n');

const tsxBin = path.resolve(rootDir, 'node_modules/tsx/dist/cli.mjs');
const apiServer = path.resolve(rootDir, 'apps/api/src/server.ts');
const viteBin = path.resolve(rootDir, 'node_modules/vite/bin/vite.js');
const webDir = path.resolve(rootDir, 'apps/web');

// 1. Start Backend API Server
const api = spawn(process.execPath, [tsxBin, 'watch', apiServer], {
  cwd: path.resolve(rootDir, 'apps/api'),
  stdio: ['ignore', 'inherit', 'inherit'],
});

// 2. Start Frontend Vite Server
const web = spawn(process.execPath, [viteBin, webDir, '--host', '--port', '5173'], {
  cwd: rootDir,
  stdio: ['ignore', 'inherit', 'inherit'],
});

api.on('exit', (code) => {
  if (code && code !== 0) console.error(`API process exited: ${code}`);
});

web.on('exit', (code) => {
  if (code && code !== 0) console.error(`Web process exited: ${code}`);
});

process.on('SIGINT', () => {
  api.kill();
  web.kill();
  process.exit(0);
});

process.on('SIGTERM', () => {
  api.kill();
  web.kill();
  process.exit(0);
});
