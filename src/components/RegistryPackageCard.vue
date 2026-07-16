<script setup>
import { computed } from "vue";

const props = defineProps({
  pkg: { type: Object, required: true },
  github: { type: Object, default: null },
});

const packagePath = computed(() => `/pkg/${props.pkg.namespace}/${props.pkg.name}`);

const dateLabel = computed(() => {
  const raw = props.pkg.activityAt || props.github?.pushed_at || "";
  if (!raw) return "";
  const date = new Date(raw);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric", year: "numeric" }).format(date);
});

const stars = computed(() => Number.isFinite(props.github?.stargazers_count) ? props.github.stargazers_count : null);
</script>

<template>
  <RouterLink class="package-card" :to="packagePath">
    <div class="package-card__top">
      <span class="package-card__scope">{{ pkg.namespace }}/</span>
      <span v-if="pkg.latestVersion" class="package-card__version">v{{ pkg.latestVersion }}</span>
    </div>
    <h3>{{ pkg.name }}</h3>
    <p>{{ pkg.description || "No description provided." }}</p>
    <div class="package-card__meta">
      <span v-if="dateLabel">Updated {{ dateLabel }}</span>
      <span v-if="pkg.versionsCount">{{ pkg.versionsCount }} {{ pkg.versionsCount === 1 ? "version" : "versions" }}</span>
      <span v-if="stars !== null" class="package-card__stars" title="GitHub stars">
        <svg viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="m10 2.2 2.3 4.65 5.13.75-3.71 3.62.87 5.11L10 13.92l-4.59 2.41.87-5.11L2.57 7.6l5.13-.75L10 2.2Z" stroke="currentColor" stroke-width="1.35" stroke-linejoin="round" /></svg>
        {{ stars.toLocaleString() }}
      </span>
    </div>
  </RouterLink>
</template>

<style scoped>
.package-card { min-width: 0; min-height: 190px; display: flex; flex-direction: column; padding: 20px; border: 1px solid var(--line); border-radius: var(--radius-md); background: var(--bg-panel); box-shadow: var(--shadow-soft); transition: border-color var(--speed), background var(--speed), transform var(--speed), box-shadow var(--speed); }
.package-card:hover { color: inherit; border-color: var(--green-line); background: var(--bg-panel-strong); box-shadow: var(--shadow-panel); transform: translateY(-2px); }
.package-card__top { display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-bottom: 14px; }
.package-card__scope { min-width: 0; overflow: hidden; color: var(--green-soft); font-family: var(--font-mono); font-size: .76rem; font-weight: 650; text-overflow: ellipsis; white-space: nowrap; }
.package-card__version { flex-shrink: 0; padding: 3px 7px; border: 1px solid var(--line-strong); border-radius: var(--radius-sm); color: var(--text-muted); font-family: var(--font-mono); font-size: .68rem; }
.package-card h3 { overflow-wrap: anywhere; font-size: 1.1rem; letter-spacing: 0; }
.package-card p { margin-top: 9px; color: var(--text-soft); font-size: .88rem; line-height: 1.55; display: -webkit-box; overflow: hidden; -webkit-box-orient: vertical; -webkit-line-clamp: 3; }
.package-card__meta { display: flex; align-items: center; flex-wrap: wrap; gap: 7px 12px; margin-top: auto; padding-top: 18px; color: var(--text-muted); font-family: var(--font-mono); font-size: .68rem; }
.package-card__meta > span + span::before { content: ""; display: inline-block; width: 3px; height: 3px; margin: 0 9px 2px 0; border-radius: 50%; background: var(--text-faint); }
.package-card__stars { display: inline-flex; align-items: center; }
.package-card__stars svg { width: 12px; height: 12px; margin-right: 4px; }
</style>
