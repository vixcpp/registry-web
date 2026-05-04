<script setup>
import { ref, computed, onMounted, watch, onBeforeUnmount } from "vue";
import { useRoute, useRouter, RouterLink } from "vue-router";
import { loadRegistryIndex } from "@/lib/loadRegistryIndex";

const route  = useRoute();
const router = useRouter();

const loading     = ref(true);
const error       = ref("");
const version     = ref("");
const allPackages = ref([]);

const namespace      = computed(() => (route.params.namespace || "").toString().trim());
const namespaceLower = computed(() => namespace.value.toLowerCase());

const page     = ref(Math.max(1, Number(route.query.page || 1)));
const pageSize = ref(30);

function safeParseDate(v) {
  if (!v) return null;
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? null : d;
}

const indexLabel = computed(() => {
  const d = safeParseDate(version.value);
  if (!d) return "";
  return `Updated ${d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}`;
});

const filtered = computed(() =>
  (allPackages.value || [])
    .filter(p => (p.namespace || "").toString().toLowerCase() === namespaceLower.value)
    .sort((a, b) => (a.name || "").localeCompare(b.name || ""))
);

const total       = computed(() => filtered.value.length);
const totalPages  = computed(() => Math.max(1, Math.ceil(total.value / pageSize.value)));
const offset      = computed(() => (page.value - 1) * pageSize.value);
const hits        = computed(() => filtered.value.slice(offset.value, offset.value + pageSize.value));
const showingFrom = computed(() => (total.value ? offset.value + 1 : 0));
const showingTo   = computed(() => Math.min(offset.value + pageSize.value, total.value));

const namespaceTitle = computed(() => `@${namespace.value}`);

const pageButtons = computed(() => {
  const cur = page.value, max = totalPages.value, out = [1];
  const lo = Math.max(2, cur - 2), hi = Math.min(max - 1, cur + 2);
  if (lo > 2) out.push("…");
  for (let i = lo; i <= hi; i++) out.push(i);
  if (hi < max - 1) out.push("…");
  if (max > 1) out.push(max);
  return out.filter((v, i) => i === 0 || v !== out[i - 1]);
});

const keyHandler = e => {
  if (loading.value || error.value) return;
  if ((e.altKey || e.metaKey) && e.key === "ArrowRight") { e.preventDefault(); nextPage(); }
  if ((e.altKey || e.metaKey) && e.key === "ArrowLeft")  { e.preventDefault(); prevPage(); }
};

function openPkg(h) {
  router.push({ path: `/pkg/${h.namespace}/${h.name}` }).catch(() => {});
}

function setPage(p) {
  const np = Math.max(1, Math.min(Number(p || 1), totalPages.value));
  router.push({ path: `/ns/${namespace.value}`, query: np > 1 ? { page: np } : {} }).catch(() => {});
}

function nextPage() { if (page.value < totalPages.value) setPage(page.value + 1); }
function prevPage() { if (page.value > 1) setPage(page.value - 1); }

async function loadData() {
  loading.value = true; error.value = "";
  try {
    const { data } = await loadRegistryIndex();
    version.value     = data?.meta?.generatedAt || "";
    allPackages.value = Array.isArray(data?.entries) ? data.entries : [];
    if (page.value > totalPages.value) page.value = totalPages.value;
  } catch { error.value = "cannot_load_registry"; }
  finally   { loading.value = false; }
}

onMounted(async () => {
  window.addEventListener("keydown", keyHandler);
  document.body.classList.add("is-registry");
  await loadData();
});

onBeforeUnmount(() => {
  window.removeEventListener("keydown", keyHandler);
  document.body.classList.remove("is-registry");
});

watch(() => route.query.page, v => { page.value = Math.max(1, Number(v || 1)); });
watch(() => route.params.namespace, async () => {
  page.value = Math.max(1, Number(route.query.page || 1));
  await loadData();
});
watch(totalPages, tp => { if (page.value > tp) setPage(tp); });
</script>

