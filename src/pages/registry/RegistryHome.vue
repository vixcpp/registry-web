<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import RegistryPackageCard from "@/components/RegistryPackageCard.vue";
import RegistryHeroGraph from "@/components/registry/RegistryHeroGraph.vue";
import { loadRegistryIndex } from "@/lib/loadRegistryIndex";
import { useBodyClass } from "@/lib/useBodyClass";

useBodyClass("is-registry");

const router = useRouter();
const query = ref("");
const searchInput = ref(null);
const loading = ref(true);
const error = ref("");
const packages = ref([]);
const generatedAt = ref("");
const githubByRepo = ref({});

const GH_API_BASE = (import.meta.env.VITE_GITHUB_API_BASE || "https://api.github.com").toString().replace(/\/+$/, "");
const FEATURED_LIMIT = 4;
const LIST_LIMIT = 4;

function parseTime(value) {
  const time = value ? new Date(value).getTime() : 0;
  return Number.isFinite(time) ? time : 0;
}

function latestVersion(entry) {
  if (entry.latestVersion) return entry.latestVersion;
  const versions = Object.keys(entry.versions || {});
  return versions.at(-1) || "";
}

function versionDates(entry) {
  return Object.values(entry.versions || {})
    .map((version) => version?.publishedAt)
    .filter(Boolean);
}

function normalizePackage(entry) {
  const dates = versionDates(entry);
  const activityAt = entry.api?.updatedAt || entry.updatedAt || entry.lastUpdatedAt || dates.at(-1) || "";
  const createdAt = entry.createdAt || dates[0] || activityAt;
  const quality = entry.quality || {};
  const versionsCount = Object.keys(entry.versions || {}).length;
  const qualityScore = Number(Boolean(quality.hasDocs)) + Number(Boolean(quality.hasExamples)) + Number(Boolean(quality.hasTests));

  return {
    ...entry,
    latestVersion: latestVersion(entry),
    versionsCount,
    activityAt,
    createdAt,
    qualityScore,
    repoUrl: typeof entry.repo === "string" ? entry.repo : entry.repo?.url || "",
  };
}

const packageCount = computed(() => packages.value.length);
const namespaceCount = computed(() => new Set(packages.value.map((pkg) => pkg.namespace).filter(Boolean)).size);

const featured = computed(() => [...packages.value]
  .sort((a, b) => b.qualityScore - a.qualityScore || b.versionsCount - a.versionsCount || parseTime(b.activityAt) - parseTime(a.activityAt) || `${a.namespace}/${a.name}`.localeCompare(`${b.namespace}/${b.name}`))
  .slice(0, FEATURED_LIMIT));

const recentlyUpdated = computed(() => [...packages.value]
  .filter((pkg) => pkg.activityAt)
  .sort((a, b) => parseTime(b.activityAt) - parseTime(a.activityAt) || `${a.namespace}/${a.name}`.localeCompare(`${b.namespace}/${b.name}`))
  .slice(0, LIST_LIMIT));

const newPackages = computed(() => [...packages.value]
  .filter((pkg) => pkg.versionsCount <= 2)
  .sort((a, b) => parseTime(b.createdAt) - parseTime(a.createdAt) || a.versionsCount - b.versionsCount || `${a.namespace}/${a.name}`.localeCompare(`${b.namespace}/${b.name}`))
  .slice(0, LIST_LIMIT));

const indexDate = computed(() => {
  if (!generatedAt.value) return "";
  const date = new Date(generatedAt.value);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric", year: "numeric" }).format(date);
});

function submitSearch() {
  const q = query.value.trim();
  router.push(q ? { path: "/browse", query: { q } } : { path: "/browse" });
}

