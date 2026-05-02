<template>
  <div class="rb">

    <!-- ══ TOPBAR ══ -->
    <header class="rb-topbar">
      <div class="rb-topbar-inner">

        <RouterLink class="rb-brand" to="/" aria-label="Registry home">
          <svg class="rb-brand-mark" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="bgl" x1="5" y1="6" x2="18" y2="30" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stop-color="#d4fcd4"/>
                <stop offset="55%" stop-color="#4ade80"/>
                <stop offset="100%" stop-color="#22c55e"/>
              </linearGradient>
              <linearGradient id="bgr" x1="31" y1="6" x2="18" y2="30" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stop-color="#22c55e"/>
                <stop offset="100%" stop-color="#15803d"/>
              </linearGradient>
            </defs>
            <polygon points="5,6 12,6 18,28 14,28" fill="url(#bgl)"/>
            <polygon points="31,6 24,6 18,28 22,28" fill="url(#bgr)"/>
            <line x1="9" y1="16" x2="13.5" y2="29" stroke="#bbf7d0" stroke-width="1.1" stroke-linecap="round" opacity="0.7"/>
          </svg>
          <span class="rb-brand-name">Vix</span><span class="rb-brand-dim"> Registry</span>
        </RouterLink>

        <form class="rb-search" @submit.prevent="goSearch()" role="search">
          <svg class="rb-search-icon" viewBox="0 0 20 20" fill="none">
            <circle cx="9" cy="9" r="6" stroke="currentColor" stroke-width="1.5"/>
            <path d="M13.5 13.5L17 17" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
          </svg>
          <input
            ref="searchEl"
            v-model="q"
            class="rb-search-in"
            type="search"
            placeholder="Search packages…"
            autocomplete="off"
            spellcheck="false"
          />
          <button v-if="q" type="button" class="rb-search-clear" @click="clearSearch">
            <svg viewBox="0 0 16 16" fill="none"><path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>
          </button>
          <kbd class="rb-kbd">⌘K</kbd>
        </form>

        <RouterLink class="rb-publish-btn" to="/publish">Publish</RouterLink>

      </div>
    </header>

    <!-- ══ BODY ══ -->
    <div class="rb-layout">

      <!-- Sidebar -->
      <aside class="rb-sidebar">
        <div class="rb-sidebar-group">
          <div class="rb-sidebar-heading">Namespaces</div>
          <button type="button" class="rb-ns-btn" :class="{ active: !activeNs }" @click="setNs(null)">
            <span class="rb-ns-label">All packages</span>
            <span class="rb-ns-count">{{ totalAll }}</span>
          </button>
          <button
            v-for="ns in nsCounts"
            :key="ns.name"
            type="button"
            class="rb-ns-btn"
            :class="{ active: activeNs === ns.name }"
            @click="setNs(ns.name)"
          >
            <span class="rb-ns-label">@{{ ns.name }}</span>
            <span class="rb-ns-count">{{ ns.count }}</span>
          </button>
        </div>
      </aside>

      <!-- Main -->
      <main class="rb-main">

        <div class="rb-head">
          <div class="rb-head-left">
            <span v-if="queryTrimmed" class="rb-head-title">Results for <em>"{{ queryTrimmed }}"</em></span>
            <span v-else-if="activeNs" class="rb-head-title">@{{ activeNs }}</span>
            <span v-else class="rb-head-title">All packages</span>
            <span v-if="!loading && !error" class="rb-head-count">{{ total }}</span>
          </div>
          <span v-if="!loading && indexLabel" class="rb-index-date">{{ indexLabel }}</span>
        </div>

        <div v-if="loading" class="rb-state">
          <span class="rb-spinner"></span>
          Loading registry index…
        </div>

        <div v-else-if="error" class="rb-state rb-state--error">
          <svg viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="8" stroke="currentColor" stroke-width="1.5"/><path d="M10 6v4M10 13h.01" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
          {{ error }}
        </div>

        <div v-else-if="hits.length === 0" class="rb-empty">
          <div class="rb-empty-title">No packages found</div>
          <div class="rb-empty-desc">
            Try a different search or <button type="button" class="rb-empty-reset" @click="clearSearch">clear</button>.
          </div>
        </div>

        <ul v-else class="rb-list" role="list">
          <li v-for="h in hits" :key="h.id" class="rb-row">
            <button type="button" class="rb-row-btn" @click="openPkg(h)">
              <div class="rb-row-main">
                <div class="rb-row-id">
                  <span class="rb-row-ns">@{{ h.namespace }}</span><span class="rb-row-slash">/</span><span class="rb-row-name">{{ h.name }}</span>
                </div>
                <div v-if="h.description && h.description !== 'A tiny header-only C++ library.'" class="rb-row-desc">{{ h.description }}</div>
                <div class="rb-row-tags">
                  <span v-if="h.latest" class="rb-tag rb-tag--version">v{{ h.latest }}</span>
                  <span class="rb-tag rb-tag--type">header-only</span>
                  <span :class="['rb-tag', h.license === 'Apache-2.0' ? 'rb-tag--apache' : 'rb-tag--mit']">{{ h.license || 'MIT' }}</span>
                </div>
              </div>
              <div class="rb-row-aside">
                <a v-if="h.repo" class="rb-gh-link" :href="h.repo" target="_blank" rel="noreferrer" @click.stop>
                  <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/></svg>
                  GitHub
                </a>
                <svg class="rb-arrow" viewBox="0 0 16 16" fill="none"><path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
              </div>
            </button>
          </li>
        </ul>

        <div v-if="totalPages > 1 && !loading" class="rb-pager">
          <button type="button" class="rb-pager-nav" :disabled="page <= 1" @click="prevPage">
            <svg viewBox="0 0 16 16" fill="none"><path d="M10 3L5 8l5 5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
            Prev
          </button>
          <div class="rb-pager-pills">
            <button
              v-for="b in pageButtons"
              :key="String(b)"
              type="button"
              class="rb-pager-pill"
              :class="{ active: b === page, ellipsis: b === '…' }"
              :disabled="b === '…'"
              @click="typeof b === 'number' && setPage(b)"
            >{{ b }}</button>
          </div>
          <button type="button" class="rb-pager-nav" :disabled="page >= totalPages" @click="nextPage">
            Next
            <svg viewBox="0 0 16 16" fill="none"><path d="M6 3l5 5-5 5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </button>
        </div>

        <div v-if="!loading && !error && hits.length" class="rb-hint">
          ⌘K to search · Esc to clear · Alt ← → to paginate
        </div>

      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount, nextTick } from "vue";
