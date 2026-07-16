<script setup>
import { computed, onMounted, ref, watch } from "vue";
import { useRoute } from "vue-router";
import PrivatePackagesNotice from "@/components/PrivatePackagesNotice.vue";
import RegistryCopyBlock from "@/components/RegistryCopyBlock.vue";
import RegistryPackageFiles from "@/components/RegistryPackageFiles.vue";
import RegistryPackageStats from "@/components/RegistryPackageStats.vue";
import RegistryState from "@/components/RegistryState.vue";
import { loadRegistryIndex } from "@/lib/loadRegistryIndex";
import { renderRegistryMarkdown } from "@/lib/renderRegistryMarkdown";

const route = useRoute();
const packageTabs = ["overview", "files", "stats", "versions", "dependencies", "manifest"];
const initialTab = packageTabs.includes(String(route.query.tab || "")) ? String(route.query.tab) : "overview";
const activeTab = ref(initialTab);
const loading = ref(true);
const error = ref("");
const pkg = ref(null);
const allPackageIds = ref(new Set());
const readmeHtml = ref("");
const readmeLoading = ref(false);
const manifest = ref(null);
const sourceNotice = ref("");

const id = computed(() => `${route.params.namespace || ""}/${route.params.name || ""}`);
const latest = computed(() => pkg.value?.latestVersion || pkg.value?.latest || sortedVersions.value[0]?.version || "");
const repository = computed(() => typeof pkg.value?.repo === "string" ? pkg.value.repo : pkg.value?.repo?.url || "");
const defaultBranch = computed(() => pkg.value?.repo?.defaultBranch || "main");
const latestMeta = computed(() => pkg.value?.versions?.[latest.value] || {});
const sourceRef = computed(() => latestMeta.value.tag || latestMeta.value.commit || defaultBranch.value);
const installCommand = computed(() => `vix add ${id.value}`);
const versionCommand = (version) => `vix add ${id.value}@${version}`;

const sortedVersions = computed(() => Object.entries(pkg.value?.versions || {})
  .map(([version, metadata]) => ({ version, ...(metadata || {}) }))
  .sort((a, b) => compareVersions(b.version, a.version)));

const updatedAt = computed(() => formatDate(pkg.value?.updatedAt || pkg.value?.activityAt || pkg.value?.api?.updatedAt));
const maintainers = computed(() => Array.isArray(pkg.value?.maintainers) ? pkg.value.maintainers : []);
const dependencies = computed(() => normalizeDependencies(pkg.value?.dependencies ?? pkg.value?.deps));
const registryMetadata = computed(() => {
  if (!pkg.value) return {};
  const { versions, ...metadata } = pkg.value;
  return { ...metadata, latestVersion: latest.value, versionCount: Object.keys(versions || {}).length };
});
const manifestText = computed(() => JSON.stringify(manifest.value || registryMetadata.value, null, 2));
const overviewItems = computed(() => [
  ["Latest version", latest.value ? `v${latest.value}` : "Not available"],
  ["Package type", pkg.value?.type || "Not specified"],
  ["License", pkg.value?.license || "Not specified"],
  ["C++ standard", pkg.value?.constraints?.minCppStandard || "Not specified"],
  ["Updated", updatedAt.value || "Not available"],
  ["Versions", String(sortedVersions.value.length)],
]);

function compareVersions(a, b) {
  const parts = (value) => String(value).replace(/^v/, "").split(/[.-]/).map((part) => /^\d+$/.test(part) ? Number(part) : part);
  const left = parts(a), right = parts(b);
  for (let index = 0; index < Math.max(left.length, right.length); index += 1) {
    const x = left[index] ?? -1, y = right[index] ?? -1;
    if (x === y) continue;
    if (typeof x === "number" && typeof y === "number") return x - y;
    return String(x).localeCompare(String(y));
  }
  return 0;
}

function formatDate(value) {
  if (!value) return "";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "" : new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(date);
}