function repositorySlug(url) {
  const match = String(url || "").match(/github\.com\/([^/]+)\/([^/#]+?)(?:\.git)?(?:[?#/]|$)/i);
  return match ? `${match[1]}/${match[2]}` : "";
}

function cachedGithub(slug) {
  try {
    const value = JSON.parse(sessionStorage.getItem(`vix-registry:github:${slug}`) || "null");
    if (value?.storedAt && Date.now() - value.storedAt < 30 * 60 * 1000) return value.data;
  } catch {}
  return null;
}

async function loadGithubMetadata(list) {
  const repos = [...new Set(list.map((pkg) => repositorySlug(pkg.repoUrl)).filter(Boolean))].slice(0, FEATURED_LIMIT);
  await Promise.allSettled(repos.map(async (slug) => {
    const cached = cachedGithub(slug);
    if (cached) {
      githubByRepo.value = { ...githubByRepo.value, [slug]: cached };
      return;
    }
    const response = await fetch(`${GH_API_BASE}/repos/${slug}`, { headers: { Accept: "application/vnd.github+json" } });
    if (!response.ok) return;
    const data = await response.json();
    const metadata = { stargazers_count: data.stargazers_count, pushed_at: data.pushed_at };
    githubByRepo.value = { ...githubByRepo.value, [slug]: metadata };
    try { sessionStorage.setItem(`vix-registry:github:${slug}`, JSON.stringify({ storedAt: Date.now(), data: metadata })); } catch {}
  }));
}

function githubFor(pkg) {
  return githubByRepo.value[repositorySlug(pkg.repoUrl)] || null;
}

async function loadPackages() {
  loading.value = true;
  error.value = "";
  try {
    const { data } = await loadRegistryIndex();
    generatedAt.value = data?.meta?.generatedAt || "";
    packages.value = (Array.isArray(data?.entries) ? data.entries : []).map(normalizePackage);
    void loadGithubMetadata(featured.value);
  } catch {
    error.value = "The registry index could not be loaded. Check your connection and try again.";
  } finally {
    loading.value = false;
  }
}

function onKeydown(event) {
  const target = event.target;
  const isTyping = target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement || target?.isContentEditable;
  if (((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") || (event.key === "/" && !isTyping)) {
    event.preventDefault();
    searchInput.value?.focus();
  }
}

onMounted(() => {
  document.addEventListener("keydown", onKeydown);
  loadPackages();
});
onBeforeUnmount(() => document.removeEventListener("keydown", onKeydown));
</script>

<template>
  <div class="registry-home">
    <div>
      <section class="hero">
        <div class="hero__layout">
          <div class="hero__inner">
            <div class="hero__eyebrow"><span /> Vix Registry</div>
            <h1>The package registry<br />for modern C++.</h1>
            <p class="hero__lead">Discover, publish, version, and install reusable C++ packages with Vix.</p>

            <form class="hero-search" role="search" @submit.prevent="submitSearch">
              <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="11" cy="11" r="6.7" stroke="currentColor" stroke-width="1.7" /><path d="m16 16 4 4" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" /></svg>
              <label class="sr-only" for="registry-home-search">Search packages</label>
              <input id="registry-home-search" ref="searchInput" v-model="query" type="search" placeholder="Search by package, namespace, or capability" autocomplete="off" spellcheck="false" />
              <kbd aria-hidden="true">/</kbd>
              <button type="submit">Search</button>
            </form>

            <div class="hero__actions">
              <RouterLink class="button button--primary" to="/browse">Explore packages <span aria-hidden="true">→</span></RouterLink>
              <RouterLink class="button button--secondary" to="/publish">Publish a package</RouterLink>
            </div>

            <div class="hero__facts" aria-label="Registry summary">
              <span><strong>{{ loading ? "—" : packageCount }}</strong> packages</span>
              <span><strong>{{ loading ? "—" : namespaceCount }}</strong> namespaces</span>
              <span>Open registry index</span>
            </div>
          </div>
          <RegistryHeroGraph class="hero__visual" />
        </div>
      </section>

      <section class="discovery section-band" aria-labelledby="discovery-title">
        <div class="content">
          <div class="section-heading">
            <div>
              <span class="eyebrow">Package discovery</span>
              <h2 id="discovery-title">Build on what already exists.</h2>
              <p>Browse real packages from the public Vix registry index.</p>
            </div>
            <RouterLink class="text-link" to="/browse">Browse all packages <span aria-hidden="true">→</span></RouterLink>
          </div>

          <div v-if="loading" class="data-state" aria-live="polite">
            <span class="spinner" aria-hidden="true" /> Loading registry packages…
          </div>
          <div v-else-if="error" class="data-state data-state--error" role="alert">
            <span>{{ error }}</span>
            <button type="button" @click="loadPackages">Try again</button>
          </div>
          <div v-else-if="packages.length === 0" class="data-state">No packages have been published yet.</div>

          <template v-else>
            <div class="package-group">
              <div class="package-group__heading">
                <div><h3>Featured packages</h3><p>Complete package metadata, documentation, examples, and tests.</p></div>
                <span v-if="indexDate">Index updated {{ indexDate }}</span>
              </div>
              <div class="package-grid">
                <RegistryPackageCard v-for="pkg in featured" :key="`featured-${pkg.namespace}/${pkg.name}`" :pkg="pkg" :github="githubFor(pkg)" />
              </div>
            </div>

            <div class="package-columns">
              <div class="package-group">
                <div class="package-group__heading"><div><h3>Recently updated</h3><p>Latest activity reported by published package metadata.</p></div></div>
                <div class="package-stack">
                  <RegistryPackageCard v-for="pkg in recentlyUpdated" :key="`recent-${pkg.namespace}/${pkg.name}`" :pkg="pkg" :github="githubFor(pkg)" />
                </div>
              </div>
              <div class="package-group">
                <div class="package-group__heading"><div><h3>New packages</h3><p>Fresh entries and first releases ready to explore.</p></div></div>
                <div class="package-stack">
                  <RegistryPackageCard v-for="pkg in newPackages" :key="`new-${pkg.namespace}/${pkg.name}`" :pkg="pkg" :github="githubFor(pkg)" />
                </div>
              </div>
            </div>
          </template>
        </div>
      </section>

      <section class="why section-band" aria-labelledby="why-title">
        <div class="content why__layout">
          <div class="why__intro">
            <span class="eyebrow">Why Vix Registry?</span>
            <h2 id="why-title">A native package workflow for C++.</h2>
            <p>The registry connects searchable metadata, source repositories, immutable release tags, and the Vix CLI.</p>
          </div>
          <div class="benefits">
            <article><span>01</span><div><h3>Package discovery</h3><p>Find reusable C++ libraries and tools from one searchable public index.</p></div></article>
            <article><span>02</span><div><h3>Versioned releases</h3><p>Publish package versions tied to source repositories, commits, and release tags.</p></div></article>
            <article><span>03</span><div><h3>Native Vix workflow</h3><p>Search, add, install, and publish packages directly from the Vix CLI.</p></div></article>
            <article><span>04</span><div><h3>Reproducible dependencies</h3><p>Declare explicit package versions in Vix manifests and preserve resolution in the project lockfile.</p></div></article>
          </div>
        </div>
      </section>

      <section class="workflow section-band" aria-labelledby="workflow-title">
        <div class="content workflow__layout">
          <div class="workflow__copy">
            <span class="eyebrow">Native workflow</span>
            <h2 id="workflow-title">From discovery to build.</h2>
            <p>Use the same CLI to find a package, add it to your manifest, resolve dependencies, and build your project.</p>
            <a class="text-link" href="https://docs.vixcpp.com" target="_blank" rel="noreferrer">Read the Vix documentation <span aria-hidden="true">→</span></a>
          </div>
          <div class="terminal" aria-label="Vix CLI workflow example">
            <div class="terminal__bar"><span /><span /><span /><strong>vix · project</strong></div>
            <pre><code><span class="prompt">$</span> <span class="command">vix search</span> requests
<span class="result">vix/requests</span> <span class="muted">latest: 1.2.1</span>

<span class="prompt">$</span> <span class="command">vix add</span> vix/requests
<span class="success">✓</span> Added vix/requests to vix.json

<span class="prompt">$</span> <span class="command">vix build</span>
<span class="success">✓</span> Build completed</code></pre>
          </div>
        </div>
      </section>

      <section class="publish-band">
        <div class="content publish-band__inner">
          <div><span class="eyebrow">Publish from your terminal</span><h2>Share a reusable C++ package.</h2><p>Validate your manifest, tag a release, and submit it to the registry through the Vix CLI.</p></div>
          <RouterLink class="button button--primary" to="/publish">View publishing workflow <span aria-hidden="true">→</span></RouterLink>
        </div>
      </section>
    </div>

  </div>
</template>

<style scoped>
.registry-home { --bg: #131619; --bg-soft: #1a1e22; --bg-panel: #1a1e22; --bg-panel-strong: #20252a; --bg-sunken: #0f1215; --text: rgba(255,255,255,.92); --text-soft: rgba(255,255,255,.62); --text-muted: rgba(255,255,255,.4); --text-faint: rgba(255,255,255,.28); --line: rgba(255,255,255,.07); --line-soft: rgba(255,255,255,.045); --line-strong: rgba(255,255,255,.1); --green: #22c55e; --green-soft: #4ade80; --green-bright: #86efac; --green-faint: rgba(34,197,94,.1); --green-line: rgba(34,197,94,.35); --danger: #f87171; --radius-sm: 6px; --radius-md: 10px; --radius-lg: 16px; --container: 1120px; --container-wide: 1240px; --font-sans: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; --font-mono: "JetBrains Mono", "SFMono-Regular", Consolas, "Liberation Mono", Menlo, monospace; --shadow-soft: 0 4px 24px rgba(0,0,0,.35); --shadow-panel: 0 8px 40px rgba(0,0,0,.42); --shadow-green: 0 12px 32px rgba(34,197,94,.18); --speed: 160ms; min-height: 100vh; background: var(--bg); color: var(--text); font-family: var(--font-sans); }
.content { width: min(100% - 2rem, var(--container-wide)); margin-inline: auto; }
.sr-only { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0, 0, 0, 0); clip-path: inset(50%); white-space: nowrap; }
.section-band { padding: clamp(72px, 8vw, 108px) 0; border-top: 1px solid var(--line); }
.eyebrow { display: inline-flex; color: var(--green-soft); font-size: .7rem; font-weight: 750; letter-spacing: .14em; text-transform: uppercase; }
.hero { position: relative; min-height: 620px; padding: 0; overflow: hidden; border-bottom: 1px solid var(--line); background: var(--bg); }
.hero::before { content: ""; position: absolute; inset: 0; pointer-events: none; opacity: .22; background-image: linear-gradient(var(--line-soft) 1px, transparent 1px), linear-gradient(90deg, var(--line-soft) 1px, transparent 1px); background-size: 52px 52px; mask-image: linear-gradient(to bottom, black, transparent 88%); }
.hero__layout { position: relative; width: min(100% - 2rem, var(--container-wide)); min-height: 620px; display: grid; grid-template-columns: minmax(0, 1.2fr) minmax(360px, .8fr); align-items: center; gap: clamp(24px, 4vw, 64px); margin-inline: auto; }
.hero__inner { min-width: 0; padding: 64px 0 58px; text-align: left; }
.hero__visual { align-self: center; }
.hero__eyebrow { display: inline-flex; align-items: center; gap: 8px; color: var(--green-soft); font-family: var(--font-mono); font-size: .76rem; font-weight: 650; letter-spacing: .08em; text-transform: uppercase; }
.hero__eyebrow span { width: 7px; height: 7px; border-radius: 50%; background: var(--green); box-shadow: 0 0 0 5px var(--green-faint); }
.hero h1 { max-width: 720px; margin-top: 18px; font-size: clamp(3.1rem, 4.7vw, 4.25rem); line-height: .98; letter-spacing: -.045em; }
.hero__lead { max-width: 640px; margin: 20px 0 0; color: var(--text-soft); font-size: clamp(1rem, 1.6vw, 1.18rem); line-height: 1.65; }
.hero-search { width: 100%; max-width: 760px; min-height: 62px; margin: 30px 0 0; display: grid; grid-template-columns: auto minmax(0,1fr) auto auto; align-items: center; gap: 12px; padding: 7px 7px 7px 18px; border: 1px solid var(--line-strong); border-radius: var(--radius-lg); background: var(--bg-panel); box-shadow: 0 20px 60px rgba(0,0,0,.34), 0 0 0 1px rgba(34,197,94,.03); transition: border-color var(--speed), box-shadow var(--speed); }
.hero-search:focus-within { border-color: var(--green-line); box-shadow: 0 20px 60px rgba(0,0,0,.38), 0 0 0 3px var(--green-faint); }
.hero-search svg { width: 21px; height: 21px; color: var(--text-muted); }
.hero-search input { min-width: 0; border: 0; outline: 0; background: transparent; color: var(--text); font-size: .98rem; }
.hero-search input::placeholder { color: var(--text-muted); }
.hero-search kbd { padding: 3px 8px; border: 1px solid var(--line-strong); border-radius: var(--radius-sm); background: var(--bg-sunken); color: var(--text-muted); font: .72rem var(--font-mono); }
.hero-search button { align-self: stretch; min-width: 88px; border: 0; border-radius: var(--radius-md); background: var(--green); color: #07150c; font-weight: 700; cursor: pointer; }
.hero-search button:hover { background: var(--green-soft); }
.hero__actions { display: flex; justify-content: flex-start; flex-wrap: wrap; gap: 10px; margin-top: 18px; }
.button { min-height: 42px; display: inline-flex; align-items: center; justify-content: center; gap: 9px; padding: 0 17px; border: 1px solid transparent; border-radius: var(--radius-md); font-size: .88rem; font-weight: 650; transition: transform var(--speed), background var(--speed), border-color var(--speed), color var(--speed); }
.button:hover { transform: translateY(-1px); }
.button--primary { background: var(--green); color: #07150c; box-shadow: var(--shadow-green); }
.button--primary:hover { background: var(--green-soft); color: #07150c; }
.button--secondary { border-color: var(--line-strong); background: var(--bg-panel); color: var(--text); }
.button--secondary:hover { border-color: var(--green-line); color: var(--green-soft); }
.hero__facts { margin-top: 30px; display: flex; justify-content: flex-start; flex-wrap: wrap; gap: 10px 28px; color: var(--text-muted); font: .74rem var(--font-mono); }
.hero__facts span + span::before { content: ""; display: inline-block; width: 3px; height: 3px; margin: 0 20px 2px 0; border-radius: 50%; background: var(--green); }
.hero__facts strong { color: var(--text-soft); font-weight: 650; }
.section-heading { display: flex; align-items: end; justify-content: space-between; gap: 32px; margin-bottom: 36px; }
.section-heading h2, .why__intro h2, .workflow__copy h2, .publish-band h2 { margin-top: 12px; font-size: clamp(1.9rem, 3.4vw, 3rem); line-height: 1.06; letter-spacing: -.035em; }
.section-heading p, .why__intro > p, .workflow__copy > p, .publish-band p { margin-top: 13px; color: var(--text-soft); line-height: 1.65; }
.text-link { flex-shrink: 0; color: var(--green-soft); font-size: .86rem; font-weight: 650; }
.text-link:hover { color: var(--green-bright); }
.data-state { min-height: 220px; display: flex; align-items: center; justify-content: center; gap: 11px; border: 1px solid var(--line); border-radius: var(--radius-md); background: var(--bg-soft); color: var(--text-soft); }
.data-state--error { flex-direction: column; color: var(--danger); }
.data-state button { padding: 7px 12px; border: 1px solid var(--line-strong); border-radius: var(--radius-sm); background: var(--bg-panel-strong); color: var(--text); }
.spinner { width: 18px; height: 18px; border: 2px solid var(--line-strong); border-top-color: var(--green); border-radius: 50%; animation: spin .7s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
.package-group + .package-group { margin-top: 54px; }
.package-group__heading { min-height: 44px; display: flex; align-items: start; justify-content: space-between; gap: 24px; margin-bottom: 18px; }
.package-group__heading h3 { font-size: 1.08rem; letter-spacing: 0; }
.package-group__heading p, .package-group__heading > span { margin-top: 5px; color: var(--text-muted); font-size: .78rem; line-height: 1.5; }
.package-grid { display: grid; grid-template-columns: repeat(4, minmax(0,1fr)); gap: 12px; }
.package-columns { display: grid; grid-template-columns: repeat(2, minmax(0,1fr)); gap: clamp(28px, 5vw, 70px); margin-top: 62px; padding-top: 52px; border-top: 1px solid var(--line); }
.package-columns .package-group { margin: 0; }
.package-stack { display: grid; grid-template-columns: repeat(2, minmax(0,1fr)); gap: 12px; }
.why { background: var(--bg-soft); }
.why__layout { display: grid; grid-template-columns: minmax(0,.75fr) minmax(0,1.25fr); gap: clamp(48px, 8vw, 110px); align-items: start; }
.why__intro { position: sticky; top: 94px; }
.why__intro > p { max-width: 46ch; }
.benefits { border-top: 1px solid var(--line); }
.benefits article { display: grid; grid-template-columns: 38px minmax(0,1fr); gap: 18px; padding: 25px 0; border-bottom: 1px solid var(--line); }
.benefits article > span { padding-top: 3px; color: var(--green-soft); font: .7rem var(--font-mono); }
.benefits h3 { font-size: 1rem; letter-spacing: 0; }
.benefits p { margin-top: 8px; color: var(--text-soft); font-size: .88rem; line-height: 1.6; }
.workflow__layout { display: grid; grid-template-columns: minmax(0,.8fr) minmax(460px,1.2fr); gap: clamp(46px, 8vw, 110px); align-items: center; }
.workflow__copy > p { max-width: 48ch; margin-bottom: 22px; }
.terminal { overflow: hidden; border: 1px solid var(--line-strong); border-radius: var(--radius-lg); background: var(--bg-sunken); box-shadow: var(--shadow-panel); }
.terminal__bar { min-height: 42px; display: flex; align-items: center; gap: 7px; padding: 0 14px; border-bottom: 1px solid var(--line); background: var(--bg-panel); }
.terminal__bar > span { width: 8px; height: 8px; border-radius: 50%; background: #f87171; }
.terminal__bar > span:nth-child(2) { background: #fbbf24; }
.terminal__bar > span:nth-child(3) { background: var(--green); }
.terminal__bar strong { margin-left: auto; color: var(--text-muted); font: .67rem var(--font-mono); }
.terminal pre { margin: 0; padding: 24px; border: 0; border-radius: 0; background: transparent; color: var(--text-soft); font: .8rem/1.75 var(--font-mono); white-space: pre-wrap; }
.terminal .prompt, .terminal .success { color: var(--green-soft); }
.terminal .command { color: #7dd3fc; font-weight: 650; }
.terminal .result { color: var(--green-bright); }
.terminal .muted { color: var(--text-muted); }
.publish-band { padding: clamp(64px, 8vw, 96px) 0; border-top: 1px solid var(--green-line); background: var(--bg-panel); }
.publish-band__inner { display: flex; align-items: center; justify-content: space-between; gap: 40px; }
.publish-band p { max-width: 650px; }
.publish-band .button { flex-shrink: 0; }
.registry-footer { border-top: 1px solid var(--line); background: var(--bg-sunken); }
.registry-footer__inner { display: flex; justify-content: space-between; gap: 40px; padding-top: 44px; padding-bottom: 40px; }
.registry-footer strong { font-size: 1rem; }
.registry-footer p { margin-top: 9px; color: var(--text-muted); font-size: .83rem; }
.registry-footer nav { display: flex; flex-wrap: wrap; align-items: start; gap: 18px; color: var(--text-soft); font-size: .82rem; }
.registry-footer__bottom { display: flex; justify-content: space-between; gap: 20px; padding-top: 17px; padding-bottom: 17px; border-top: 1px solid var(--line); color: var(--text-muted); font: .7rem var(--font-mono); }

@media (max-width: 1050px) { .package-grid { grid-template-columns: repeat(2,minmax(0,1fr)); } .package-columns { grid-template-columns: 1fr; } }
@media (max-width: 900px) { .hero { min-height: 0; } .hero__layout { min-height: 0; grid-template-columns: 1fr; gap: 4px; padding: 24px 0 52px; } .hero__visual { order: -1; width: min(100%, 400px); margin-inline: auto; } .hero__inner { width: 100%; padding: 0; text-align: center; } .hero__eyebrow, .hero__actions, .hero__facts { justify-content: center; } .hero h1, .hero__lead, .hero-search { margin-right: auto; margin-left: auto; } }
@media (max-width: 860px) { .why__layout, .workflow__layout { grid-template-columns: 1fr; } .why__intro { position: static; } .workflow__layout { gap: 36px; } .publish-band__inner { align-items: start; flex-direction: column; } }
@media (max-width: 640px) { .content { width: min(100% - 1.25rem, var(--container-wide)); } .hero__layout { width: min(100% - 1.25rem, var(--container-wide)); padding-top: 14px; padding-bottom: 42px; } .hero__visual { width: min(100%, 280px); margin-bottom: -8px; } .hero h1 { font-size: clamp(2.55rem, 13vw, 4rem); } .hero__lead { margin-top: 20px; } .hero-search { grid-template-columns: auto minmax(0,1fr) auto; min-height: 58px; margin-top: 26px; padding-right: 7px; } .hero-search kbd { display: none; } .hero-search button { min-width: 52px; font-size: 0; } .hero-search button::after { content: "→"; font-size: 1rem; } .hero__facts { align-items: center; flex-direction: column; gap: 7px; margin-top: 24px; } .hero__facts span + span::before { display: none; } .section-heading { align-items: start; flex-direction: column; } .package-grid, .package-stack { grid-template-columns: 1fr; } .package-card { min-height: 175px; } .package-group__heading { flex-direction: column; gap: 2px; } .terminal pre { padding: 18px; font-size: .74rem; } .registry-footer__inner, .registry-footer__bottom { flex-direction: column; } }
@media (prefers-reduced-motion: reduce) { .spinner { animation-duration: 1.4s; } }
</style>
