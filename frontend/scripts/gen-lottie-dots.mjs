/**
 * Generates a tiny valid Lottie (3 pulsing black dots) for campus-style loaders.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.join(__dirname, '..', 'src', 'assets', 'lottie');
fs.mkdirSync(outDir, { recursive: true });

const dot = (x, delay) => ({
  ddd: 0,
  ind: delay + 1,
  ty: 4,
  nm: `dot${delay}`,
  sr: 1,
  ks: {
    o: {
      a: 1,
      k: [
        { t: 0 + delay * 5, s: [35], h: 1 },
        { t: 15 + delay * 5, s: [100], h: 1 },
        { t: 30 + delay * 5, s: [35], h: 1 },
        { t: 45 + delay * 5, s: [100], h: 1 },
        { t: 60 + delay * 5, s: [35], h: 1 },
      ],
    },
    r: { a: 0, k: 0 },
    p: { a: 0, k: [x, 100, 0] },
    a: { a: 0, k: [0, 0, 0] },
    s: {
      a: 1,
      k: [
        { t: 0 + delay * 5, s: [70, 70, 100], h: 1 },
        { t: 15 + delay * 5, s: [100, 100, 100], h: 1 },
        { t: 30 + delay * 5, s: [70, 70, 100], h: 1 },
        { t: 45 + delay * 5, s: [100, 100, 100], h: 1 },
        { t: 60 + delay * 5, s: [70, 70, 100], h: 1 },
      ],
    },
  },
  ao: 0,
  shapes: [
    {
      ty: 'gr',
      it: [
        { d: 1, ty: 'el', s: { a: 0, k: [22, 22] }, p: { a: 0, k: [0, 0] } },
        {
          ty: 'fl',
          c: { a: 0, k: [0, 0, 0, 1] },
          o: { a: 0, k: 100 },
          r: 1,
        },
        {
          ty: 'tr',
          p: { a: 0, k: [0, 0] },
          a: { a: 0, k: [0, 0] },
          s: { a: 0, k: [100, 100] },
          r: { a: 0, k: 0 },
          o: { a: 0, k: 100 },
        },
      ],
      nm: 'dot',
    },
  ],
  ip: 0,
  op: 90,
  st: 0,
});

const anim = {
  v: '5.7.4',
  fr: 30,
  ip: 0,
  op: 90,
  w: 200,
  h: 200,
  nm: 'campus-dots',
  ddd: 0,
  assets: [],
  layers: [dot(70, 0), dot(100, 1), dot(130, 2)],
};

fs.writeFileSync(path.join(outDir, 'campus-dots.json'), JSON.stringify(anim));
console.log('Wrote campus-dots.json');
