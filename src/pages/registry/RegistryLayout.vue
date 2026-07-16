<script setup>
import RegistrySiteFooter from "@/components/RegistrySiteFooter.vue";
import RegistrySiteHeader from "@/components/RegistrySiteHeader.vue";
</script>

<template>
  <div class="registry-shell">
    <RegistrySiteHeader />
    <div class="registry-shell__main"><router-view /></div>
    <RegistrySiteFooter />
  </div>
</template>

<style>
.registry-shell {
  --bg: #131619; --bg-soft: #1a1e22; --bg-panel: #1a1e22; --bg-panel-strong: #20252a; --bg-elevated: #20252a;
  --bg-ink: #0f1215; --bg-ink-soft: #15191d; --bg-sunken: #0f1215;
  --text: rgba(255,255,255,.92); --text-soft: rgba(255,255,255,.62); --text-muted: rgba(255,255,255,.4); --text-faint: rgba(255,255,255,.28);
  --line: rgba(255,255,255,.07); --line-soft: rgba(255,255,255,.045); --line-strong: rgba(255,255,255,.1); --line-ink: rgba(255,255,255,.08);
  --green: #22c55e; --green-soft: #4ade80; --green-bright: #86efac; --green-strong: #16a34a; --green-faint: rgba(34,197,94,.1); --green-line: rgba(34,197,94,.35);
  --danger: #f87171; --warning: #fbbf24; --link: #6bb8ff;
  --shadow-soft: 0 4px 24px rgba(0,0,0,.35); --shadow-panel: 0 8px 40px rgba(0,0,0,.42); --shadow-green: 0 12px 32px rgba(34,197,94,.18);
  --radius-sm: 6px; --radius-md: 10px; --radius-lg: 16px; --container: 1120px; --container-wide: 1240px;
  --font-sans: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  --font-mono: "JetBrains Mono", "SFMono-Regular", Consolas, "Liberation Mono", Menlo, monospace;
  --speed: 160ms;
  min-height: 100vh; display: flex; flex-direction: column; background: var(--bg); color: var(--text); font-family: var(--font-sans);
}
.registry-shell__main { min-height: 60vh; flex: 1; }
.registry-container { width: min(100% - 2rem, var(--container-wide)); margin-inline: auto; }
.registry-eyebrow { color: var(--green-soft); font-size: .7rem; font-weight: 750; letter-spacing: .14em; text-transform: uppercase; }
.registry-button { min-height: 40px; display: inline-flex; align-items: center; justify-content: center; gap: 8px; padding: 0 15px; border: 1px solid transparent; border-radius: var(--radius-md); background: var(--green); color: #07150c; font-size: .82rem; font-weight: 700; }
.registry-button:hover { background: var(--green-soft); color: #07150c; }
.registry-button--secondary { border-color: var(--line-strong); background: var(--bg-panel); color: var(--text); }
.registry-button--secondary:hover { border-color: var(--green-line); background: var(--bg-panel-strong); color: var(--green-soft); }
.registry-panel { overflow: hidden; border: 1px solid var(--line); border-radius: var(--radius-md); background: var(--bg-panel); }
.sr-only { position: absolute !important; width: 1px !important; height: 1px !important; overflow: hidden !important; clip: rect(0,0,0,0) !important; clip-path: inset(50%) !important; white-space: nowrap !important; }
.registry-shell :focus-visible { outline: 2px solid var(--green-soft); outline-offset: 3px; }
@media (max-width: 640px) { .registry-container { width: min(100% - 1.25rem, var(--container-wide)); } }
@media (prefers-reduced-motion: reduce) { .registry-shell *, .registry-shell *::before, .registry-shell *::after { scroll-behavior: auto !important; transition-duration: 1ms !important; animation-duration: 1ms !important; animation-iteration-count: 1 !important; } }
</style>