<template>
  <div class="ns">

    <!-- ══ TOPBAR — identique à RegistryBrowse ══ -->
    <header class="ns-topbar">
      <div class="ns-topbar-inner">

        <RouterLink class="ns-brand" to="/" aria-label="Registry home">
          <svg class="ns-brand-mark" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="nsl" x1="5" y1="6" x2="18" y2="30" gradientUnits="userSpaceOnUse">
                <stop offset="0%"   stop-color="#d4fcd4"/>
                <stop offset="55%"  stop-color="#4ade80"/>
                <stop offset="100%" stop-color="#22c55e"/>
              </linearGradient>
              <linearGradient id="nsr" x1="31" y1="6" x2="18" y2="30" gradientUnits="userSpaceOnUse">
                <stop offset="0%"   stop-color="#22c55e"/>
                <stop offset="100%" stop-color="#15803d"/>
              </linearGradient>
            </defs>
            <polygon points="5,6 12,6 18,28 14,28"  fill="url(#nsl)"/>
            <polygon points="31,6 24,6 18,28 22,28" fill="url(#nsr)"/>
            <line x1="9" y1="16" x2="13.5" y2="29" stroke="#bbf7d0" stroke-width="1.1" stroke-linecap="round" opacity="0.7"/>
          </svg>
          <span class="ns-brand-name">Vix</span><span class="ns-brand-dim"> Registry</span>
        </RouterLink>

        <!-- breadcrumb centre -->
        <nav class="ns-crumbs" aria-label="Breadcrumb">
          <RouterLink class="ns-crumb" to="/browse">Browse</RouterLink>
          <span class="ns-crumb-sep">/</span>
          <span class="ns-crumb ns-crumb--active">{{ namespaceTitle }}</span>
        </nav>

        <!-- publish btn — identique RegistryBrowse -->
        <RouterLink class="ns-publish-btn" to="/publish">Publish</RouterLink>

      </div>
    </header>

    <!-- ══ BODY ══ -->
    <div class="ns-wrap">

      <!-- Hero -->
      <div class="ns-hero">
        <div class="ns-hero-main">
          <div class="ns-eyebrow">Namespace</div>
          <h1 class="ns-hero-h">{{ namespaceTitle }}</h1>
          <p class="ns-hero-p">All packages published under this namespace.</p>
          <div class="ns-hero-meta" v-if="!loading && !error">
            <span v-if="indexLabel">{{ indexLabel }}</span>
            <span v-if="total"> · Showing {{ showingFrom }}–{{ showingTo }} of {{ total }}</span>
          </div>
        </div>

        <div class="ns-stat">
          <div class="ns-stat-l">Packages</div>
          <div class="ns-stat-v">{{ loading ? "—" : total }}</div>
        </div>
      </div>

      <!-- Package list -->
      <div class="ns-card">

        <div v-if="loading" class="ns-state">
          <span class="ns-spinner" aria-hidden="true"></span>
          Loading namespace…
        </div>

        <div v-else-if="error" class="ns-state ns-state--err">
          <svg viewBox="0 0 20 20" fill="none" width="18" height="18">
            <circle cx="10" cy="10" r="8" stroke="currentColor" stroke-width="1.5"/>
            <path d="M10 6v4M10 13h.01" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
          </svg>
          {{ error }}
        </div>

        <div v-else-if="total === 0" class="ns-empty">
          <div class="ns-empty-title">No packages in this namespace</div>
          <div class="ns-empty-desc">
            Publish the first one or
            <RouterLink class="ns-empty-link" to="/browse">browse all packages</RouterLink>.
          </div>
        </div>

        <template v-else>
          <ul class="ns-list" role="list">
            <li v-for="h in hits" :key="`${h.namespace}/${h.name}`" class="ns-row">
              <button class="ns-row-btn" type="button" @click="openPkg(h)">

                <div class="ns-row-main">
                  <div class="ns-row-id">
                    <RouterLink class="ns-row-ns" :to="`/ns/${h.namespace}`" @click.stop>@{{ h.namespace }}</RouterLink>
                    <span class="ns-row-slash">/</span>
                    <span class="ns-row-name">{{ h.name }}</span>
                  </div>
                  <div v-if="h.description && h.description !== 'A tiny header-only C++ library.'" class="ns-row-desc">{{ h.description }}</div>
                  <div class="ns-row-tags">
                    <span class="ns-tag ns-tag--ver" v-if="h.latestVersion || h.latest">v{{ h.latestVersion || h.latest }}</span>
                    <span class="ns-tag ns-tag--type">header-only</span>
                    <span :class="['ns-tag', (h.license||'MIT') === 'Apache-2.0' ? 'ns-tag--apache' : 'ns-tag--mit']">{{ h.license || "MIT" }}</span>
                  </div>
                </div>

                <div class="ns-row-aside">
                  <a
                    v-if="h.repo?.url || h.repo"
                    class="ns-gh"
                    :href="h.repo?.url || h.repo"
                    target="_blank"
                    rel="noreferrer"
                    @click.stop
                  >
                    <svg viewBox="0 0 16 16" width="11" height="11" fill="currentColor"><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0 0 16 8c0-4.42-3.58-8-8-8z"/></svg>
                    GitHub
                  </a>
                  <svg class="ns-arrow" viewBox="0 0 16 16" fill="none">
                    <path d="M6 3l5 5-5 5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </div>

              </button>
            </li>
          </ul>

          <!-- Pagination -->
          <div class="ns-pager" v-if="total > pageSize">
            <button class="ns-pager-nav" type="button" :disabled="page <= 1" @click="prevPage">
              <svg viewBox="0 0 16 16" fill="none" width="13" height="13"><path d="M10 13L5 8l5-5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
              Prev
            </button>

            <div class="ns-pager-pills">
              <button
                v-for="b in pageButtons"
                :key="String(b)"
                class="ns-pager-pill"
                :class="{ active: b === page, ellipsis: b === '…' }"
                type="button"
                :disabled="b === '…'"
                @click="typeof b === 'number' && setPage(b)"
              >{{ b }}</button>
            </div>

            <button class="ns-pager-nav" type="button" :disabled="page >= totalPages" @click="nextPage">
              Next
              <svg viewBox="0 0 16 16" fill="none" width="13" height="13"><path d="M6 3l5 5-5 5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
            </button>
          </div>

          <div class="ns-hint">⌘K to search · Alt ← → to paginate</div>
        </template>

      </div>
    </div>
  </div>