function normalizeDependencies(value) {
  if (!value) return [];
  const result = [];
  const add = (name, constraint = "", kind = "registry") => {
    const clean = String(name || "").replace(/^@/, "");
    if (clean) result.push({ name: clean, constraint: String(constraint || ""), kind, available: allPackageIds.value.has(clean) });
  };
  if (Array.isArray(value)) value.forEach((item) => typeof item === "string" ? add(item) : add(item?.package || item?.name, item?.version || item?.constraint, item?.type || "registry"));
  else if (typeof value === "object") {
    if (Array.isArray(value.registry)) value.registry.forEach((item) => typeof item === "string" ? add(item) : add(item?.package || item?.name, item?.version || item?.constraint));
    if (Array.isArray(value.git)) value.git.forEach((item) => add(item?.repository || item?.url || item?.name, item?.ref || item?.tag, "git"));
    if (Array.isArray(value.system)) value.system.forEach((item) => add(typeof item === "string" ? item : item?.name, "", "system"));
    const reserved = new Set(["registry", "git", "system"]);
    Object.entries(value).filter(([key]) => !reserved.has(key)).forEach(([name, constraint]) => add(name, typeof constraint === "string" ? constraint : constraint?.version || constraint?.constraint));
  }
  return result.filter((item, index, items) => items.findIndex((other) => other.name === item.name && other.kind === item.kind) === index);
}

