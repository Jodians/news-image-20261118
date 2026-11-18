// Entry for "Sum up 18 November's world news in one image".
// The picture is a pre-rendered PNG beside this file. This program validates it
// and copies its bytes to /output/entry.png, so two runs in identical sandboxes
// always produce byte-for-byte identical output.
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const source = join(here, 'entry.png');
const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';
const target = join(outDir, 'entry.png');

const png = readFileSync(source);
if (png.subarray(0, 8).toString('hex') !== '89504e470d0a1a0a') {
  throw new Error('entry.png is not a PNG');
}
const width = png.readUInt32BE(16);
const height = png.readUInt32BE(20);
if (width > 1024 || height > 1024) {
  throw new Error('entry.png exceeds the 1024x1024 cap');
}
if (png.length > 1048576) {
  throw new Error('entry.png exceeds the 1 MiB cap');
}
// A truncated file can still carry a valid signature and IHDR, so check the end too.
if (png.subarray(png.length - 8, png.length - 4).toString('ascii') !== 'IEND') {
  throw new Error('entry.png is truncated: missing IEND chunk');
}

mkdirSync(outDir, { recursive: true });
writeFileSync(target, png);
const written = readFileSync(target);
if (!written.equals(png)) {
  throw new Error('written bytes differ from the source bytes');
}
console.log(`entry.png: ${width}x${height}, ${written.length} bytes -> ${target}`);
