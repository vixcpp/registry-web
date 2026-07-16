<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import PrivatePackagesNotice from "@/components/PrivatePackagesNotice.vue";
import RegistryPackageRow from "@/components/RegistryPackageRow.vue";
import RegistryPageHeader from "@/components/RegistryPageHeader.vue";
import RegistryState from "@/components/RegistryState.vue";
import { loadRegistryIndex } from "@/lib/loadRegistryIndex";
import RegistrySearchWorker from "@/workers/registrySearch.worker.js?worker";

const route = useRoute();
const router = useRouter();
const worker = new RegistrySearchWorker();
const searchInput = ref(null);
const q = ref(String(route.query.q || ""));
const namespace = ref(String(route.query.ns || ""));
const page = ref(Math.max(1, Number(route.query.page || 1)));
const hits = ref([]);
const total = ref(0);
const totalAll = ref(0);
const namespaceCounts = ref([]);
const loading = ref(true);
const searching = ref(false);
const error = ref("");
const pageSize = 30;

const query = computed(() => q.value.trim());
const totalPages = computed(() => Math.max(1, Math.ceil(total.value / pageSize)));
const offset = computed(() => (page.value - 1) * pageSize);
const resultTitle = computed(() => query.value ? `Results for “${query.value}”` : namespace.value ? `Public packages in ${namespace.value}` : "All public packages");

const pageButtons = computed(() => {
  const values = [1];
  const start = Math.max(2, page.value - 2), end = Math.min(totalPages.value - 1, page.value + 2);
  if (start > 2) values.push("…");
  for (let value = start; value <= end; value += 1) values.push(value);
  if (end < totalPages.value - 1) values.push("…");
  if (totalPages.value > 1) values.push(totalPages.value);
  return values;
});

function search() {
  searching.value = true;
  worker.postMessage({ type: "search", query: query.value, namespace: namespace.value || null, limit: pageSize, offset: offset.value, sort: query.value ? "score" : "latest" });
}

function navigate(nextQuery = q.value, nextPage = 1, nextNamespace = namespace.value) {
  const params = {};
  if (String(nextQuery).trim()) params.q = String(nextQuery).trim();
  if (nextNamespace) params.ns = nextNamespace;
  if (nextPage > 1) params.page = nextPage;
  router.push({ path: "/browse", query: params });
}

function submit() { navigate(q.value, 1, namespace.value); }
function resetSearch() { q.value = ""; navigate("", 1, namespace.value); nextTick(() => searchInput.value?.focus()); }
function selectNamespace(value) { navigate(q.value, 1, value); }
function setPage(value) { navigate(q.value, Math.max(1, Math.min(Number(value), totalPages.value)), namespace.value); }