import { useRoute, useRouter, RouterLink } from "vue-router";
import { loadRegistryIndex } from "@/lib/loadRegistryIndex";
import RegistrySearchWorker from "@/workers/registrySearch.worker.js?worker";

const route  = useRoute();
const router = useRouter();
const worker = new RegistrySearchWorker();

const q        = ref((route.query.q  || "").toString());
const page     = ref(Math.max(1, Number(route.query.page || 1)));
const activeNs = ref((route.query.ns || "").toString() || null);

const hits     = ref([]);
const total    = ref(0);
const totalAll = ref(135);
const loading  = ref(true);
const error    = ref("");
const version  = ref("");

const nsCounts = ref([
  { name: "vix",           count: "…" },
  { name: "gaspardkirira", count: "…" },
  { name: "gk",            count: "…" },
  { name: "softadastra",   count: "…" },
  { name: "cnerium",       count: "…" },
  { name: "rix",           count: "…" },
  { name: "vixcpp",        count: "…" },
]);

const searchEl = ref(null);

const queryTrimmed = computed(() => (q.value || "").trim());
const isEmptyQuery = computed(() => !queryTrimmed.value);
const pageSize     = computed(() => isEmptyQuery.value ? 50 : 30);
const offset       = computed(() => (page.value - 1) * pageSize.value);
const totalPages   = computed(() => Math.max(1, Math.ceil(total.value / pageSize.value)));

const indexLabel = computed(() => {
  if (!version.value) return "";
  const d = new Date(version.value);
  if (isNaN(d.getTime())) return "";
  return `Updated ${d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}`;
});