</template>

<style scoped>
/* ── Base — même fond que RegistryBrowse ── */
.ns {
  min-height: 100vh;
  background: #0e0e10;
  color: rgba(240,240,242,.92);
  font-family: system-ui,-apple-system,sans-serif;
  -webkit-font-smoothing: antialiased;
  display: flex;
  flex-direction: column;
}

/* ══ TOPBAR — copie exacte RegistryBrowse ══ */
.ns-topbar {
  position: sticky; top: 0; z-index: 40;
  background: rgba(14,14,16,.9);
  backdrop-filter: blur(14px);
  border-bottom: 1px solid rgba(255,255,255,.07);
}

.ns-topbar-inner {
  max-width: 1280px; margin: 0 auto; padding: 0 1.5rem;
  height: 52px;
  display: grid; grid-template-columns: 180px 1fr auto;
  gap: 16px; align-items: center;
}

.ns-brand { display: inline-flex; align-items: center; gap: 7px; text-decoration: none; }
.ns-brand-mark { width: 22px; height: 22px; }
.ns-brand-name { font-size: .95rem; font-weight: 800; color: #22c55e; letter-spacing: -.3px; }
.ns-brand-dim  { font-size: .88rem; font-weight: 400; color: rgba(255,255,255,.28); }

/* breadcrumb */
.ns-crumbs { display: flex; align-items: center; gap: 8px; min-width: 0; flex-wrap: wrap; }

.ns-crumb {
  font-size: .82rem; font-weight: 600;
  color: rgba(240,240,242,.42); text-decoration: none;
  transition: color .13s;
}
.ns-crumb:hover { color: rgba(240,240,242,.85); }
.ns-crumb--active { color: rgba(240,240,242,.80); font-weight: 700; cursor: default; }
.ns-crumb-sep { color: rgba(240,240,242,.22); font-size: .75rem; }

/* publish btn — identique RegistryBrowse */
.ns-publish-btn {
  display: inline-flex; align-items: center;
  padding: 6px 14px; border-radius: 7px;
  font-size: .82rem; font-weight: 600;
  background: #22c55e; color: #052e16;
  text-decoration: none; flex-shrink: 0;
  transition: background .13s, transform .11s;
}
.ns-publish-btn:hover { background: #4ade80; color: #0e0e10; transform: translateY(-1px); }

/* ── Body ── */
.ns-wrap {
  max-width: 1280px; margin: 0 auto;
  padding: 24px 1.5rem 48px; flex: 1;
}

/* Hero */
.ns-hero {
  display: grid; grid-template-columns: minmax(0,1fr) 160px;
  gap: 14px; margin-bottom: 16px; align-items: stretch;
}

.ns-hero-main {
  border: 1px solid rgba(255,255,255,.08);
  background: rgba(255,255,255,.025);
  border-radius: 12px; padding: 20px 22px;
}

.ns-eyebrow {
  font-size: .68rem; font-weight: 700;
  letter-spacing: .10em; text-transform: uppercase;
  color: #4ade80; margin-bottom: 8px;
}

.ns-hero-h {
  margin: 0;
  font-size: clamp(24px, 3.5vw, 36px);
  line-height: 1.05; letter-spacing: -0.03em; font-weight: 900;
  color: rgba(240,240,242,.96);
  font-family: "JetBrains Mono",ui-monospace,monospace;
}

.ns-hero-p {
  margin: 8px 0 0; font-size: .875rem; line-height: 1.65;
  color: rgba(240,240,242,.48);
}

.ns-hero-meta {
  margin-top: 12px; font-size: .72rem;
  font-weight: 600; color: rgba(240,240,242,.28);
}

.ns-stat {
  border: 1px solid rgba(255,255,255,.08);
  background: rgba(255,255,255,.025);
  border-radius: 12px; padding: 18px 20px;
  display: flex; flex-direction: column; justify-content: center;
}

.ns-stat-l { font-size: .72rem; font-weight: 700; color: rgba(240,240,242,.35); }
.ns-stat-v {
  margin-top: 6px; font-size: 40px; line-height: 1;
  letter-spacing: -0.04em; font-weight: 900; color: rgba(240,240,242,.92);
}

/* Card — même style que rb-list */
.ns-card {
  border: 1px solid rgba(255,255,255,.08);
  border-radius: 10px; overflow: hidden;
  background: rgba(255,255,255,.015);
}

.ns-state {
  display: flex; align-items: center; gap: 10px;
  padding: 24px 16px; font-size: .875rem;
  color: rgba(240,240,242,.5);
}
.ns-state--err { color: rgba(248,113,113,.85); }

.ns-spinner {
  width: 14px; height: 14px; border-radius: 50%;
  border: 2px solid rgba(255,255,255,.12); border-top-color: #22c55e;
  animation: nsspin .75s linear infinite; flex-shrink: 0;
}
@keyframes nsspin { to { transform: rotate(360deg); } }

.ns-empty { padding: 28px 16px 20px; }
.ns-empty-title { font-size: .92rem; font-weight: 700; color: rgba(240,240,242,.65); margin-bottom: 6px; }
.ns-empty-desc  { font-size: .82rem; color: rgba(240,240,242,.38); line-height: 1.6; }
.ns-empty-link  { color: #22c55e; text-decoration: none; }
.ns-empty-link:hover { text-decoration: underline; text-underline-offset: 2px; }

/* List — identique rb-list */
.ns-list { list-style: none; margin: 0; padding: 0; }
.ns-row  { border-top: 1px solid rgba(255,255,255,.06); }
.ns-row:first-child { border-top: 0; }

.ns-row-btn {
  width: 100%; display: flex; align-items: center;
  justify-content: space-between; gap: 16px;
  padding: 12px 16px; background: rgba(255,255,255,.015);
  border: 0; cursor: pointer; text-align: left;
  transition: background .11s;
}
.ns-row-btn:hover { background: rgba(255,255,255,.042); }
.ns-row-btn:focus-visible { outline: 2px solid rgba(34,197,94,.35); outline-offset: -2px; }

.ns-row-main { min-width: 0; flex: 1; }

.ns-row-id {
  display: inline-flex; align-items: baseline;
  font-size: .9rem; font-family: "JetBrains Mono",ui-monospace,monospace;
  font-weight: 600; color: rgba(147,204,255,.9); margin-bottom: 4px;
}
.ns-row-btn:hover .ns-row-id { color: rgba(167,218,255,1); }

.ns-row-ns    { color: inherit; text-decoration: none; }
.ns-row-ns:hover { text-decoration: underline; text-underline-offset: 3px; }
.ns-row-slash { color: rgba(255,255,255,.28); }
.ns-row-name  { color: inherit; font-weight: 700; }

.ns-row-desc {
  font-size: .8rem; color: rgba(240,240,242,.48);
  line-height: 1.55; margin-bottom: 7px;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 68ch;
}

.ns-row-tags { display: flex; gap: 5px; flex-wrap: wrap; }

.ns-tag {
  font-size: .67rem; font-weight: 600;
  padding: 2px 7px; border-radius: 999px;
}
.ns-tag--ver    { font-family: "JetBrains Mono",ui-monospace,monospace; background: rgba(255,255,255,.04); border: 1px solid rgba(255,255,255,.09); color: rgba(240,240,242,.55); }
.ns-tag--type   { background: rgba(56,189,248,.07); border: 1px solid rgba(56,189,248,.16); color: #7dd3fc; }
.ns-tag--mit    { background: rgba(34,197,94,.07);  border: 1px solid rgba(34,197,94,.14);  color: #4ade80; }
.ns-tag--apache { background: rgba(251,146,60,.07); border: 1px solid rgba(251,146,60,.14); color: #fb923c; }

.ns-row-aside {
  display: flex; align-items: center; gap: 10px; flex-shrink: 0;
}

.ns-gh {
  display: inline-flex; align-items: center; gap: 4px;
  font-size: .72rem; color: rgba(240,240,242,.35);
  text-decoration: none; padding: 4px 8px;
  border-radius: 6px; border: 1px solid rgba(255,255,255,.07);
  transition: color .12s, background .12s;
}
.ns-gh:hover { color: rgba(240,240,242,.75); background: rgba(255,255,255,.05); }

.ns-arrow {
  width: 15px; height: 15px; color: rgba(240,240,242,.18);
  transition: color .12s, transform .12s;
}
.ns-row-btn:hover .ns-arrow { color: rgba(240,240,242,.45); transform: translateX(2px); }

/* Pagination — identique rb-pager */
.ns-pager {
  display: flex; align-items: center; justify-content: space-between;
  gap: 12px; margin-top: 16px; padding: 10px 0;
}

.ns-pager-nav {
  display: inline-flex; align-items: center; gap: 5px;
  padding: 6px 14px; border-radius: 7px;
  border: 1px solid rgba(255,255,255,.1); background: rgba(255,255,255,.04);
  color: rgba(240,240,242,.7); font-size: .8rem; font-weight: 500; cursor: pointer;
  transition: background .12s, color .12s;
}
.ns-pager-nav:hover:not(:disabled) { background: rgba(255,255,255,.08); color: #f0f0f2; }
.ns-pager-nav:disabled { opacity: .3; cursor: not-allowed; }

.ns-pager-pills { display: flex; gap: 3px; align-items: center; }

.ns-pager-pill {
  display: inline-flex; align-items: center; justify-content: center;
  min-width: 30px; height: 30px; padding: 0 6px;
  border-radius: 6px; border: 1px solid rgba(255,255,255,.07);
  background: transparent; color: rgba(240,240,242,.55);
  font-size: .78rem; font-weight: 600; cursor: pointer;
  transition: background .11s, border-color .11s, color .11s;
}
.ns-pager-pill:hover:not(:disabled):not(.ellipsis) { background: rgba(255,255,255,.06); }
.ns-pager-pill.active   { background: rgba(34,197,94,.13); border-color: rgba(34,197,94,.26); color: #4ade80; }
.ns-pager-pill.ellipsis { cursor: default; border-color: transparent; background: transparent; }
.ns-pager-pill:disabled { opacity: .4; cursor: not-allowed; }

.ns-hint {
  margin-top: 14px; font-size: .72rem;
  color: rgba(240,240,242,.22); text-align: center;
}

/* ── Responsive ── */
@media (max-width: 860px) {
  .ns-hero { grid-template-columns: 1fr; }
  .ns-stat { flex-direction: row; align-items: center; justify-content: space-between; min-height: 80px; }
  .ns-stat-v { font-size: 32px; margin-top: 0; }
  .ns-pager { flex-wrap: wrap; }
}

@media (max-width: 640px) {
  .ns-topbar-inner { grid-template-columns: auto 1fr; grid-template-rows: auto; height: auto; padding: 8px 1rem; gap: 8px; }
  .ns-crumbs { grid-column: 1 / -1; order: 2; }
  .ns-publish-btn { justify-self: end; }
  .ns-wrap { padding: 14px 1rem 32px; }
  .ns-hero-main { padding: 16px; }
  .ns-hero-h { font-size: 22px; }
  .ns-row-desc { white-space: normal; max-width: 100%; }
  .ns-row-aside { display: none; }
  .ns-pager { flex-direction: column; align-items: stretch; gap: 8px; }
  .ns-pager-pills { flex-wrap: wrap; justify-content: flex-start; }
}
</style>
