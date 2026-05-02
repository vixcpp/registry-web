<template>
  <canvas ref="cv" class="net" aria-hidden="true"></canvas>
</template>

<script setup>
import { onMounted, onBeforeUnmount, ref } from "vue";

const cv = ref(null);

/* ---- state (module-scoped, not reactive) ---- */
let raf = 0;
let ctx = null;
let w = 0;
let h = 0;
let dpr = 1;
let ro = null;
let running = false;

const nodes = [];
const BASE_NODES = 48;

const mouse = {
  x: 0,
  y: 0,
  active: false,
  down: false,
  lastSpawnX: 0,
  lastSpawnY: 0,
};

/* ---- helpers ---- */
function rand(min, max) { return min + Math.random() * (max - min); }
function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }

/* ---- colors ---- */
function pickTone() {
  const r = Math.random();
  if (r < 0.70) return "green";
  if (r < 0.88) return "slate";
  return "teal";
}

function toneColor(tone, alpha) {
  if (tone === "green")  return `rgba(34,197,94,${alpha})`;
  if (tone === "teal")   return `rgba(94,234,212,${alpha})`;
  return                        `rgba(148,163,184,${alpha})`;
}

function lineColor(alpha) {
  return `rgba(34,197,94,${alpha})`;
}

/* ---- node management ---- */
function spawnNode(x, y, calm = false) {
  nodes.push({
    x,
    y,
    vx: calm ? rand(-0.12, 0.12) : rand(-0.5, 0.5),
    vy: calm ? rand(-0.12, 0.12) : rand(-0.5, 0.5),
    s:  Math.random() < 0.14 ? 7 : 5,
    a:  rand(0.2, 0.58),
    tone: pickTone(),
  });
}

function ensureNodeCount() {
  const target = BASE_NODES + Math.floor((w * h) / 65000);
  while (nodes.length < target) spawnNode(rand(0, w), rand(0, h), true);
  while (nodes.length > target + 20) nodes.splice(BASE_NODES, 1); // trim gently from middle
}

/* ---- resize ---- */
function resize() {
  const el = cv.value;
  if (!el) return;

  const rect = el.getBoundingClientRect();
  dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
  w   = Math.floor(rect.width);
  h   = Math.floor(rect.height);

  el.width  = Math.floor(w * dpr);
  el.height = Math.floor(h * dpr);

  ctx = el.getContext("2d");
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  ensureNodeCount();
}

/* ---- animation loop ---- */
function step() {
  if (!running) return;
  raf = requestAnimationFrame(step);

  if (!ctx || w === 0 || h === 0) return;
  ctx.clearRect(0, 0, w, h);

  const maxDist  = clamp(w * 0.17, 130, 240);
  const maxDist2 = maxDist * maxDist;
  const pullR    = 200;
  const pullR2   = pullR * pullR;

  /* update nodes */
  for (const n of nodes) {
    if (mouse.active) {
      const dx = mouse.x - n.x;
      const dy = mouse.y - n.y;
      const d2 = dx * dx + dy * dy;
      if (d2 < pullR2) {
        const d = Math.max(1, Math.sqrt(d2));
        const f = (1 - d / pullR) * 0.012;
        n.vx += (dx / d) * f;
        n.vy += (dy / d) * f;
      }
    }

    n.x  += n.vx;
    n.y  += n.vy;
    n.vx *= 0.996;
    n.vy *= 0.996;

    if (n.x < 0)  { n.x = 0;  n.vx =  Math.abs(n.vx); }
    if (n.x > w)  { n.x = w;  n.vx = -Math.abs(n.vx); }
    if (n.y < 0)  { n.y = 0;  n.vy =  Math.abs(n.vy); }
    if (n.y > h)  { n.y = h;  n.vy = -Math.abs(n.vy); }
  }

  /* draw lines */
  ctx.lineWidth = 1;
  for (let i = 0; i < nodes.length; i++) {
    const a = nodes[i];
    for (let j = i + 1; j < nodes.length; j++) {
      const b  = nodes[j];
      const dx = a.x - b.x;
      const dy = a.y - b.y;
      const d2 = dx * dx + dy * dy;
      if (d2 > maxDist2) continue;

      const d = Math.sqrt(d2);
      let alpha = (1 - d / maxDist) * 0.38;

      if (mouse.active) {
        const mx  = (a.x + b.x) * 0.5 - mouse.x;
        const my  = (a.y + b.y) * 0.5 - mouse.y;
        const md2 = mx * mx + my * my;
        if (md2 < 200 * 200) alpha *= 1.6;
      }

      alpha = clamp(alpha, 0.02, 0.52);
      ctx.strokeStyle = lineColor(alpha);
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);
      ctx.stroke();
    }
  }

  /* draw nodes */
  for (const n of nodes) {
    const a = clamp(mouse.active ? n.a * 1.08 : n.a, 0.1, 0.9);
    ctx.fillStyle = toneColor(n.tone, a);
    ctx.fillRect(n.x - n.s / 2, n.y - n.s / 2, n.s, n.s);
  }

  /* soft vignette */
  const cx = w * 0.5;
  const cy = h * 0.52;
  const r  = Math.max(w, h) * 0.62;
  const g  = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
  g.addColorStop(0,   "rgba(0,0,0,0)");
  g.addColorStop(0.6, "rgba(0,0,0,0)");
  g.addColorStop(1,   "rgba(0,0,0,0.45)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
}