const pageButtons = computed(() => {
  const cur = page.value, max = totalPages.value;
  const out = []; const W = 2;
  const start = Math.max(1, cur - W); const end = Math.min(max, cur + W);
  out.push(1);
  if (start > 2) out.push("…");
  for (let i = start; i <= end; i++) if (i !== 1 && i !== max) out.push(i);
  if (end < max - 1) out.push("…");
  if (max > 1) out.push(max);
  return out.filter((v, i) => i === 0 || v !== out[i - 1]);
});

function doSearch() {
  worker.postMessage({
    type:      "search",
    query:     queryTrimmed.value,
    limit:     pageSize.value,
    offset:    offset.value,
    namespace: activeNs.value || null,
    sort:      queryTrimmed.value ? "score" : "latest",
  });
}

function pushRoute(nq, np, ns) {
  const q2 = (nq ?? "").trim();
  const p2 = Math.max(1, Number(np || 1));
  const n2 = ns !== undefined ? ns : activeNs.value;
  const query = {};
  if (q2) query.q    = q2;
  if (p2 > 1) query.page = p2;
  if (n2) query.ns   = n2;
  router.push({ path: "/browse", query }).catch(() => {});
}

function goSearch()    { pushRoute(q.value, 1, activeNs.value); }
function clearSearch() { q.value = ""; pushRoute("", 1, activeNs.value); nextTick(() => searchEl.value?.focus()); }
function setNs(ns)     { pushRoute(q.value, 1, ns); }
function openPkg(h)    { router.push({ path: `/pkg/${h.namespace}/${h.name}` }).catch(() => {}); }
function setPage(p)    { pushRoute(q.value, Math.max(1, Math.min(Number(p), totalPages.value)), activeNs.value); }
function nextPage()    { if (page.value < totalPages.value) setPage(page.value + 1); }
function prevPage()    { if (page.value > 1) setPage(page.value - 1); }

function onKeydown(e) {
  if ((e.metaKey || e.ctrlKey) && e.key === "k") { e.preventDefault(); searchEl.value?.focus(); return; }
  if (e.key === "Escape" && document.activeElement === searchEl.value) { e.preventDefault(); clearSearch(); return; }
  if (!loading.value && !error.value) {
    if ((e.altKey || e.metaKey) && e.key === "ArrowRight") { e.preventDefault(); nextPage(); }
    if ((e.altKey || e.metaKey) && e.key === "ArrowLeft")  { e.preventDefault(); prevPage(); }
  }
}

onMounted(async () => {
  document.body.classList.add("is-registry");
  window.addEventListener("keydown", onKeydown);

  worker.onmessage = (ev) => {
    const msg = ev.data || {};
    if (msg.type === "loaded") {
      version.value = msg.version || "";
      loading.value = false;
      worker.postMessage({ type: "getNamespaceCounts" });
      doSearch();
      return;
    }
    if (msg.type === "namespaceCounts" && msg.counts) {
      const order = ["vix","gaspardkirira","gk","softadastra","cnerium","rix","vixcpp"];
      nsCounts.value = order.filter(ns => msg.counts[ns]).map(ns => ({ name: ns, count: msg.counts[ns] }));
      totalAll.value = Object.values(msg.counts).reduce((a, b) => a + b, 0);
      return;
    }
    if (msg.type === "searchResult") {
      hits.value    = msg.hits || [];
      total.value   = Number(msg.total || 0);
      version.value = msg.version || version.value;
      if (page.value > totalPages.value && totalPages.value > 0) setPage(totalPages.value);
      return;
    }
    if (msg.type === "error") { error.value = msg.error || "Worker error"; loading.value = false; }
  };

  try {
    const { data } = await loadRegistryIndex();
    worker.postMessage({ type: "load", data });
  } catch {
    loading.value = false;
    error.value   = "Cannot load registry index.";
  }
});

onBeforeUnmount(() => {
  document.body.classList.remove("is-registry");
  window.removeEventListener("keydown", onKeydown);
  worker.terminate();
});

watch(() => [route.query.q, route.query.page, route.query.ns], ([nq, np, ns]) => {
  q.value        = (nq || "").toString();
  page.value     = Math.max(1, Number(np || 1));
  activeNs.value = (ns || "").toString() || null;
  if (!loading.value && !error.value) doSearch();
});
</script>

