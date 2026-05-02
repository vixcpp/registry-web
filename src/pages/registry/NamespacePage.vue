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

/* ── Date helpers ── */
function safeParseDate(v) {
  if (!v) return null;
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? null : d;
}

const indexLabel = computed(() => {
  const d = safeParseDate(version.value);
  if (!d) return version.value ? `Index: ${version.value}` : "";
  return `Index: ${d.toLocaleString(undefined, { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}`;
});

/* ── Filtered + sorted packages for this namespace ── */
const filtered = computed(() =>
  (allPackages.value || [])
    .filter(p => (p.namespace || "").toString().toLowerCase() === namespaceLower.value)
    .sort((a, b) => (a.name || "").toString().toLowerCase().localeCompare((b.name || "").toString().toLowerCase()))
);

const total      = computed(() => filtered.value.length);
const totalPages = computed(() => Math.max(1, Math.ceil(total.value / pageSize.value)));
const offset     = computed(() => (page.value - 1) * pageSize.value);
const hits       = computed(() => filtered.value.slice(offset.value, offset.value + pageSize.value));
const showingFrom = computed(() => (total.value ? offset.value + 1 : 0));
const showingTo   = computed(() => Math.min(offset.value + pageSize.value, total.value));

/* ── Labels ── */
const namespaceTitle = computed(() => `@${namespace.value}`);
const subtitleLabel  = computed(() => {
  const parts = [];
  if (indexLabel.value) parts.push(indexLabel.value);
  if (!loading.value && !error.value && total.value)
    parts.push(`${showingFrom.value}–${showingTo.value} of ${total.value}`);
  return parts.join("  ·  ");
});

/* ── Pagination buttons ── */
const pageButtons = computed(() => {
  const cur = page.value, max = totalPages.value;
  const out = [1];
  const lo = Math.max(2, cur - 2), hi = Math.min(max - 1, cur + 2);
  if (lo > 2) out.push("…");
  for (let i = lo; i <= hi; i++) out.push(i);
  if (hi < max - 1) out.push("…");
  if (max > 1) out.push(max);
  return out.filter((v, i) => i === 0 || v !== out[i - 1]);
});

/* ── Keyboard nav ── */
const keyHandler = e => {
  if (loading.value || error.value) return;
  if ((e.altKey || e.metaKey) && e.key === "ArrowRight") { e.preventDefault(); nextPage(); }
  if ((e.altKey || e.metaKey) && e.key === "ArrowLeft")  { e.preventDefault(); prevPage(); }
};

/* ── Navigation ── */
function openPkg(h) {
  if (!h) return;
  router.push({ path: `/pkg/${h.namespace}/${h.name}` }).catch(() => {});
}

function setPage(p) {
  const np = Math.max(1, Math.min(Number(p || 1), totalPages.value));
  router.push({ path: `/ns/${namespace.value}`, query: np > 1 ? { page: np } : {} }).catch(() => {});
}

function nextPage() { if (page.value < totalPages.value) setPage(page.value + 1); }
function prevPage() { if (page.value > 1) setPage(page.value - 1); }