/* ---- pointer events ---- */
function getPos(e) {
  const rect = cv.value.getBoundingClientRect();
  return { x: e.clientX - rect.left, y: e.clientY - rect.top };
}

function maybeSpawn(x, y) {
  const dx = x - mouse.lastSpawnX;
  const dy = y - mouse.lastSpawnY;
  if (dx * dx + dy * dy < 20 * 20) return;
  mouse.lastSpawnX = x;
  mouse.lastSpawnY = y;
  const count = Math.random() < 0.3 ? 2 : 1;
  for (let i = 0; i < count; i++) {
    spawnNode(x + rand(-8, 8), y + rand(-8, 8), false);
  }
}

function onMove(e) {
  if (!cv.value) return;
  const p   = getPos(e);
  mouse.x   = p.x;
  mouse.y   = p.y;
  mouse.active = true;
  if (mouse.down) maybeSpawn(p.x, p.y);
}

function onDown(e) {
  if (!cv.value) return;
  const p      = getPos(e);
  mouse.down   = true;
  mouse.active = true;
  mouse.x      = p.x;
  mouse.y      = p.y;
  mouse.lastSpawnX = p.x;
  mouse.lastSpawnY = p.y;
  for (let i = 0; i < 4; i++) {
    spawnNode(p.x + rand(-12, 12), p.y + rand(-12, 12), false);
  }
}

function onUp()    { mouse.down = false; }
function onLeave() { mouse.active = false; mouse.down = false; }

/* ---- lifecycle ---- */
onMounted(() => {
  const el = cv.value;
  if (!el) return;

  running = true;
  resize();

  /* seed initial nodes */
  if (nodes.length === 0) {
    for (let i = 0; i < BASE_NODES; i++) {
      spawnNode(rand(0, w || 800), rand(0, h || 600), true);
    }
    ensureNodeCount();
  }

  /* pointer */
  window.addEventListener("pointermove", onMove, { passive: true });
  window.addEventListener("pointerdown", onDown, { passive: true });
  window.addEventListener("pointerup", onUp, { passive: true });
  window.addEventListener("blur", onLeave);

  /* resize observer — correct way */
  ro = new ResizeObserver(() => resize());
  ro.observe(el);

  /* kick off loop */
  raf = requestAnimationFrame(step);
});

/* ---- THIS must be at the TOP LEVEL of setup, NOT inside onMounted ---- */
onBeforeUnmount(() => {
  running = false;
  cancelAnimationFrame(raf);

  const el = cv.value;
  window.removeEventListener("pointermove", onMove);
  window.removeEventListener("pointerdown", onDown);
  window.removeEventListener("pointerup", onUp);
  window.removeEventListener("blur", onLeave);

  if (ro) { ro.disconnect(); ro = null; }

  /* reset shared state for potential remounts */
  nodes.length  = 0;
  ctx           = null;
  w = h         = 0;
});
</script>

<style scoped>
.net {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  display: block;
  pointer-events: none;
}
</style>