function onKeydown(event) {
  const target = event.target;
  const typing = target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement || target?.isContentEditable;
  if (((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") || (event.key === "/" && !typing)) { event.preventDefault(); searchInput.value?.focus(); }
  if (event.key === "Escape" && document.activeElement === searchInput.value && q.value) { event.preventDefault(); resetSearch(); }
}

onMounted(async () => {
  document.addEventListener("keydown", onKeydown);
  worker.onmessage = ({ data }) => {
    if (data.type === "loaded") { worker.postMessage({ type: "getNamespaceCounts" }); search(); return; }
    if (data.type === "namespaceCounts") {
      namespaceCounts.value = Object.entries(data.counts || {}).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
      totalAll.value = namespaceCounts.value.reduce((sum, item) => sum + item.count, 0); return;
    }
    if (data.type === "searchResult") { hits.value = data.hits || []; total.value = Number(data.total || 0); loading.value = false; searching.value = false; return; }
    if (data.type === "error") { error.value = data.error || "Search failed."; loading.value = false; searching.value = false; }
  };
  try { const { data } = await loadRegistryIndex(); worker.postMessage({ type: "load", data }); }
  catch { error.value = "The public registry index could not be loaded."; loading.value = false; }
});

watch(() => [route.query.q, route.query.ns, route.query.page], ([nextQ, nextNs, nextPage]) => {
  q.value = String(nextQ || ""); namespace.value = String(nextNs || ""); page.value = Math.max(1, Number(nextPage || 1));
  if (!loading.value && !error.value) search();
});

onBeforeUnmount(() => { document.removeEventListener("keydown", onKeydown); worker.terminate(); });
</script>

<template>
  <div class="browse-page registry-container">
    <RegistryPageHeader title="Browse public packages" description="Search public C++ packages published for the Vix ecosystem.">
      <template #actions><RouterLink class="registry-button registry-button--secondary" to="/publish">Publish a package</RouterLink></template>
    </RegistryPageHeader>

    <form class="package-search" role="search" @submit.prevent="submit">
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="11" cy="11" r="6.8" stroke="currentColor" stroke-width="1.7"/><path d="m16 16 4 4" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg>
      <label class="sr-only" for="browse-search">Search public packages</label>
      <input id="browse-search" ref="searchInput" v-model="q" type="search" placeholder="Search by package, namespace, or description" autocomplete="off" spellcheck="false" />
      <kbd aria-hidden="true">/</kbd>
      <button type="submit">Search</button>
    </form>
    <p class="search-status" aria-live="polite">{{ searching && !loading ? "Updating results…" : "" }}</p>

    <div class="browse-layout">
      <aside class="namespace-filter" aria-label="Filter by namespace">
        <h2>Namespaces</h2>
        <button type="button" :class="{ active: !namespace }" @click="selectNamespace('')"><span>All packages</span><b>{{ totalAll }}</b></button>
        <button v-for="item in namespaceCounts" :key="item.name" type="button" :class="{ active: namespace === item.name }" @click="selectNamespace(item.name)"><span>{{ item.name }}</span><b>{{ item.count }}</b></button>
      </aside>

      <section class="results" aria-labelledby="results-title">
        <div class="results__header"><div><h2 id="results-title">{{ resultTitle }}</h2><span v-if="!loading && !error">{{ total }} {{ total === 1 ? "package" : "packages" }}</span></div><button v-if="query" type="button" @click="resetSearch">Clear search</button></div>

        <RegistryState v-if="loading" kind="loading" title="Loading public packages" message="Reading the current Vix Registry index." />
        <RegistryState v-else-if="error" kind="error" title="Registry unavailable" :message="error"><button class="registry-button registry-button--secondary" type="button" @click="router.go(0)">Try again</button></RegistryState>
        <RegistryState v-else-if="totalAll === 0" title="No public packages yet" message="The registry index does not contain any published package." />
        <RegistryState v-else-if="hits.length === 0" title="No matching packages" :message="query ? `No public package matches “${query}”.` : 'This page does not contain any package.'"><button v-if="query" class="registry-button registry-button--secondary" type="button" @click="resetSearch">Reset search</button></RegistryState>
        <div v-else class="registry-panel package-list"><RegistryPackageRow v-for="pkg in hits" :key="pkg.id" :pkg="pkg" /></div>

        <nav v-if="!loading && !error && totalPages > 1" class="pagination" aria-label="Package results pages">
          <button type="button" :disabled="page === 1" @click="setPage(page - 1)">Previous</button>
          <template v-for="button in pageButtons" :key="button"><span v-if="button === '…'">…</span><button v-else type="button" :class="{ active: button === page }" :aria-current="button === page ? 'page' : undefined" @click="setPage(button)">{{ button }}</button></template>
          <button type="button" :disabled="page === totalPages" @click="setPage(page + 1)">Next</button>
        </nav>
      </section>
    </div>

    <PrivatePackagesNotice class="cloud-notice" />
  </div>
</template>

<style scoped>
.browse-page { padding-bottom: 72px; }
.package-search { min-height: 58px; display: grid; grid-template-columns: auto minmax(0,1fr) auto auto; align-items: center; gap: 12px; padding: 7px 7px 7px 18px; border: 1px solid var(--line-strong); border-radius: var(--radius-md); background: var(--bg-panel); box-shadow: var(--shadow-soft); }
.package-search:focus-within { border-color: var(--green-line); box-shadow: 0 0 0 3px var(--green-faint); }
.package-search svg { width: 19px; color: var(--text-muted); }
.package-search input { min-width: 0; border: 0; outline: 0; background: transparent; color: var(--text); }
.package-search input::placeholder { color: var(--text-muted); }
.package-search kbd { padding: 3px 7px; border: 1px solid var(--line-strong); border-radius: var(--radius-sm); background: var(--bg-ink); color: var(--text-muted); font: .68rem var(--font-mono); }
.package-search button { align-self: stretch; min-width: 88px; border-radius: var(--radius-sm); background: var(--green); color: #07150c; font-weight: 700; }
.search-status { min-height: 20px; padding: 5px 2px 0; color: var(--text-muted); font: .68rem var(--font-mono); }
.browse-layout { display: grid; grid-template-columns: 190px minmax(0,1fr); gap: 30px; margin-top: 20px; }
.namespace-filter { position: sticky; top: 84px; height: fit-content; }
.namespace-filter h2 { margin-bottom: 9px; color: var(--text-muted); font-size: .68rem; letter-spacing: .1em; text-transform: uppercase; }
.namespace-filter button { width: 100%; min-height: 34px; display: flex; align-items: center; justify-content: space-between; gap: 8px; padding: 0 9px; border-radius: var(--radius-sm); background: transparent; color: var(--text-soft); text-align: left; }
.namespace-filter button:hover { background: var(--bg-soft); }
.namespace-filter button.active { background: var(--green-faint); color: var(--green-soft); }
.namespace-filter span { min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font: .76rem var(--font-mono); }
.namespace-filter b { color: var(--text-muted); font-size: .68rem; font-weight: 500; }
.results { min-width: 0; }
.results__header { min-height: 38px; display: flex; align-items: start; justify-content: space-between; gap: 20px; margin-bottom: 12px; }
.results__header > div { display: flex; align-items: baseline; gap: 10px; }
.results__header h2 { font-size: .96rem; letter-spacing: 0; }
.results__header span { color: var(--text-muted); font: .68rem var(--font-mono); }
.results__header button { background: transparent; color: var(--green-soft); font-size: .76rem; }
.package-list { min-width: 0; }
.pagination { display: flex; align-items: center; justify-content: center; flex-wrap: wrap; gap: 5px; margin-top: 22px; }
.pagination button, .pagination span { min-width: 34px; height: 34px; display: inline-flex; align-items: center; justify-content: center; padding: 0 9px; border: 1px solid var(--line); border-radius: var(--radius-sm); background: var(--bg-panel); color: var(--text-soft); font-size: .74rem; }
.pagination button.active { border-color: var(--green-line); background: var(--green-faint); color: var(--green-soft); }
.pagination button:disabled { opacity: .35; cursor: not-allowed; }
.cloud-notice { margin-top: 64px; }
@media (max-width: 800px) { .browse-layout { grid-template-columns: 1fr; } .namespace-filter { position: static; display: flex; gap: 5px; overflow-x: auto; padding-bottom: 5px; } .namespace-filter h2 { display: none; } .namespace-filter button { width: auto; flex: 0 0 auto; } }
@media (max-width: 560px) { .package-search { grid-template-columns: auto minmax(0,1fr) auto; } .package-search kbd { display: none; } .package-search button { min-width: 50px; font-size: 0; } .package-search button::after { content: "→"; font-size: 1rem; } .results__header { align-items: start; flex-direction: column; } }
</style>