<style scoped>
.rb { min-height: 100vh; background: #0e0e10; color: rgba(240,240,242,.92); font-family: system-ui,-apple-system,sans-serif; -webkit-font-smoothing: antialiased; display: flex; flex-direction: column; }

/* TOPBAR */
.rb-topbar { position: sticky; top: 0; z-index: 40; background: rgba(14,14,16,.9); backdrop-filter: blur(14px); border-bottom: 1px solid rgba(255,255,255,.07); }
.rb-topbar-inner { max-width: 1280px; margin: 0 auto; padding: 0 1.5rem; height: 52px; display: grid; grid-template-columns: 180px 1fr auto; gap: 16px; align-items: center; }
.rb-brand { display: inline-flex; align-items: center; gap: 7px; text-decoration: none; }
.rb-brand-mark { width: 22px; height: 22px; }
.rb-brand-name { font-size: .95rem; font-weight: 800; color: #22c55e; letter-spacing: -.3px; }
.rb-brand-dim  { font-size: .88rem; font-weight: 400; color: rgba(255,255,255,.28); }

.rb-search { display: flex; align-items: center; gap: 8px; background: rgba(255,255,255,.055); border: 1px solid rgba(255,255,255,.1); border-radius: 8px; padding: 0 12px; height: 36px; transition: border-color .14s, box-shadow .14s; min-width: 0; }
.rb-search:focus-within { border-color: rgba(34,197,94,.38); box-shadow: 0 0 0 3px rgba(34,197,94,.1); }
.rb-search-icon { width: 14px; height: 14px; color: rgba(240,240,242,.3); flex-shrink: 0; }
.rb-search-in { flex: 1; min-width: 0; background: transparent; border: 0; outline: none; font-size: .875rem; color: #f0f0f2; padding: 0; caret-color: #22c55e; }
.rb-search-in::placeholder { color: rgba(240,240,242,.28); }
.rb-search-in::-webkit-search-cancel-button { display: none; }
.rb-search-clear { display: inline-flex; align-items: center; justify-content: center; width: 18px; height: 18px; border: 0; background: transparent; color: rgba(240,240,242,.38); cursor: pointer; flex-shrink: 0; transition: color .12s; }
.rb-search-clear svg { width: 11px; height: 11px; }
.rb-search-clear:hover { color: rgba(240,240,242,.7); }
.rb-kbd { font-family: ui-monospace,monospace; font-size: .62rem; color: rgba(240,240,242,.2); padding: 1px 5px; border: 1px solid rgba(255,255,255,.08); border-radius: 4px; flex-shrink: 0; }
.rb-publish-btn { display: inline-flex; align-items: center; padding: 6px 14px; border-radius: 7px; font-size: .82rem; font-weight: 600; background: #22c55e; color: #052e16; text-decoration: none; flex-shrink: 0; transition: background .13s, transform .11s; }
.rb-publish-btn:hover { background: #4ade80; transform: translateY(-1px); }

/* LAYOUT */
.rb-layout { max-width: 1280px; margin: 0 auto; padding: 0 1.5rem; width: 100%; display: grid; grid-template-columns: 192px 1fr; gap: 32px; flex: 1; }

/* SIDEBAR */
.rb-sidebar { position: sticky; top: calc(52px + 20px); padding-top: 20px; height: fit-content; }
.rb-sidebar-group { display: flex; flex-direction: column; gap: 1px; }
.rb-sidebar-heading { font-size: .67rem; font-weight: 700; letter-spacing: .08em; text-transform: uppercase; color: rgba(240,240,242,.28); padding: 0 8px; margin-bottom: 5px; }
.rb-ns-btn { display: flex; align-items: center; justify-content: space-between; gap: 6px; padding: 5px 8px; border-radius: 6px; border: 0; background: transparent; cursor: pointer; width: 100%; text-align: left; transition: background .12s; }
.rb-ns-btn:hover:not(.active) { background: rgba(255,255,255,.04); }
.rb-ns-btn.active { background: rgba(34,197,94,.1); }
.rb-ns-label { font-size: .8rem; font-family: "JetBrains Mono",ui-monospace,monospace; color: rgba(240,240,242,.6); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; min-width: 0; }
.rb-ns-btn.active .rb-ns-label { color: #4ade80; }
.rb-ns-count { font-size: .69rem; color: rgba(240,240,242,.3); background: rgba(255,255,255,.04); border: 1px solid rgba(255,255,255,.07); border-radius: 999px; padding: 1px 6px; flex-shrink: 0; font-variant-numeric: tabular-nums; }

/* MAIN */
.rb-main { padding-top: 20px; padding-bottom: 48px; min-width: 0; }
.rb-head { display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-bottom: 12px; }
.rb-head-left { display: flex; align-items: center; gap: 8px; }
.rb-head-title { font-size: .92rem; font-weight: 700; color: #e0e0e2; }
.rb-head-title em { font-style: normal; color: #4ade80; }
.rb-head-count { font-size: .72rem; color: rgba(240,240,242,.35); background: rgba(255,255,255,.05); border: 1px solid rgba(255,255,255,.08); border-radius: 999px; padding: 2px 8px; font-variant-numeric: tabular-nums; }
.rb-index-date { font-size: .72rem; color: rgba(240,240,242,.28); }

/* STATES */
.rb-state { display: flex; align-items: center; gap: 10px; padding: 24px 0; font-size: .875rem; color: rgba(240,240,242,.5); }
.rb-state--error { color: rgba(248,113,113,.85); }
.rb-state--error svg { width: 18px; height: 18px; flex-shrink: 0; }
.rb-spinner { width: 14px; height: 14px; border-radius: 50%; border: 2px solid rgba(255,255,255,.12); border-top-color: #22c55e; animation: rbs .75s linear infinite; flex-shrink: 0; }
@keyframes rbs { to { transform: rotate(360deg); } }
.rb-empty { padding: 28px 0 16px; }
.rb-empty-title { font-size: .92rem; font-weight: 700; color: rgba(240,240,242,.65); margin-bottom: 6px; }
.rb-empty-desc { font-size: .82rem; color: rgba(240,240,242,.38); line-height: 1.6; }
.rb-empty-reset { background: transparent; border: 0; color: #22c55e; cursor: pointer; font-size: inherit; padding: 0; text-decoration: underline; text-underline-offset: 2px; }

/* LIST */
.rb-list { list-style: none; margin: 0; padding: 0; border: 1px solid rgba(255,255,255,.08); border-radius: 10px; overflow: hidden; }
.rb-row { border-top: 1px solid rgba(255,255,255,.06); }
.rb-row:first-child { border-top: none; }
.rb-row-btn { width: 100%; display: flex; align-items: center; justify-content: space-between; gap: 16px; padding: 12px 16px; background: rgba(255,255,255,.015); border: 0; cursor: pointer; text-align: left; transition: background .11s; }
.rb-row-btn:hover { background: rgba(255,255,255,.042); }
.rb-row-btn:focus-visible { outline: 2px solid rgba(34,197,94,.35); outline-offset: -2px; }
.rb-row-main { min-width: 0; flex: 1; }
.rb-row-id { display: inline-flex; align-items: baseline; font-size: .9rem; font-family: "JetBrains Mono",ui-monospace,monospace; font-weight: 600; color: rgba(147,204,255,.9); margin-bottom: 4px; }
.rb-row-btn:hover .rb-row-id { color: rgba(167,218,255,1); }
.rb-row-ns { color: inherit; }
.rb-row-slash { color: rgba(255,255,255,.28); }
.rb-row-name { color: inherit; font-weight: 700; }
.rb-row-desc { font-size: .8rem; color: rgba(240,240,242,.48); line-height: 1.55; margin-bottom: 7px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 68ch; }
.rb-row-tags { display: flex; gap: 5px; flex-wrap: wrap; }
.rb-tag { font-size: .67rem; font-weight: 600; padding: 2px 7px; border-radius: 999px; }
.rb-tag--version { font-family: "JetBrains Mono",ui-monospace,monospace; background: rgba(255,255,255,.04); border: 1px solid rgba(255,255,255,.09); color: rgba(240,240,242,.55); }
.rb-tag--type { background: rgba(56,189,248,.07); border: 1px solid rgba(56,189,248,.16); color: #7dd3fc; }
.rb-tag--mit { background: rgba(34,197,94,.07); border: 1px solid rgba(34,197,94,.14); color: #4ade80; }
.rb-tag--apache { background: rgba(251,146,60,.07); border: 1px solid rgba(251,146,60,.14); color: #fb923c; }
.rb-row-aside { display: flex; align-items: center; gap: 10px; flex-shrink: 0; }
.rb-gh-link { display: inline-flex; align-items: center; gap: 4px; font-size: .72rem; color: rgba(240,240,242,.35); text-decoration: none; padding: 4px 8px; border-radius: 6px; border: 1px solid rgba(255,255,255,.07); transition: color .12s, background .12s; }
.rb-gh-link svg { width: 11px; height: 11px; }
.rb-gh-link:hover { color: rgba(240,240,242,.75); background: rgba(255,255,255,.05); }
.rb-arrow { width: 15px; height: 15px; color: rgba(240,240,242,.18); transition: color .12s, transform .12s; }
.rb-row-btn:hover .rb-arrow { color: rgba(240,240,242,.45); transform: translateX(2px); }

/* PAGINATION */
.rb-pager { display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-top: 16px; padding: 10px 0; }
.rb-pager-nav { display: inline-flex; align-items: center; gap: 5px; padding: 6px 14px; border-radius: 7px; border: 1px solid rgba(255,255,255,.1); background: rgba(255,255,255,.04); color: rgba(240,240,242,.7); font-size: .8rem; font-weight: 500; cursor: pointer; transition: background .12s, color .12s; }
.rb-pager-nav svg { width: 13px; height: 13px; }
.rb-pager-nav:hover:not(:disabled) { background: rgba(255,255,255,.08); color: #f0f0f2; }
.rb-pager-nav:disabled { opacity: .3; cursor: not-allowed; }
.rb-pager-pills { display: flex; gap: 3px; align-items: center; }
.rb-pager-pill { display: inline-flex; align-items: center; justify-content: center; min-width: 30px; height: 30px; padding: 0 6px; border-radius: 6px; border: 1px solid rgba(255,255,255,.07); background: transparent; color: rgba(240,240,242,.55); font-size: .78rem; font-weight: 600; cursor: pointer; transition: background .11s, border-color .11s, color .11s; }
.rb-pager-pill:hover:not(:disabled):not(.ellipsis) { background: rgba(255,255,255,.06); }
.rb-pager-pill.active { background: rgba(34,197,94,.13); border-color: rgba(34,197,94,.26); color: #4ade80; }
.rb-pager-pill.ellipsis { cursor: default; border-color: transparent; background: transparent; }
.rb-hint { margin-top: 14px; font-size: .72rem; color: rgba(240,240,242,.22); text-align: center; }

/* RESPONSIVE */
@media (max-width: 860px) {
  .rb-layout { grid-template-columns: 1fr; gap: 0; }
  .rb-sidebar { position: static; padding-top: 12px; padding-bottom: 4px; }
  .rb-sidebar-group { flex-direction: row; flex-wrap: wrap; gap: 5px; align-items: center; }
  .rb-sidebar-heading { width: 100%; margin-bottom: 2px; }
  .rb-ns-btn { width: auto; padding: 4px 10px; border: 1px solid rgba(255,255,255,.08); border-radius: 999px; justify-content: center; gap: 5px; }
  .rb-ns-btn.active { border-color: rgba(34,197,94,.25); }
}
@media (max-width: 640px) {
  .rb-topbar-inner { grid-template-columns: auto 1fr; grid-template-rows: auto auto; height: auto; padding: 8px 1rem; gap: 8px; }
  .rb-brand { grid-row: 1; grid-column: 1; }
  .rb-publish-btn { grid-row: 1; grid-column: 2; justify-self: end; }
  .rb-search { grid-row: 2; grid-column: 1 / -1; }
  .rb-kbd { display: none; }
  .rb-layout { padding: 0 1rem; }
  .rb-row-aside { display: none; }
  .rb-row-desc { max-width: none; }
}
</style>