/* ── Data ── */
async function loadData() {
  loading.value = true;
  error.value   = "";
  try {
    const { data } = await loadRegistryIndex();
    version.value     = data?.meta?.generatedAt || "";
    allPackages.value = Array.isArray(data?.entries) ? data.entries : [];
    if (page.value > totalPages.value) page.value = totalPages.value;
  } catch {
    error.value = "cannot_load_registry";
  } finally {
    loading.value = false;
  }
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
  <section class="page">

    <!-- ── Topbar ── -->
    <header class="topbar">
      <div class="topbar-inner">

        <RouterLink class="brand" to="/">
          <span class="brand-dot" aria-hidden="true"></span>
          <span class="brand-text">Vix Registry</span>
        </RouterLink>

        <nav class="crumbs" aria-label="Breadcrumb">
          <RouterLink class="crumb" to="/browse">Browse</RouterLink>
          <span class="crumb-sep">/</span>
          <span class="crumb active">{{ namespaceTitle }}</span>
        </nav>

        <div class="topbar-right">
          <RouterLink class="tbtn ghost" to="/browse">All packages</RouterLink>
          <RouterLink class="tbtn" to="/publish">Publish</RouterLink>
        </div>

      </div>
    </header>

    <!-- ── Content ── -->
    <div class="wrap">

      <!-- Hero -->
      <div class="hero">
        <div class="hero-main">
          <div class="eyebrow">Namespace</div>
          <h1 class="hero-h">{{ namespaceTitle }}</h1>
          <p class="hero-p">All packages published in this namespace.</p>
          <div class="hero-meta" v-if="subtitleLabel">{{ subtitleLabel }}</div>
        </div>

        <div class="hero-stat">
          <div class="stat-l">Packages</div>
          <div class="stat-v">{{ loading ? "—" : total }}</div>
        </div>
      </div>

      <!-- Package list card -->
      <div class="card">

        <!-- Loading -->
        <div v-if="loading" class="state">
          <span class="spinner" aria-hidden="true"></span>
          Loading namespace…
        </div>

        <!-- Error -->
        <div v-else-if="error" class="state error">
          <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true"><circle cx="8" cy="8" r="7" stroke="currentColor" stroke-width="1.4" fill="none"/><path d="M8 5v3.5M8 10.5v.5" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>
          {{ error }}
        </div>

        <!-- Empty -->
        <div v-else-if="total === 0" class="empty">
          <div class="empty-ico" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="20" height="20"><path fill="currentColor" d="M4 7.75A2.75 2.75 0 0 1 6.75 5h10.5A2.75 2.75 0 0 1 20 7.75v8.5A2.75 2.75 0 0 1 17.25 19H6.75A2.75 2.75 0 0 1 4 16.25zM6.75 6.5c-.69 0-1.25.56-1.25 1.25v8.5c0 .69.56 1.25 1.25 1.25h10.5c.69 0 1.25-.56 1.25-1.25v-8.5c0-.69-.56-1.25-1.25-1.25z"/></svg>
          </div>
          <div class="empty-h">No packages in this namespace</div>
          <div class="empty-p">Publish the first package, or check the namespace spelling.</div>
          <RouterLink class="tbtn" to="/publish" style="margin-top:14px">Publish a package</RouterLink>
        </div>

        <!-- List -->
        <template v-else>
          <ul class="list" role="list">
            <li v-for="h in hits" :key="`${h.namespace}/${h.name}`" class="row">
              <button class="row-inner" type="button" @click="openPkg(h)">

                <div class="row-left">
                  <div class="pkg-id">
                    <RouterLink
                      class="pkg-ns"
                      :to="`/ns/${h.namespace}`"
                      @click.stop
                    >@{{ h.namespace }}</RouterLink>
                    <span class="pkg-slash" aria-hidden="true">/</span>
                    <span class="pkg-name">{{ h.name }}</span>
                  </div>
                  <div class="pkg-desc" v-if="h.description">{{ h.description }}</div>
                </div>

                <div class="row-right">
                  <span class="ver-pill" v-if="h.latestVersion || h.latest">
                    v{{ h.latestVersion || h.latest }}
                  </span>
                  <span class="tag-pill" v-if="h.type === 'header-only'">header-only</span>
                  <a
                    v-if="h.repo?.url || h.repo"
                    class="repo-link"
                    :href="h.repo?.url || h.repo"
                    target="_blank"
                    rel="noreferrer"
                    @click.stop
                    aria-label="GitHub"
                  >
                    <svg viewBox="0 0 16 16" width="13" height="13" aria-hidden="true"><path fill="currentColor" d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0 0 16 8c0-4.42-3.58-8-8-8z"/></svg>
                  </a>
                  <svg class="row-arrow" viewBox="0 0 16 16" width="14" height="14" aria-hidden="true"><path d="M6 3l5 5-5 5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/></svg>
                </div>

              </button>
            </li>
          </ul>

          <!-- Pagination -->
          <div class="pager" v-if="total > pageSize">
            <button class="pager-btn" type="button" :disabled="page <= 1" @click="prevPage">
              ← Prev
            </button>

            <div class="pager-mid">
              <button
                v-for="b in pageButtons"
                :key="String(b)"
                class="pager-pill"
                :class="{ active: b === page, ellipsis: b === '…' }"
                type="button"
                :disabled="b === '…'"
                @click="typeof b === 'number' && setPage(b)"
              >{{ b }}</button>
            </div>

            <button class="pager-btn" type="button" :disabled="page >= totalPages" @click="nextPage">
              Next →
            </button>
          </div>

          <!-- Footer tip -->
          <div class="list-foot">
            <span>Alt ← → to navigate pages</span>
            <span v-if="subtitleLabel">{{ subtitleLabel }}</span>
          </div>
        </template>

      </div>
    </div>
  </section>
</template>

<style scoped>
/* ── Tokens ── */
.page {
  --max:      1160px;
  --pad:      20px;

  --bg:       #0d1117;
  --bg-soft:  #161b22;
  --bg-alt:   #1c2128;
  --border:   rgba(255,255,255,.09);
  --divider:  rgba(255,255,255,.06);

  --text:     rgba(255,255,255,.92);
  --muted:    rgba(255,255,255,.60);
  --muted2:   rgba(255,255,255,.40);

  --accent:   #22c55e;
  --accent-s: rgba(34,197,94,.12);
  --accent-b: rgba(34,197,94,.25);

  --blue:     rgba(140,200,255,.92);
  --blue-s:   rgba(140,200,255,.10);
  --blue-b:   rgba(140,200,255,.22);

  min-height: 100vh;
  background: var(--bg);
  color: var(--text);
  font-family: system-ui,-apple-system,sans-serif;
  -webkit-font-smoothing: antialiased;
}

/* ── Topbar ── */
.topbar {
  position: sticky; top: 0; z-index: 40;
  background: rgba(13,17,23,.90);
  backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px);
  border-bottom: 1px solid var(--divider);
}

