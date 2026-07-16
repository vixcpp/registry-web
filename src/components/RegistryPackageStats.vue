<script setup>
import { computed, onMounted, ref } from "vue";
import RegistryState from "@/components/RegistryState.vue";

const props = defineProps({ repository: { type: String, default: "" } });
const apiBase = (import.meta.env.VITE_GITHUB_API_BASE || "https://api.github.com").toString().replace(/\/+$/, "");
const loading = ref(true);
const error = ref("");
const stats = ref(null);
const repo = computed(() => {
  const match = props.repository.match(/github\.com[/:]([^/]+)\/([^/#]+?)(?:\.git)?(?:$|[/?#])/i);
  return match ? { owner: match[1], name: match[2].replace(/\.git$/, "") } : null;
});
const metrics = computed(() => stats.value ? [
  ["Stars", stats.value.stars], ["Forks", stats.value.forks],
  ["Open issues", stats.value.openIssues], ["Watchers", stats.value.watchers],
] : []);

const formatNumber = (value) => new Intl.NumberFormat(undefined, { notation: "compact", maximumFractionDigits: 1 }).format(Number(value || 0));
function formatDate(value) {
  const date = new Date(value);
  return value && !Number.isNaN(date.getTime()) ? new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(date) : "Not available";
}

async function loadStats() {
  if (!repo.value) {
    loading.value = false;
    error.value = "GitHub statistics are available when the package source is hosted on GitHub.";
    return;
  }
  const key = `vix-registry:github-stats:${repo.value.owner}/${repo.value.name}`;
  try {
    const cached = JSON.parse(sessionStorage.getItem(key) || "null");
    if (cached && Date.now() - cached.storedAt < 15 * 60 * 1000) {
      stats.value = cached.value;
      return;
    }
    const headers = { Accept: "application/vnd.github+json" };
    const token = import.meta.env.DEV ? String(import.meta.env.VITE_GITHUB_TOKEN || "").trim() : "";
    if (token) headers.Authorization = `Bearer ${token}`;
    const response = await fetch(`${apiBase}/repos/${repo.value.owner}/${repo.value.name}`, { headers });
    if (!response.ok) {
      if (response.status === 403) throw new Error("GitHub's public API rate limit has been reached. Try again later.");
      if (response.status === 404) throw new Error("The source repository is not publicly available on GitHub.");
      throw new Error(`GitHub returned ${response.status} while loading repository statistics.`);
    }
    const data = await response.json();
    stats.value = {
      stars: Number(data.stargazers_count || 0), forks: Number(data.forks_count || 0),
      openIssues: Number(data.open_issues_count || 0), watchers: Number(data.subscribers_count || 0),
      language: data.language || "Not specified", sizeKb: Number(data.size || 0),
      createdAt: data.created_at || "", pushedAt: data.pushed_at || "",
      defaultBranch: data.default_branch || "", topics: Array.isArray(data.topics) ? data.topics : [],
      archived: Boolean(data.archived), url: data.html_url || props.repository,
    };
    sessionStorage.setItem(key, JSON.stringify({ storedAt: Date.now(), value: stats.value }));
  } catch (reason) {
    error.value = reason?.message || "GitHub repository statistics could not be loaded.";
  } finally {
    loading.value = false;
  }
}
onMounted(loadStats);
</script>

<template>
  <div class="package-stats">
    <RegistryState v-if="loading" kind="loading" title="Loading repository statistics" message="Reading public data from GitHub." />
    <RegistryState v-else-if="error" kind="error" title="Statistics unavailable" :message="error" />
    <template v-else-if="stats">
      <div class="stats-grid" aria-label="GitHub repository metrics">
        <article v-for="([label, value]) in metrics" :key="label"><strong>{{ formatNumber(value) }}</strong><span>{{ label }}</span></article>
      </div>
      <div class="stats-details">
        <section><header><span>Repository</span><h3>Public activity</h3></header><dl>
          <div><dt>Primary language</dt><dd>{{ stats.language }}</dd></div><div><dt>Default branch</dt><dd>{{ stats.defaultBranch || "Not available" }}</dd></div>
          <div><dt>Repository size</dt><dd>{{ formatNumber(stats.sizeKb) }} KB</dd></div><div><dt>Created</dt><dd>{{ formatDate(stats.createdAt) }}</dd></div>
          <div><dt>Last source push</dt><dd>{{ formatDate(stats.pushedAt) }}</dd></div><div v-if="stats.archived"><dt>Status</dt><dd>Archived</dd></div>
        </dl></section>
        <section v-if="stats.topics.length"><header><span>GitHub metadata</span><h3>Topics</h3></header><div class="stats-topics"><span v-for="topic in stats.topics" :key="topic">{{ topic }}</span></div></section>
      </div>
      <footer><span>Public repository data provided by GitHub.</span><a :href="stats.url" target="_blank" rel="noreferrer">Open repository <span aria-hidden="true">↗</span></a></footer>
    </template>
  </div>
</template>

<style scoped>
.stats-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));border:1px solid var(--line);border-radius:var(--radius-md);overflow:hidden}.stats-grid article{padding:22px 18px;border-right:1px solid var(--line);background:var(--bg-panel)}.stats-grid article:last-child{border:0}.stats-grid strong{display:block;color:var(--text);font:650 1.55rem/1 var(--font-display)}.stats-grid article span{display:block;margin-top:8px;color:var(--text-muted);font:.66rem var(--font-mono);text-transform:uppercase}.stats-details{display:grid;grid-template-columns:minmax(0,1fr) minmax(220px,.55fr);gap:32px;margin-top:30px}.stats-details header{margin-bottom:12px}.stats-details header span{color:var(--green-soft);font:.63rem var(--font-mono);text-transform:uppercase}.stats-details h3{margin-top:4px;color:var(--text);font:650 1rem var(--font-display)}.stats-details dl{border:1px solid var(--line);border-radius:var(--radius-md);overflow:hidden}.stats-details dl div{display:flex;justify-content:space-between;gap:18px;padding:12px 14px;border-bottom:1px solid var(--line);font-size:.74rem}.stats-details dl div:last-child{border:0}.stats-details dt{color:var(--text-muted)}.stats-details dd{color:var(--text);font-family:var(--font-mono);text-align:right}.stats-topics{display:flex;flex-wrap:wrap;gap:8px}.stats-topics span{padding:6px 8px;border:1px solid var(--green-line);border-radius:var(--radius-sm);background:var(--green-wash);color:var(--green-soft);font:.65rem var(--font-mono)}.package-stats>footer{display:flex;justify-content:space-between;gap:20px;margin-top:26px;padding-top:14px;border-top:1px solid var(--line);color:var(--text-muted);font-size:.7rem}.package-stats>footer a{color:var(--green-soft)}@media(max-width:720px){.stats-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.stats-grid article:nth-child(2){border-right:0}.stats-grid article:nth-child(-n+2){border-bottom:1px solid var(--line)}.stats-details{grid-template-columns:1fr}.package-stats>footer{align-items:flex-start;flex-direction:column}}
</style>
