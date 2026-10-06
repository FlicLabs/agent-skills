import { readdirSync, readFileSync, statSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
function files(directory) {
  return readdirSync(directory).flatMap(name => {
    const path = resolve(directory, name);
    if (['.git', 'node_modules', 'dist', 'evidence', '__pycache__'].includes(name)) return [];
    return statSync(path).isDirectory() ? files(path) : [path];
  });
}
for (const path of files(root)) {
  if (/\/\.env(?:\.|$)/.test(path)) throw new Error('Environment file in public package.');
  if (/\.(png|jpg|jpeg|webp|ico)$/.test(path)) continue;
  const text = readFileSync(path, 'utf8');
  if (/(?:sk_live_[A-Za-z0-9]{12,}|sk-proj-[A-Za-z0-9_-]{20,}|gh[pousr]_[A-Za-z0-9]{20,}|-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----)/.test(text)) throw new Error(`Potential secret: ${path}`);
  if (/\/Users\//.test(text)) throw new Error(`Private local path: ${path}`);
}
for (const product of ['geminilaunch', 'facesearchai']) {
  const directory = resolve(root, 'integrations/chatgpt', product);
  const manifest = JSON.parse(readFileSync(resolve(directory, 'plugin.json'), 'utf8'));
  const ui = manifest.extensions['com.openai'].interface;
  for (const key of ['displayName', 'shortDescription']) {
    if (!ui[key] || ui[key].length > 30) throw new Error(`Invalid ${key} for ${product}`);
  }
  for (const key of ['logo', 'composerIcon']) {
    const path = resolve(directory, ui[key]);
    if (!path.startsWith(directory + '/') || !existsSync(path)) throw new Error(`Missing ${key}: ${product}`);
    const bytes = readFileSync(path);
    if (!bytes.subarray(0, 8).equals(Buffer.from([137,80,78,71,13,10,26,10]))) throw new Error(`Invalid PNG: ${path}`);
    const width = bytes.readUInt32BE(16), height = bytes.readUInt32BE(20);
    if (width !== height || width < 48 || width > 4096) throw new Error(`Invalid icon dimensions for ${product}`);
  }
}
console.log('Public files and plugin metadata checks passed.');