.topbar-inner {
  max-width: var(--max); margin: 0 auto; padding: 10px var(--pad);
  display: grid; grid-template-columns: auto 1fr auto; gap: 16px; align-items: center;
}

.brand {
  display: inline-flex; align-items: center; gap: 9px;
  text-decoration: none; white-space: nowrap;
}

.brand-dot {
  width: 10px; height: 10px; border-radius: 999px;
  background: var(--accent);
  box-shadow: 0 0 0 3px var(--accent-s);
  flex-shrink: 0;
}

.brand-text { font-size: 14px; font-weight: 700; color: var(--text); }

.crumbs { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; min-width: 0; }

.crumb {
  font-size: 13px; font-weight: 600; color: var(--muted);
  text-decoration: none; transition: color .14s;
}
.crumb:hover { color: var(--text); }
.crumb.active { color: var(--text); font-weight: 700; }
.crumb-sep { color: var(--muted2); font-size: 12px; }

.topbar-right { display: flex; align-items: center; gap: 10px; }

.tbtn {
  display: inline-flex; align-items: center; justify-content: center;
  padding: 7px 12px; border-radius: 10px;
  border: 1px solid var(--border); background: rgba(255,255,255,.04);
  color: rgba(255,255,255,.82); font-size: 12.5px; font-weight: 700;
  text-decoration: none; cursor: pointer; transition: background .14s, border-color .14s;
}
.tbtn:hover { background: rgba(255,255,255,.07); border-color: rgba(255,255,255,.14); }
.tbtn.ghost  { background: transparent; }

/* ── Wrap ── */
.wrap { max-width: var(--max); margin: 0 auto; padding: 22px var(--pad) 48px; }

/* ── Hero ── */
.hero {
  display: grid; grid-template-columns: minmax(0,1fr) 160px;
  gap: 14px; margin-bottom: 14px; align-items: stretch;
}

