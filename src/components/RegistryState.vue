<script setup>
defineProps({ kind: { type: String, default: "empty" }, title: { type: String, required: true }, message: { type: String, default: "" } });
</script>
<template>
  <div class="registry-state" :class="`registry-state--${kind}`" :role="kind === 'error' ? 'alert' : undefined">
    <span v-if="kind === 'loading'" class="registry-spinner" aria-hidden="true" />
    <div><strong>{{ title }}</strong><p v-if="message">{{ message }}</p><div v-if="$slots.default" class="registry-state__action"><slot /></div></div>
  </div>
</template>
<style scoped>
.registry-state { min-height: 190px; display: flex; align-items: center; justify-content: center; gap: 13px; padding: 28px; border: 1px solid var(--line); border-radius: var(--radius-md); background: var(--bg-soft); text-align: center; }
.registry-state strong { font-size: .94rem; }
.registry-state p { max-width: 520px; margin-top: 7px; color: var(--text-muted); font-size: .82rem; line-height: 1.6; }
.registry-state--error strong { color: var(--danger); }
.registry-state__action { margin-top: 14px; }
.registry-spinner { width: 17px; height: 17px; border: 2px solid var(--line-strong); border-top-color: var(--green); border-radius: 50%; animation: state-spin .7s linear infinite; }
@keyframes state-spin { to { transform: rotate(360deg); } }
</style>
