<script setup>
defineProps({ eyebrow: { type: String, default: "Vix Registry" }, title: { type: String, required: true }, description: { type: String, default: "" } });
</script>
<template>
  <header class="page-header">
    <div><span class="registry-eyebrow">{{ eyebrow }}</span><h1>{{ title }}</h1><p v-if="description">{{ description }}</p></div>
    <div v-if="$slots.actions" class="page-header__actions"><slot name="actions" /></div>
  </header>
</template>
<style scoped>
.page-header { display: flex; align-items: end; justify-content: space-between; gap: 32px; padding: 48px 0 30px; }
.page-header h1 { margin-top: 9px; font-size: clamp(2rem, 4vw, 3.3rem); line-height: 1.02; letter-spacing: -.04em; }
.page-header p { max-width: 650px; margin-top: 13px; color: var(--text-soft); line-height: 1.65; }
.page-header__actions { flex-shrink: 0; }
@media (max-width: 680px) { .page-header { align-items: start; flex-direction: column; padding-top: 36px; } }
</style>