.hero-main {
  border: 1px solid var(--border); background: rgba(255,255,255,.025);
  border-radius: 16px; padding: 22px 22px 20px;
}

.eyebrow {
  font-size: 11px; font-weight: 800; letter-spacing: .10em;
  text-transform: uppercase; color: var(--accent); margin-bottom: 10px;
}

.hero-h {
  margin: 0; font-size: clamp(26px, 4vw, 38px);
  line-height: 1.05; letter-spacing: -0.03em; font-weight: 900;
}

.hero-p {
  margin: 10px 0 0; font-size: 14px; line-height: 1.65;
  color: var(--muted); max-width: 56ch;
}

.hero-meta {
  margin-top: 14px; font-size: 12.5px; font-weight: 600; color: var(--muted);
}

.hero-stat {
  border: 1px solid var(--border); background: rgba(255,255,255,.025);
  border-radius: 16px; padding: 20px;
  display: flex; flex-direction: column; justify-content: center;
}

.stat-l { font-size: 12px; font-weight: 700; color: var(--muted); }

.stat-v {
  margin-top: 8px; font-size: 42px; line-height: 1;
  letter-spacing: -0.04em; font-weight: 900;
}

/* ── Card ── */
.card {
  border: 1px solid var(--border); background: rgba(255,255,255,.02);
  border-radius: 16px; overflow: hidden;
}

/* States */
.state {
  padding: 18px 16px; display: flex; align-items: center; gap: 10px;
  color: var(--muted); font-size: 13.5px; font-weight: 700;
}
.state.error { color: rgba(255,140,140,.90); }

.spinner {
  width: 14px; height: 14px; border-radius: 50%;
  border: 2px solid rgba(255,255,255,.16); border-top-color: rgba(255,255,255,.72);
  animation: spin .9s linear infinite; flex-shrink: 0;
}
@keyframes spin { to { transform: rotate(360deg); } }

/* Empty */
.empty { padding: 36px 20px; display: flex; flex-direction: column; align-items: center; text-align: center; }

.empty-ico {
  width: 48px; height: 48px; border-radius: 14px;
  display: grid; place-items: center;
  color: var(--accent); background: var(--accent-s); border: 1px solid var(--accent-b);
}

.empty-h { margin-top: 14px; font-size: 15px; font-weight: 800; color: var(--text); }
.empty-p { margin-top: 7px; font-size: 13px; font-weight: 600; color: var(--muted); max-width: 40ch; line-height: 1.55; }

/* List */
.list { list-style: none; margin: 0; padding: 0; }

.row { border-top: 1px solid var(--divider); }
.row:first-child { border-top: 0; }

.row-inner {
  width: 100%; text-align: left; cursor: pointer;
  display: flex; align-items: center; justify-content: space-between; gap: 14px;
  padding: 13px 16px;
  border: 0; background: transparent;
  transition: background .11s;
}
.row-inner:hover { background: rgba(255,255,255,.03); }
.row-inner:focus-visible { outline: 2px solid rgba(34,197,94,.35); outline-offset: -2px; }

.row-left { min-width: 0; }

.pkg-id {
  display: inline-flex; align-items: baseline;
  flex-wrap: wrap; gap: 1px;
  font-size: 14px; line-height: 1.3;
}

.pkg-ns {
  color: var(--blue); font-weight: 700; text-decoration: none;
  font-family: ui-monospace,SFMono-Regular,Menlo,monospace; font-size: 13.5px;
}
.pkg-ns:hover { text-decoration: underline; text-underline-offset: 3px; }

.pkg-slash { color: var(--muted2); padding: 0 2px; font-weight: 600; }

.pkg-name { color: var(--text); font-weight: 800; font-family: ui-monospace,SFMono-Regular,Menlo,monospace; font-size: 13.5px; }
.row-inner:hover .pkg-name { text-decoration: underline; text-underline-offset: 3px; }

