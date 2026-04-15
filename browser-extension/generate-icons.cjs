// Run: node generate-icons.js
// Generates PNG icons from the HUB Links SVG logo using canvas
const { createCanvas } = require('canvas');
const fs = require('fs');
const path = require('path');

const sizes = [16, 48, 128];

function drawIcon(size) {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');
  const s = size;
  const cx = s / 2, cy = s / 2;

  // Background
  ctx.fillStyle = '#0F172A';
  const r = s * 0.22;
  ctx.beginPath();
  ctx.moveTo(r, 0);
  ctx.lineTo(s - r, 0);
  ctx.quadraticCurveTo(s, 0, s, r);
  ctx.lineTo(s, s - r);
  ctx.quadraticCurveTo(s, s, s - r, s);
  ctx.lineTo(r, s);
  ctx.quadraticCurveTo(0, s, 0, s - r);
  ctx.lineTo(0, r);
  ctx.quadraticCurveTo(0, 0, r, 0);
  ctx.closePath();
  ctx.fill();

  // Satellite positions (corners)
  const off = s * 0.22;
  const satellites = [
    [off, off], [s - off, off],
    [off, s - off], [s - off, s - off],
  ];

  // Lines from center to satellites
  ctx.strokeStyle = 'rgba(245,158,11,0.65)';
  ctx.lineWidth = Math.max(1, s * 0.045);
  ctx.lineCap = 'round';
  satellites.forEach(([x, y]) => {
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(x, y);
    ctx.stroke();
  });

  // Satellite nodes
  ctx.fillStyle = 'rgba(245,158,11,0.85)';
  const sr = Math.max(1.5, s * 0.09);
  satellites.forEach(([x, y]) => {
    ctx.beginPath();
    ctx.arc(x, y, sr, 0, Math.PI * 2);
    ctx.fill();
  });

  // Center node
  ctx.fillStyle = '#F59E0B';
  ctx.beginPath();
  ctx.arc(cx, cy, Math.max(2, s * 0.16), 0, Math.PI * 2);
  ctx.fill();

  return canvas;
}

const iconsDir = path.join(__dirname, 'icons');
if (!fs.existsSync(iconsDir)) fs.mkdirSync(iconsDir);

sizes.forEach((size) => {
  const canvas = drawIcon(size);
  const buf = canvas.toBuffer('image/png');
  const out = path.join(iconsDir, `icon${size}.png`);
  fs.writeFileSync(out, buf);
  console.log(`✓ icon${size}.png`);
});

console.log('Icons generated in ./icons/');
