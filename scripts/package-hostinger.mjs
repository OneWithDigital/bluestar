import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';
import { crc32, deflateRawSync } from 'node:zlib';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
execSync('npm run build:hostinger', { cwd: root, stdio: 'inherit' });
const build = path.join(root, 'dist-hostinger');
for (const name of ['index.html', '.htaccess']) {
  if (!fs.statSync(path.join(build, name)).isFile()) throw Error(`Missing ${name}`);
}

// Small standard ZIP archive, including dotfiles, with build files at its root.
const chunks = [], directory = [];
let offset = 0, count = 0;
const now = new Date();
const time = (now.getHours() << 11) | (now.getMinutes() << 5) | (now.getSeconds() >> 1);
const date = ((now.getFullYear() - 1980) << 9) | ((now.getMonth() + 1) << 5) | now.getDate();
function walk(relative = '') {
  for (const entry of fs.readdirSync(path.join(build, relative), { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
    const filename = relative ? relative + '/' + entry.name : entry.name;
    if (entry.isDirectory()) { walk(filename); continue; }
    if (!entry.isFile()) throw Error(`Unsupported build entry: ${filename}`);
    const name = Buffer.from(filename, 'utf8');
    const content = fs.readFileSync(path.join(build, filename));
    const compressed = deflateRawSync(content);
    const checksum = crc32(content);
    const header = Buffer.alloc(30);
    header.writeUInt32LE(0x04034b50, 0);
    header.writeUInt16LE(20, 4);
    header.writeUInt16LE(0x800, 6);
    header.writeUInt16LE(8, 8);
    header.writeUInt16LE(time, 10);
    header.writeUInt16LE(date, 12);
    header.writeUInt32LE(checksum, 14);
    header.writeUInt32LE(compressed.length, 18);
    header.writeUInt32LE(content.length, 22);
    header.writeUInt16LE(name.length, 26);
    chunks.push(header, name, compressed);
    const central = Buffer.alloc(46);
    central.writeUInt32LE(0x02014b50, 0);
    central.writeUInt16LE(20, 4);
    header.copy(central, 6, 4, 30);
    central.writeUInt32LE(offset, 42);
    directory.push(central, name);
    offset += header.length + name.length + compressed.length;
    count++;
  }
}
walk();
const central = Buffer.concat(directory);
const end = Buffer.alloc(22);
end.writeUInt32LE(0x06054b50, 0);
end.writeUInt16LE(count, 8);
end.writeUInt16LE(count, 10);
end.writeUInt32LE(central.length, 12);
end.writeUInt32LE(offset, 16);
const artifacts = path.join(root, 'artifacts');
fs.mkdirSync(artifacts, { recursive: true });
const stamp = now.toISOString().replace(/[-:]/g, '').replace('T', '_').slice(0, 15);
const archive = path.join(artifacts, `blue-star-barns-hostinger_${stamp}.zip`);
fs.writeFileSync(archive, Buffer.concat([...chunks, central, end]), { flag: 'wx' });
console.log(`Hostinger archive (${count} files): ${archive}`);