.pkg-desc {
  margin-top: 5px; font-size: 12.5px; font-weight: 500;
  color: var(--muted); line-height: 1.5;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 680px;
}

.row-right { flex-shrink: 0; display: flex; align-items: center; gap: 8px; }

.ver-pill {
  font-size: 11.5px; font-weight: 700;
  padding: 4px 9px; border-radius: 999px;
  border: 1px solid var(--border); background: rgba(0,0,0,.20);
  color: rgba(255,255,255,.80);
  font-family: ui-monospace,SFMono-Regular,Menlo,monospace;
}

.tag-pill {
  font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: .04em;
  padding: 4px 8px; border-radius: 999px;
  border: 1px solid var(--accent-b); background: var(--accent-s);
  color: rgba(255,255,255,.80);
  display: none; /* show on wider screens */
}

.repo-link {
  display: grid; place-items: center;
  width: 30px; height: 28px; border-radius: 8px;
  border: 1px solid var(--blue-b); background: var(--blue-s);
  color: var(--blue); text-decoration: none;
  transition: background .12s;
}
.repo-link:hover { background: rgba(140,200,255,.16); }

.row-arrow { color: var(--muted2); flex-shrink: 0; }

/* ── Pager ── */
.pager {
  display: flex; align-items: center; justify-content: space-between; gap: 12px;
  padding: 12px 16px; border-top: 1px solid var(--divider);
  background: rgba(0,0,0,.12);
}

.pager-mid { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; justify-content: center; }

.pager-btn {
  padding: 7px 12px; border-radius: 10px;
  border: 1px solid var(--border); background: rgba(255,255,255,.04);
  color: var(--text); font-size: 12.5px; font-weight: 700; cursor: pointer;
  transition: background .12s;
}
.pager-btn:hover:not(:disabled) { background: rgba(255,255,255,.07); }
.pager-btn:disabled { opacity: .40; cursor: not-allowed; }

.pager-pill {
  min-width: 34px; height: 34px; padding: 0 8px;
  border-radius: 10px; border: 1px solid var(--border); background: rgba(255,255,255,.04);
  color: var(--text); font-size: 13px; font-weight: 700; cursor: pointer;
  display: grid; place-items: center; transition: background .12s;
}
.pager-pill:hover:not(:disabled):not(.ellipsis) { background: rgba(255,255,255,.07); }
.pager-pill.active { background: var(--accent-s); border-color: var(--accent-b); color: var(--accent); }
.pager-pill.ellipsis { opacity: .50; cursor: default; }
.pager-pill:disabled { opacity: .40; cursor: not-allowed; }

/* ── List footer ── */
.list-foot {
  padding: 10px 16px; border-top: 1px solid var(--divider);
  display: flex; justify-content: space-between; gap: 12px; flex-wrap: wrap;
  font-size: 12px; font-weight: 600; color: var(--muted);
}

/* ── Responsive ── */
@media (min-width: 900px) {
  .tag-pill { display: inline-flex; }
}

@media (max-width: 900px) {
  .topbar-inner { grid-template-columns: 1fr; gap: 10px; }
  .topbar-right  { justify-content: flex-start; }
  .hero          { grid-template-columns: 1fr; }
  .hero-stat     { flex-direction: row; align-items: center; justify-content: space-between; min-height: 80px; }
  .stat-v        { font-size: 32px; }
}

@media (max-width: 640px) {
  .wrap        { padding: 14px 14px 32px; }
  .hero-main   { padding: 16px 14px 14px; }
  .hero-h      { font-size: 26px; }
  .hero-stat   { padding: 14px; }
  .row-inner   { padding: 12px 12px; align-items: flex-start; }
  .pkg-desc    { white-space: normal; max-width: 100%; }
  .row-right   { flex-wrap: wrap; justify-content: flex-end; gap: 6px; }
  .pager       { flex-direction: column; align-items: stretch; }
  .pager-mid   { justify-content: flex-start; }
  .list-foot   { flex-direction: column; gap: 4px; }
}
</style>
