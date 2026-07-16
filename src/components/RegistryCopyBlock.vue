<script setup>
import { ref } from "vue";
const props = defineProps({ value: { type: String, required: true }, label: { type: String, default: "Command" }, language: { type: String, default: "shell" } });
const copied = ref(false);
async function copy() {
  try { await navigator.clipboard.writeText(props.value); }
  catch {
    const input = document.createElement("textarea"); input.value = props.value; input.style.position = "fixed"; input.style.opacity = "0"; document.body.appendChild(input); input.select(); document.execCommand("copy"); input.remove();
  }
  copied.value = true; window.setTimeout(() => { copied.value = false; }, 1400);
}
</script>
<template>
  <div class="copy-block">
    <div class="copy-block__bar"><span>{{ label }}</span><button type="button" @click="copy" :aria-label="`Copy ${label}`">{{ copied ? "Copied" : "Copy" }}</button></div>
    <pre><code :class="`language-${language}`">{{ value }}</code></pre>
    <span class="sr-only" aria-live="polite">{{ copied ? `${label} copied` : "" }}</span>
  </div>
</template>
<style scoped>
.copy-block { overflow: hidden; border: 1px solid var(--line-strong); border-radius: var(--radius-md); background: var(--bg-ink); }
.copy-block__bar { min-height: 38px; display: flex; align-items: center; justify-content: space-between; gap: 16px; padding: 0 10px 0 14px; border-bottom: 1px solid var(--line-ink); color: var(--text-muted); font: .68rem var(--font-mono); }
.copy-block button { padding: 5px 9px; border: 1px solid var(--line-ink); border-radius: var(--radius-sm); background: rgba(255,255,255,.04); color: var(--text-soft); font-size: .68rem; }
.copy-block button:hover, .copy-block button:focus-visible { border-color: var(--green-line); color: var(--green-bright); }
.copy-block pre { max-width: 100%; margin: 0; padding: 16px; border: 0; border-radius: 0; background: transparent; color: var(--text); font: .79rem/1.65 var(--font-mono); white-space: pre; overflow-x: auto; }
</style>
