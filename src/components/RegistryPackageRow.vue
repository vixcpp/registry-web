<script setup>
import { computed } from "vue";
const props = defineProps({ pkg: { type: Object, required: true } });
const id = computed(() => `${props.pkg.namespace}/${props.pkg.name}`);
const latest = computed(() => props.pkg.latestVersion || props.pkg.latest || "");
const repo = computed(() => typeof props.pkg.repo === "string" ? props.pkg.repo : props.pkg.repo?.url || "");
const updated = computed(() => {
  const raw = props.pkg.updatedAt || props.pkg.activityAt || props.pkg.api?.updatedAt || ""; if (!raw) return "";
  const date = new Date(raw); return Number.isNaN(date.getTime()) ? "" : new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric", year: "numeric" }).format(date);
});
const versionsCount = computed(() => props.pkg.versionsCount ?? Object.keys(props.pkg.versions || {}).length);
</script>
<template>
  <article class="package-row">
    <div class="package-row__main">
      <div class="package-row__name"><RouterLink class="package-row__namespace" :to="`/ns/${pkg.namespace}`">{{ pkg.namespace }}/</RouterLink><RouterLink :to="`/pkg/${pkg.namespace}/${pkg.name}`">{{ pkg.name }}</RouterLink></div>
      <p>{{ pkg.description || "No description provided." }}</p>
      <div class="package-row__meta"><span v-if="latest">v{{ latest }}</span><span v-if="pkg.license">{{ pkg.license }}</span><span v-if="versionsCount">{{ versionsCount }} {{ versionsCount === 1 ? "version" : "versions" }}</span><span v-if="updated">Updated {{ updated }}</span></div>
    </div>
    <div class="package-row__actions"><a v-if="repo" :href="repo" target="_blank" rel="noreferrer" aria-label="Open source repository">Repository</a><RouterLink :to="`/pkg/${pkg.namespace}/${pkg.name}`" :aria-label="`Open ${id}`">View <span aria-hidden="true">→</span></RouterLink></div>
  </article>
</template>
<style scoped>
.package-row { min-width: 0; display: flex; align-items: center; justify-content: space-between; gap: 24px; padding: 18px 20px; border-bottom: 1px solid var(--line); background: var(--bg-panel); }
.package-row:last-child { border-bottom: 0; }
.package-row:hover { background: var(--bg-panel-strong); }
.package-row__main { min-width: 0; }
.package-row__name { min-width: 0; display: flex; align-items: baseline; overflow-wrap: anywhere; font: 650 .9rem var(--font-mono); }
.package-row__name > a:last-child { color: var(--text); }
.package-row__namespace { color: var(--green-soft); }
.package-row p { max-width: 780px; margin-top: 7px; color: var(--text-soft); font-size: .82rem; line-height: 1.5; display: -webkit-box; overflow: hidden; -webkit-box-orient: vertical; -webkit-line-clamp: 2; }
.package-row__meta { display: flex; flex-wrap: wrap; gap: 7px 16px; margin-top: 10px; color: var(--text-muted); font: .68rem var(--font-mono); }
.package-row__meta span + span::before { content: ""; display: inline-block; width: 3px; height: 3px; margin: 0 10px 2px 0; border-radius: 50%; background: var(--text-faint); }
.package-row__actions { flex-shrink: 0; display: flex; align-items: center; gap: 13px; font-size: .76rem; }
.package-row__actions a { color: var(--text-muted); }
.package-row__actions a:last-child { color: var(--green-soft); font-weight: 650; }
@media (max-width: 680px) { .package-row { align-items: start; flex-direction: column; gap: 14px; padding: 17px; } .package-row__actions { width: 100%; justify-content: space-between; } }
</style>
