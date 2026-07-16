<script setup>
defineProps({ title: { type: String, default: "Looking for private packages?" }, compact: { type: Boolean, default: false } });
</script>
<template>
  <aside class="private-notice" :class="{ 'private-notice--compact': compact }">
    <div><h2>{{ title }}</h2><p><slot>Private package hosting, workspace permissions, tokens, lockfiles, and shared build reports are available through Softadastra Cloud.</slot></p></div>
    <a href="https://cloud.softadastra.com" target="_blank" rel="noreferrer">Explore Softadastra Cloud <span aria-hidden="true">→</span></a>
  </aside>
</template>
<style scoped>
.private-notice { display: flex; align-items: center; justify-content: space-between; gap: 32px; padding: 24px; border: 1px solid var(--line); border-radius: var(--radius-md); background: var(--bg-soft); }
.private-notice h2 { font-size: 1rem; letter-spacing: 0; }
.private-notice p { max-width: 760px; margin-top: 7px; color: var(--text-muted); font-size: .82rem; line-height: 1.6; }
.private-notice a { flex-shrink: 0; color: var(--green-soft); font-size: .8rem; font-weight: 650; }
.private-notice--compact { align-items: start; flex-direction: column; padding: 18px; gap: 12px; }
@media (max-width: 720px) { .private-notice { align-items: start; flex-direction: column; } }
</style>