function githubRepo(url) {
  const match = String(url || "").match(/github\.com[/:]([^/]+)\/([^/#]+?)(?:\.git)?(?:$|[/?#])/i);
  return match ? { owner: match[1], repo: match[2].replace(/\.git$/, "") } : null;
}

function rewriteMarkdown(markdown, repo, ref) {
  const root = `https://github.com/${repo.owner}/${repo.repo}/blob/${ref}/`;
  const raw = `https://raw.githubusercontent.com/${repo.owner}/${repo.repo}/${ref}/`;
  return String(markdown)
    .replace(/(!\[[^\]]*\]\()(?!https?:|data:|#)([^)]+)(\))/g, `$1${raw}$2$3`)
    .replace(/(\[[^\]]+\]\()(?!https?:|mailto:|#)([^)]+)(\))/g, `$1${root}$2$3`);
}

function selectTab(tab, focus = false) {
  if (!packageTabs.includes(tab)) return;
  activeTab.value = tab;
  if (focus) window.requestAnimationFrame(() => document.getElementById(`package-tab-${tab}`)?.focus());
}

function onTabKeydown(event) {
  if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
  event.preventDefault();
  const current = packageTabs.indexOf(activeTab.value);
  const next = event.key === "Home" ? 0 : event.key === "End" ? packageTabs.length - 1 : (current + (event.key === "ArrowRight" ? 1 : -1) + packageTabs.length) % packageTabs.length;
  selectTab(packageTabs[next], true);
}

async function fetchSourceContent() {
  readmeHtml.value = "";
  manifest.value = null;
  sourceNotice.value = "";
  const repo = githubRepo(repository.value);
  if (!repo) return;
  readmeLoading.value = true;
  const rawBase = `https://raw.githubusercontent.com/${repo.owner}/${repo.repo}/${sourceRef.value}`;
  try {
    for (const filename of ["README.md", "readme.md", "Readme.md"]) {
      const response = await fetch(`${rawBase}/${filename}`);
      if (!response.ok) continue;
      const markdown = rewriteMarkdown(await response.text(), repo, sourceRef.value);
      readmeHtml.value = await renderRegistryMarkdown(markdown);
      break;
    }
    const response = await fetch(`${rawBase}/${pkg.value?.manifestPath || "vix.json"}`);
    if (response.ok) manifest.value = await response.json();
  } catch {
    sourceNotice.value = "Source documentation is temporarily unavailable. Registry metadata is still shown below.";
  } finally {
    readmeLoading.value = false;
  }
}

async function loadPackage() {
  loading.value = true;
  error.value = "";
  try {
    const { data } = await loadRegistryIndex();
    const entries = Array.isArray(data?.entries) ? data.entries : [];
    allPackageIds.value = new Set(entries.map((entry) => `${entry.namespace}/${entry.name}`));
    pkg.value = entries.find((entry) => `${entry.namespace}/${entry.name}` === id.value) || null;
    if (!pkg.value) error.value = `The public package ${id.value} was not found.`;
    else void fetchSourceContent();
  } catch {
    error.value = "The public registry could not be loaded.";
  } finally {
    loading.value = false;
  }
}

onMounted(loadPackage);
watch(id, loadPackage);
</script>

<template>
  <div class="package-page registry-container">
    <RegistryState v-if="loading" kind="loading" title="Loading package" message="Reading public registry metadata." />
    <RegistryState v-else-if="error" kind="error" title="Package unavailable" :message="error"><RouterLink class="registry-button registry-button--secondary" to="/browse">Browse packages</RouterLink></RegistryState>

    <template v-else-if="pkg">
      <header class="package-hero">
        <div class="package-hero__path"><RouterLink :to="`/ns/${pkg.namespace}`">{{ pkg.namespace }}</RouterLink><span>/</span><strong>{{ pkg.name }}</strong></div>
        <div class="package-hero__title"><h1>{{ pkg.namespace }}/{{ pkg.name }}</h1><span>Public package</span></div>
        <p>{{ pkg.description || "No description has been provided for this package." }}</p>
        <div class="package-hero__meta"><strong v-if="latest">v{{ latest }}</strong><span v-if="pkg.license">{{ pkg.license }}</span><span v-if="pkg.type">{{ pkg.type }}</span><span v-if="updatedAt">Updated {{ updatedAt }}</span></div>
      </header>

      <nav class="package-nav" role="tablist" aria-label="Package sections" @keydown="onTabKeydown">
        <button v-for="tab in packageTabs" :id="`package-tab-${tab}`" :key="tab" type="button" role="tab" :aria-selected="activeTab === tab" :aria-controls="`package-panel-${tab}`" :tabindex="activeTab === tab ? 0 : -1" :class="{ active: activeTab === tab }" @click="selectTab(tab)">{{ tab }}</button>
      </nav>

      <div class="package-layout">
        <div class="package-main">
          <section v-if="activeTab === 'overview'" id="package-panel-overview" class="package-section" role="tabpanel" aria-labelledby="package-tab-overview" tabindex="0">
            <div class="section-heading"><div><span>Source documentation</span><h2>README</h2></div><a v-if="repository" :href="repository" target="_blank" rel="noreferrer">View source</a></div>
            <RegistryState v-if="readmeLoading" kind="loading" title="Loading README" message="Fetching the release documentation." />
            <article v-else-if="readmeHtml" class="markdown-body" v-html="readmeHtml"></article>
            <RegistryState v-else kind="empty" title="No README" message="This package release does not provide source documentation." />
          </section>

          <section v-else-if="activeTab === 'files'" id="package-panel-files" class="package-section" role="tabpanel" aria-labelledby="package-tab-files" tabindex="0">
            <div class="section-heading"><div><span>Published source</span><h2>Files</h2></div><span>{{ sourceRef }}</span></div>
            <RegistryPackageFiles :repository="repository" :source-ref="sourceRef" />
          </section>

          <section v-else-if="activeTab === 'stats'" id="package-panel-stats" class="package-section" role="tabpanel" aria-labelledby="package-tab-stats" tabindex="0">
            <div class="section-heading"><div><span>Public repository data</span><h2>GitHub statistics</h2></div><span>Live source metrics</span></div>
            <RegistryPackageStats :repository="repository" />
          </section>

          <section v-else-if="activeTab === 'versions'" id="package-panel-versions" class="package-section" role="tabpanel" aria-labelledby="package-tab-versions" tabindex="0">
            <div class="section-heading"><div><span>Published releases</span><h2>Versions</h2></div><span>{{ sortedVersions.length }} total</span></div>
            <div v-if="sortedVersions.length" class="version-list">
              <article v-for="version in sortedVersions" :key="version.version" class="version-row">
                <div><div class="version-row__number"><strong>v{{ version.version }}</strong><span v-if="version.version === latest">Latest</span><span v-if="version.version.includes('-')">Prerelease</span></div><small v-if="version.tag">Tag {{ version.tag }}</small><small v-if="version.commit">Commit {{ version.commit.slice(0, 10) }}</small><small v-if="version.publishedAt">{{ formatDate(version.publishedAt) }}</small><small v-if="version.checksum || version.hash">Checksum {{ version.checksum || version.hash }}</small></div>
                <RegistryCopyBlock :value="versionCommand(version.version)" label="Install this version" />
              </article>
            </div>
            <RegistryState v-else kind="empty" title="No published versions" message="This package has no version metadata yet." />
          </section>

          <section v-else-if="activeTab === 'dependencies'" id="package-panel-dependencies" class="package-section" role="tabpanel" aria-labelledby="package-tab-dependencies" tabindex="0">
            <div class="section-heading"><div><span>Package manifest</span><h2>Dependencies</h2></div></div>
            <div v-if="dependencies.length" class="dependency-list"><div v-for="dependency in dependencies" :key="`${dependency.kind}:${dependency.name}`"><RouterLink v-if="dependency.kind === 'registry' && dependency.available" :to="`/pkg/${dependency.name}`">{{ dependency.name }}</RouterLink><strong v-else>{{ dependency.name }}</strong><span>{{ dependency.constraint || dependency.kind }}</span></div></div>
            <p v-else class="empty-line">No dependencies.</p>
          </section>

          <section v-else id="package-panel-manifest" class="package-section" role="tabpanel" aria-labelledby="package-tab-manifest" tabindex="0">
            <div class="section-heading"><div><span>{{ manifest ? "Published source" : "Registry representation" }}</span><h2>{{ manifest ? "vix.json" : "Registry metadata" }}</h2></div></div>
            <p v-if="!manifest" class="section-note">The source manifest is unavailable, so this is a structured view of metadata present in the public registry index.</p>
            <RegistryCopyBlock :value="manifestText" :label="manifest ? 'vix.json' : 'Registry metadata'" language="json" />
          </section>
        </div>

        <aside class="package-sidebar" aria-label="Package installation and links">
          <section><span class="sidebar-label">Install</span><RegistryCopyBlock :value="installCommand" label="Vix CLI" /></section>
          <section id="package-overview" class="sidebar-overview">
            <span class="sidebar-label">Package details</span>
            <h2>Overview</h2>
            <dl><div v-for="([label, value]) in overviewItems" :key="label"><dt>{{ label }}</dt><dd>{{ value }}</dd></div><div><dt>Namespace</dt><dd><RouterLink :to="`/ns/${pkg.namespace}`">{{ pkg.namespace }}</RouterLink></dd></div></dl>
            <div v-if="maintainers.length" class="sidebar-maintainers"><span>Published by</span><strong v-for="maintainer in maintainers" :key="maintainer.github || maintainer.name">{{ maintainer.name || maintainer.github }}</strong></div>
            <p v-if="sourceNotice" class="source-notice">{{ sourceNotice }}</p>
          </section>
          <div class="sidebar-links"><a v-if="repository" :href="repository" target="_blank" rel="noreferrer">Source repository <span aria-hidden="true">↗</span></a><a v-if="pkg.documentation" :href="pkg.documentation" target="_blank" rel="noreferrer">Documentation <span aria-hidden="true">↗</span></a><a v-if="pkg.homepage && pkg.homepage !== repository" :href="pkg.homepage" target="_blank" rel="noreferrer">Homepage <span aria-hidden="true">↗</span></a></div>
        </aside>
      </div>

      <PrivatePackagesNotice compact />
    </template>
  </div>
</template>

<style scoped>
.package-page { padding-top: 44px; padding-bottom: 72px; }
.package-hero { max-width: 920px; padding-bottom: 30px; }
.package-hero__path { display: flex; gap: 5px; margin-bottom: 15px; color: var(--text-muted); font: .74rem var(--font-mono); }
.package-hero__path a { color: var(--green-soft); }
.package-hero__title { display: flex; align-items: center; flex-wrap: wrap; gap: 14px; }
.package-hero h1 { min-width: 0; color: var(--text); font: 700 clamp(1.65rem, 4vw, 2.7rem)/1.1 var(--font-display); letter-spacing: 0; overflow-wrap: anywhere; }
.package-hero__title > span, .version-row__number span { padding: 4px 7px; border: 1px solid var(--green-line); border-radius: var(--radius-sm); color: var(--green-soft); background: var(--green-wash); font: .63rem var(--font-mono); text-transform: uppercase; }
.package-hero > p { max-width: 760px; margin-top: 15px; color: var(--text-soft); font-size: .98rem; line-height: 1.65; }
.package-hero__meta { display: flex; flex-wrap: wrap; gap: 8px 18px; margin-top: 18px; color: var(--text-muted); font: .7rem var(--font-mono); }
.package-hero__meta strong { color: var(--green-bright); }
.package-nav { position: sticky; top: 64px; z-index: 4; display: flex; gap: 22px; overflow-x: auto; margin-bottom: 34px; padding: 13px 0; border-block: 1px solid var(--line); background: color-mix(in srgb, var(--bg) 94%, transparent); backdrop-filter: blur(12px); }
.package-nav button { position: relative; flex: 0 0 auto; padding: 4px 0; border: 0; background: transparent; color: var(--text-muted); font-size: .75rem; text-transform: capitalize; cursor: pointer; }
.package-nav button::after { content: ""; position: absolute; right: 0; bottom: -14px; left: 0; height: 2px; background: transparent; }
.package-nav button:hover, .package-nav button:focus-visible, .package-nav button.active { color: var(--green-soft); }
.package-nav button.active::after { background: var(--green); }
.package-layout { display: grid; grid-template-columns: minmax(0, 1fr) 310px; gap: 48px; align-items: start; }
.package-main { min-width: 0; }
.package-section { min-width: 0; padding: 0 0 52px; outline: 0; }
.section-heading { display: flex; justify-content: space-between; align-items: end; gap: 20px; margin-bottom: 20px; padding-bottom: 12px; border-bottom: 1px solid var(--line); }
.section-heading span, .sidebar-label { color: var(--green-soft); font: .64rem var(--font-mono); text-transform: uppercase; }
.section-heading h2 { margin-top: 4px; color: var(--text); font: 650 1.18rem var(--font-display); }
.section-heading > a, .section-heading > span:last-child { color: var(--text-muted); font: .7rem var(--font-mono); }
.source-notice, .section-note, .empty-line { color: var(--text-muted); font-size: .78rem; line-height: 1.55; }
.source-notice { margin-top: 20px; }
.section-note { margin: -4px 0 14px; }
.version-list, .dependency-list { border: 1px solid var(--line); border-radius: var(--radius-md); overflow: hidden; }
.version-row { display: grid; grid-template-columns: minmax(180px, .7fr) minmax(260px, 1fr); gap: 28px; align-items: center; padding: 16px; border-bottom: 1px solid var(--line); }
.version-row:last-child, .dependency-list > div:last-child { border-bottom: 0; }
.version-row__number { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; }
.version-row__number strong { font: 650 .83rem var(--font-mono); }
.version-row small { display: block; margin-top: 7px; color: var(--text-muted); font: .65rem var(--font-mono); overflow-wrap: anywhere; }
.version-row :deep(.copy-block__bar) { display: none; }
.version-row :deep(pre) { padding: 11px 13px; font-size: .68rem; }
.dependency-list > div { display: flex; justify-content: space-between; gap: 16px; padding: 13px 16px; border-bottom: 1px solid var(--line); font: .75rem var(--font-mono); }
.dependency-list a { color: var(--green-soft); }
.dependency-list span { color: var(--text-muted); overflow-wrap: anywhere; }
.package-sidebar { position: sticky; top: 126px; border: 1px solid var(--line); border-radius: var(--radius-md); background: var(--bg-panel); }
.package-sidebar > section { padding: 18px; border-bottom: 1px solid var(--line); }
.sidebar-label { display: block; margin-bottom: 10px; }
.sidebar-overview { scroll-margin-top: 135px; }
.sidebar-overview h2 { margin-bottom: 11px; color: var(--text); font: 650 1rem var(--font-display); }
.package-sidebar dl { margin-inline: -18px; border-top: 1px solid var(--line); }
.package-sidebar dl > div { display: flex; justify-content: space-between; gap: 14px; padding: 11px 18px; border-bottom: 1px solid var(--line); font-size: .72rem; }
.package-sidebar dt { color: var(--text-muted); }
.package-sidebar dd { color: var(--text); text-align: right; overflow-wrap: anywhere; }
.package-sidebar dd a, .sidebar-links a { color: var(--green-soft); }
.sidebar-maintainers { display: grid; gap: 7px; margin-top: 15px; }
.sidebar-maintainers span { color: var(--text-muted); font: .65rem var(--font-mono); }
.sidebar-maintainers strong { color: var(--text-soft); font-size: .74rem; font-weight: 600; }
.sidebar-links { display: grid; gap: 11px; padding: 17px 18px; font-size: .72rem; }
.markdown-body { min-width: 0; color: var(--text-soft); font-size: .88rem; line-height: 1.72; overflow-wrap: anywhere; }
.markdown-body :deep(h1), .markdown-body :deep(h2), .markdown-body :deep(h3) { margin: 1.8em 0 .65em; color: var(--text); font-family: var(--font-display); letter-spacing: 0; }
.markdown-body :deep(h1) { font-size: 1.65rem; }.markdown-body :deep(h2) { padding-bottom: 8px; border-bottom: 1px solid var(--line); font-size: 1.25rem; }.markdown-body :deep(h3) { font-size: 1rem; }
.markdown-body :deep(p), .markdown-body :deep(ul), .markdown-body :deep(ol), .markdown-body :deep(table), .markdown-body :deep(blockquote), .markdown-body :deep(pre) { margin: 0 0 1.2em; }
.markdown-body :deep(ul), .markdown-body :deep(ol) { padding-left: 24px; }
.markdown-body :deep(a) { color: var(--green-soft); text-decoration: underline; text-underline-offset: 3px; }
.markdown-body :deep(img) { max-width: 100%; height: auto; border-radius: var(--radius-sm); }
.markdown-body :deep(pre) { position: relative; max-width: 100%; margin: 18px 0; padding: 18px; overflow-x: auto; border: 1px solid var(--line-ink); border-radius: var(--radius-md); background: var(--bg-ink) !important; color: var(--text); }
.markdown-body :deep(code) { padding: 2px 5px; border-radius: 3px; background: var(--bg-ink); font: .82em var(--font-mono); }
.markdown-body :deep(pre code) { display: block; min-width: max-content; padding: 0; background: transparent; font: .78rem/1.7 var(--font-mono); }
.markdown-body :deep(.shiki span) { font-style: normal; }
.markdown-body :deep(blockquote) { padding-left: 16px; border-left: 3px solid var(--green-line); color: var(--text-muted); }
.markdown-body :deep(table) { display: block; max-width: 100%; overflow-x: auto; border-collapse: collapse; }
.markdown-body :deep(th), .markdown-body :deep(td) { padding: 8px 10px; border: 1px solid var(--line); text-align: left; }
@media (max-width: 980px) { .package-layout { grid-template-columns: minmax(0, 1fr); gap: 0; } .package-sidebar { position: static; margin-top: 24px; margin-bottom: 42px; } }
@media (max-width: 680px) { .package-page { padding-top: 28px; } .package-nav { top: 58px; gap: 17px; } .version-row { grid-template-columns: 1fr; gap: 13px; } }
@media (max-width: 420px) { .section-heading { align-items: start; flex-direction: column; gap: 7px; } }
</style>
