<script setup>
import { computed, onMounted, ref, watch } from "vue";
import RegistryState from "@/components/RegistryState.vue";
import { highlightRegistryCode, normalizeCodeLanguage, renderRegistryMarkdown } from "@/lib/renderRegistryMarkdown";

const props = defineProps({
  repository: { type: String, default: "" },
  sourceRef: { type: String, default: "main" },
});

const GH_API_BASE = (import.meta.env.VITE_GITHUB_API_BASE || "https://api.github.com").toString().replace(/\/+$/, "");
const loading = ref(false);
const error = ref("");
const entries = ref([]);
const currentPath = ref("");
const filter = ref("");
const preview = ref(null);
const previewLoading = ref(false);
const previewError = ref("");
const previewHtml = ref("");
const copied = ref(false);
let requestSequence = 0;

const repo = computed(() => {
  const match = props.repository.match(/github\.com[/:]([^/]+)\/([^/#]+?)(?:\.git)?(?:$|[/?#])/i);
  return match ? { owner: match[1], name: match[2].replace(/\.git$/, "") } : null;
});
const breadcrumbs = computed(() => {
  const parts = currentPath.value.split("/").filter(Boolean);
  return parts.map((_, index) => ({ label: parts[index], path: parts.slice(0, index + 1).join("/") }));
});
const visibleEntries = computed(() => {
  const query = filter.value.trim().toLowerCase();
  return entries.value
    .filter((entry) => !query || entry.name.toLowerCase().includes(query))
    .sort((left, right) => Number(right.type === "dir") - Number(left.type === "dir") || left.name.localeCompare(right.name));
});
const repositoryUrl = computed(() => {
  if (!repo.value) return props.repository;
  const path = currentPath.value ? `/tree/${props.sourceRef}/${currentPath.value}` : `/tree/${props.sourceRef}`;
  return `https://github.com/${repo.value.owner}/${repo.value.name}${path}`;
});

function apiHeaders() {
  const headers = { Accept: "application/vnd.github+json" };
  const token = import.meta.env.DEV ? String(import.meta.env.VITE_GITHUB_TOKEN || "").trim() : "";
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
}

function readableError(response) {
  if (response.status === 403) return "GitHub API rate limit reached. Try again later.";
  if (response.status === 404) return `Files are unavailable for ${props.sourceRef}.`;
  return `GitHub returned ${response.status} while loading package files.`;
}

async function loadDirectory(path = "") {
  if (!repo.value) {
    error.value = "Files are available when the package source is hosted on GitHub.";
    return;
  }
  const sequence = ++requestSequence;
  loading.value = true;
  error.value = "";
  preview.value = null;
  previewHtml.value = "";
  const encodedPath = path.split("/").filter(Boolean).map(encodeURIComponent).join("/");
  const endpoint = `${GH_API_BASE}/repos/${repo.value.owner}/${repo.value.name}/contents${encodedPath ? `/${encodedPath}` : ""}?ref=${encodeURIComponent(props.sourceRef)}`;
  try {
    const response = await fetch(endpoint, { headers: apiHeaders() });
    if (!response.ok) throw new Error(readableError(response));
    const data = await response.json();
    if (!Array.isArray(data)) throw new Error("The selected source path is not a directory.");
    if (sequence !== requestSequence) return;
    entries.value = data.map((entry) => ({
      name: entry.name || "",
      path: entry.path || "",
      type: entry.type === "dir" ? "dir" : "file",
      size: Number(entry.size || 0),
      downloadUrl: entry.download_url || "",
      htmlUrl: entry.html_url || "",
    }));
    currentPath.value = path;
    filter.value = "";
  } catch (reason) {
    if (sequence === requestSequence) error.value = reason?.message || "Package files could not be loaded.";
  } finally {
    if (sequence === requestSequence) loading.value = false;
  }
}

function fileLanguage(filename) {
  const extension = filename.includes(".") ? filename.split(".").pop() : "txt";
  if (filename === "CMakeLists.txt") return "cmake";
  return normalizeCodeLanguage(extension);
}

function niceSize(value) {
  const bytes = Number(value || 0);
  if (!bytes) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

async function openEntry(entry) {
  if (entry.type === "dir") {
    await loadDirectory(entry.path);
    return;
  }
  preview.value = entry;
  previewLoading.value = true;
  previewError.value = "";
  previewHtml.value = "";
  if (entry.size > 500000) {
    previewError.value = "This file is too large to preview. Open it in the source repository instead.";
    previewLoading.value = false;
    return;
  }
  try {
    const response = await fetch(entry.downloadUrl, { headers: { Accept: "text/plain" } });
    if (!response.ok) throw new Error(`The file preview returned ${response.status}.`);
    const content = await response.text();
    previewHtml.value = /\.md(?:own)?$/i.test(entry.name)
      ? await renderRegistryMarkdown(content)
      : await highlightRegistryCode(content, fileLanguage(entry.name));
  } catch (reason) {
    previewError.value = reason?.message || "The file could not be previewed.";
  } finally {
    previewLoading.value = false;
  }
}

async function copyPath() {
  if (!preview.value?.path) return;
  await navigator.clipboard.writeText(preview.value.path);
  copied.value = true;
  window.setTimeout(() => { copied.value = false; }, 1400);
}

function goUp() {
  const parts = currentPath.value.split("/").filter(Boolean);
  parts.pop();
  loadDirectory(parts.join("/"));
}

onMounted(() => loadDirectory(""));
watch(() => [props.repository, props.sourceRef], () => loadDirectory(""));
</script>

<template>
  <div class="files-browser">
    <header class="files-toolbar">
      <nav class="files-breadcrumbs" aria-label="Package file path">
        <button type="button" :aria-current="currentPath ? undefined : 'page'" @click="loadDirectory('')">root</button>
        <template v-for="crumb in breadcrumbs" :key="crumb.path">
          <span>/</span><button type="button" :aria-current="crumb.path === currentPath ? 'page' : undefined" @click="loadDirectory(crumb.path)">{{ crumb.label }}</button>
        </template>
      </nav>
      <a v-if="repositoryUrl" :href="repositoryUrl" target="_blank" rel="noreferrer">Open source <span aria-hidden="true">↗</span></a>
    </header>

    <div v-if="preview" class="file-preview">
      <div class="file-preview__bar">
        <button type="button" @click="preview = null">← Files</button>
        <strong>{{ preview.path }}</strong>
        <div><button type="button" @click="copyPath">{{ copied ? "Copied" : "Copy path" }}</button><a :href="preview.htmlUrl" target="_blank" rel="noreferrer">Source ↗</a></div>
      </div>
      <RegistryState v-if="previewLoading" kind="loading" title="Loading file" message="Fetching the published source file." />
      <RegistryState v-else-if="previewError" kind="error" title="Preview unavailable" :message="previewError" />
      <article v-else-if="/\.md(?:own)?$/i.test(preview.name)" class="file-markdown markdown-content" v-html="previewHtml"></article>
      <div v-else class="file-code" v-html="previewHtml"></div>
      <span class="sr-only" aria-live="polite">{{ copied ? "File path copied" : "" }}</span>
    </div>

    <template v-else>
      <div class="files-filter"><label for="package-file-filter">Filter files</label><input id="package-file-filter" v-model="filter" type="search" placeholder="Filter this directory" /></div>
      <RegistryState v-if="loading" kind="loading" title="Loading files" message="Reading the published source tree." />
      <RegistryState v-else-if="error" kind="error" title="Files unavailable" :message="error" />
      <div v-else class="files-list" role="table" aria-label="Package files">
        <div class="files-row files-row--head" role="row"><span role="columnheader">Name</span><span role="columnheader">Size</span></div>
        <button v-if="currentPath" type="button" class="files-row" role="row" @click="goUp"><span role="cell"><i aria-hidden="true">↑</i>..</span><span role="cell"></span></button>
        <button v-for="entry in visibleEntries" :key="entry.path" type="button" class="files-row" role="row" @click="openEntry(entry)">
          <span role="cell"><i aria-hidden="true">{{ entry.type === 'dir' ? '▸' : '·' }}</i>{{ entry.name }}</span><span role="cell">{{ entry.type === "file" ? niceSize(entry.size) : "" }}</span>
        </button>
        <p v-if="!visibleEntries.length" class="files-empty">No files match this filter.</p>
      </div>
    </template>
  </div>
</template>

<style scoped>
.files-browser { min-width: 0; }
.files-toolbar, .file-preview__bar { min-height: 48px; display: flex; align-items: center; justify-content: space-between; gap: 16px; padding: 10px 14px; border: 1px solid var(--line); background: var(--bg-panel); }
.files-toolbar { border-radius: var(--radius-md) var(--radius-md) 0 0; }
.files-toolbar > a, .file-preview__bar a { flex: 0 0 auto; color: var(--green-soft); font-size: .72rem; }
.files-breadcrumbs { min-width: 0; display: flex; align-items: center; gap: 5px; overflow-x: auto; color: var(--text-muted); font: .72rem var(--font-mono); }
.files-breadcrumbs button, .file-preview__bar button { border: 0; background: transparent; color: var(--text-soft); cursor: pointer; }
.files-breadcrumbs button[aria-current="page"] { color: var(--green-bright); }
.files-filter { display: grid; grid-template-columns: auto minmax(160px, 280px); justify-content: end; align-items: center; gap: 12px; padding: 11px 14px; border-inline: 1px solid var(--line); color: var(--text-muted); font-size: .72rem; }
.files-filter input { width: 100%; padding: 8px 10px; border: 1px solid var(--line-strong); border-radius: var(--radius-sm); background: var(--bg-ink); color: var(--text); outline: none; }
.files-filter input:focus { border-color: var(--green-line); box-shadow: 0 0 0 3px var(--green-wash); }
.files-list { overflow: hidden; border: 1px solid var(--line); border-radius: 0 0 var(--radius-md) var(--radius-md); }
.files-row { width: 100%; min-height: 43px; display: grid; grid-template-columns: minmax(0, 1fr) 90px; align-items: center; gap: 16px; padding: 0 14px; border: 0; border-bottom: 1px solid var(--line); background: transparent; color: var(--text-soft); text-align: left; cursor: pointer; }
.files-row:last-of-type { border-bottom: 0; }.files-row:not(.files-row--head):hover { background: var(--green-wash); color: var(--text); }
.files-row--head { min-height: 36px; background: var(--bg-panel); color: var(--text-muted); cursor: default; font: .65rem var(--font-mono); text-transform: uppercase; }
.files-row span:first-child { min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }.files-row span:last-child { color: var(--text-muted); font: .68rem var(--font-mono); text-align: right; }
.files-row i { width: 20px; display: inline-block; color: var(--green-soft); font-style: normal; }
.files-empty { padding: 28px 14px; color: var(--text-muted); text-align: center; }
.file-preview { overflow: hidden; border-radius: var(--radius-md); }
.file-preview__bar { border-radius: var(--radius-md) var(--radius-md) 0 0; }.file-preview__bar strong { min-width: 0; overflow: hidden; color: var(--text-soft); font: .7rem var(--font-mono); text-overflow: ellipsis; white-space: nowrap; }.file-preview__bar > div { display: flex; gap: 10px; flex: 0 0 auto; }
.file-code, .file-markdown { max-height: 720px; overflow: auto; border: 1px solid var(--line); border-top: 0; background: var(--bg-ink); }
.file-code :deep(pre) { margin: 0; padding: 18px; background: var(--bg-ink) !important; }.file-code :deep(code) { font: .78rem/1.65 var(--font-mono); }
.file-markdown { padding: 24px; }
@media (max-width: 620px) { .files-toolbar, .file-preview__bar { align-items: flex-start; flex-direction: column; }.files-filter { grid-template-columns: 1fr; }.file-preview__bar > div { width: 100%; justify-content: space-between; }.files-row { grid-template-columns: minmax(0, 1fr) 64px; } }
</style>
