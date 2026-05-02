<script setup>
import { onMounted, onBeforeUnmount, ref, nextTick, watch, computed } from "vue";
import { createHighlighter } from "shiki";

const props = defineProps({
  pkg:            { type: Object,   default: null },
  installSnippet: { type: String,   default: "" },
  includeSnippet: { type: String,   default: "" },
  safeClipboardCopy: { type: Function, required: true },
  readmeLoading:  { type: Boolean,  default: false },
  readmeError:    { type: String,   default: "" },
  readmeHtml:     { type: String,   default: "" },
  readmeToc:      { type: Array,    default: () => [] },
  readmeMeta:     { type: Object,   default: () => ({ path: "", sourceUrl: "", editUrl: "" }) },
  readmeWarn:     { type: String,   default: "" },
});

/* TOC active section */
const activeTocId = ref("");
let io = null;

function setupTocObserver() {
  if (io) io.disconnect();
  const toc = Array.isArray(props.readmeToc) ? props.readmeToc : [];
  if (!toc.length) return;
  io = new IntersectionObserver(
    (entries) => {
      const visible = entries.filter(e => e.isIntersecting).sort((a,b) => a.boundingClientRect.top - b.boundingClientRect.top);
      if (visible.length) activeTocId.value = visible[0].target.id;
    },
    { root: null, rootMargin: "-20% 0px -70% 0px", threshold: [0,1] }
  );
  for (const h of toc) { const el = document.getElementById(h.id); if (el) io.observe(el); }
}

const readmeHtmlFixed = computed(() => props.readmeHtml || "");

/* Shiki */
const highlightedInstall = ref("");
const highlightedInclude = ref("");
let shiki = null;
let hseq  = 0;

function escapeHtml(s) {
  return String(s).replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"','&quot;');
}

async function ensureShiki() {
  if (shiki) return shiki;
  shiki = await createHighlighter({ themes: ["github-dark"], langs: ["bash","cpp"] });
  return shiki;
}

async function highlightCode() {
  const seq = ++hseq;
  try {
    const h = await ensureShiki();
    if (seq !== hseq) return;
    highlightedInstall.value = props.installSnippet ? h.codeToHtml(props.installSnippet, { lang: "bash", theme: "github-dark" }) : "";
    highlightedInclude.value = props.includeSnippet ? h.codeToHtml(props.includeSnippet, { lang: "cpp",  theme: "github-dark" }) : "";
  } catch {
    if (seq !== hseq) return;
    highlightedInstall.value = props.installSnippet ? `<pre><code>${escapeHtml(props.installSnippet)}</code></pre>` : "";
    highlightedInclude.value = props.includeSnippet ? `<pre><code>${escapeHtml(props.includeSnippet)}</code></pre>` : "";
  }
}

function patchReadmeLinks() {
  const root = document.querySelector(".readme");
  if (!root) return;
  for (const a of root.querySelectorAll("a[href]")) {
    const href = a.getAttribute("href") || "";
    if (!href.startsWith("#") && /^(https?:)?\/\//.test(href)) {
      a.setAttribute("target","_blank");
      a.setAttribute("rel","noreferrer noopener");
    }
  }
}

onMounted(async () => { await nextTick(); setupTocObserver(); await highlightCode(); patchReadmeLinks(); });
watch(() => props.readmeHtml,  async () => { await nextTick(); setupTocObserver(); patchReadmeLinks(); });
watch(() => props.readmeToc,   async () => { await nextTick(); setupTocObserver(); });
watch(() => props.installSnippet, () => highlightCode());
watch(() => props.includeSnippet, () => highlightCode());
onBeforeUnmount(() => { if (io) io.disconnect(); io = null; });
</script>

<template>
  <div class="layout">
    <main class="main">
      <div class="readme-head">
        <div class="h">Overview</div>
        <div class="actions">
          <a v-if="readmeMeta.sourceUrl" class="link" :href="readmeMeta.sourceUrl" target="_blank" rel="noreferrer">View source</a>
          <a v-if="readmeMeta.editUrl"   class="link" :href="readmeMeta.editUrl"   target="_blank" rel="noreferrer">Edit</a>
        </div>
      </div>
      <div class="warn" v-if="readmeWarn">{{ readmeWarn }}</div>
      <div class="state" v-if="readmeLoading"><span class="spinner"></span>Loading README...</div>
      <div class="state error" v-else-if="readmeError">{{ readmeError }}</div>
      <div class="state soft"  v-else-if="!readmeHtml">No README found for this package.</div>
      <article v-else class="readme" v-html="readmeHtmlFixed"></article>
    </main>

    <aside class="side">
      <section class="panel">
        <div class="title">Use with</div>
        <div class="field" v-if="installSnippet">
          <div class="label">Add package</div>
          <div class="codeblock" v-html="highlightedInstall"></div>
        </div>
        <div class="field" v-if="includeSnippet">
          <div class="label">Import symbol</div>
          <div class="codeblock" v-html="highlightedInclude"></div>
        </div>
        <div class="field" v-if="pkg?.keywords?.length">
          <div class="label">Keywords</div>
          <div class="tags"><span class="tag" v-for="k in pkg.keywords" :key="k">{{ k }}</span></div>
        </div>
      </section>

      <section class="panel" v-if="pkg?.homepage">
        <div class="title">Homepage</div>
        <a class="ext" :href="pkg.homepage" target="_blank" rel="noreferrer">{{ pkg.homepage }}</a>
      </section>

      <section class="panel" v-if="pkg?.maintainers?.length">
        <div class="title">Maintainers</div>
        <div class="maintainers">
          <a v-for="m in pkg.maintainers" :key="m.github || m.name"
            class="maintainer"
            :href="m.github ? ('https://github.com/' + m.github) : undefined"
            :target="m.github ? '_blank' : undefined"
            rel="noreferrer">
            <span class="avatar" aria-hidden="true"></span>
            <span class="mname">{{ m.name || m.github }}</span>
            <span class="mgh" v-if="m.github">@{{ m.github }}</span>
          </a>
        </div>
      </section>

      <section class="panel toc" v-if="readmeToc?.length">
        <div class="title">Document navigation</div>
        <nav class="toc-list" aria-label="On this page">
          <a v-for="h in readmeToc" :key="h.id"
            class="toc-item"
            :class="{ sub: h.level >= 3, active: activeTocId === h.id }"
            :href="'#' + h.id">
            <span class="toc-ico" aria-hidden="true"></span>
            <span class="toc-text">{{ h.text }}</span>
          </a>
        </nav>
      </section>
    </aside>
  </div>
</template>

<style scoped>
.layout { --max: 1180px; --pad: 24px; display: grid; grid-template-columns: minmax(0,1fr) 340px; gap: 24px; max-width: var(--max); margin: 0 auto; padding: 18px var(--pad) 40px; }
.main { min-width: 0; }
.readme-head { display: flex; align-items: baseline; justify-content: space-between; gap: 12px; margin-bottom: 10px; }
.readme-head .h { font-size: 18px; font-weight: 900; color: rgba(255,255,255,.92); }
.actions { display: inline-flex; gap: 10px; }
.link { font-size: 13px; font-weight: 800; color: rgba(255,255,255,.72); text-decoration: none; }
.link:hover { color: rgba(255,255,255,.92); }
.warn { margin: 10px 0 0; padding: 10px 12px; border: 1px solid rgba(255,208,0,.22); background: rgba(255,208,0,.08); border-radius: 10px; color: rgba(255,255,255,.82); font-size: 13px; }
.state { margin-top: 12px; color: rgba(255,255,255,.72); font-size: 13.5px; display: flex; align-items: center; gap: 10px; }
.state.error { color: rgba(255,140,140,.92); }
.state.soft  { color: rgba(255,255,255,.62); }
.spinner { width: 14px; height: 14px; border-radius: 50%; border: 2px solid rgba(255,255,255,.20); border-top-color: rgba(255,255,255,.70); animation: spin .9s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
.readme { margin-top: 14px; min-width: 0; }
.side { position: sticky; top: 14px; align-self: start; display: flex; flex-direction: column; gap: 10px; min-width: 0; }
.panel { border: 0; background: transparent; border-radius: 0; padding: 0; box-shadow: none; }
.panel + .panel { border-top: 1px solid rgba(255,255,255,.08); padding-top: 10px; margin-top: 2px; }
.title { font-size: 12px; letter-spacing: .08em; text-transform: uppercase; font-weight: 900; color: rgba(255,255,255,.62); margin: 0 0 8px; }
.field { margin-top: 10px; }
.field:first-of-type { margin-top: 0; }
.label { font-size: 12px; font-weight: 900; color: rgba(255,255,255,.78); margin-bottom: 6px; }
.codeblock { position: relative; padding: 10px 12px; border-radius: 10px; background: rgba(0,0,0,.35); border: 1px solid rgba(255,255,255,.12); overflow: auto; white-space: nowrap; }
.codeblock :deep(pre) { margin: 0; padding: 0; background: transparent; overflow: visible; }
.codeblock :deep(code) { padding: 0; }
.ext { display: block; font-size: 13px; font-weight: 800; color: rgba(140,200,255,.95); text-decoration: none; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.ext:hover { text-decoration: underline; }
.tags { display: flex; flex-wrap: wrap; gap: 8px; }
.tag { padding: 6px 8px; border-radius: 999px; background: rgba(255,255,255,.06); border: 1px solid rgba(255,255,255,.10); color: rgba(255,255,255,.82); font-size: 12px; font-weight: 800; }
.maintainers { display: flex; flex-direction: column; gap: 6px; }
.maintainer { display: flex; align-items: center; gap: 10px; padding: 8px 10px; border-radius: 10px; background: rgba(255,255,255,.04); border: 1px solid rgba(255,255,255,.08); text-decoration: none; color: rgba(140,200,255,.95); }
.maintainer:hover { background: rgba(255,255,255,.06); }
.avatar { width: 22px; height: 22px; border-radius: 999px; background: rgba(255,255,255,.10); border: 1px solid rgba(255,255,255,.10); flex: 0 0 auto; }
.mname { font-weight: 900; font-size: 13px; color: rgba(255,255,255,.92); }
.mgh { margin-left: auto; font-size: 12.5px; font-weight: 900; color: rgba(255,255,255,.60); }
.toc-list { display: flex; flex-direction: column; gap: 2px; }
.toc-item { display: flex; align-items: center; gap: 8px; text-decoration: none; color: rgba(255,255,255,.74); font-size: 13px; padding: 6px 8px; border-radius: 10px; }
.toc-item:hover { color: rgba(255,255,255,.92); background: rgba(255,255,255,.05); }
.toc-item.sub { padding-left: 18px; color: rgba(255,255,255,.64); }
.toc-ico { width: 10px; height: 10px; border-radius: 999px; border: 1px solid rgba(255,255,255,.22); background: rgba(255,255,255,.06); flex: 0 0 auto; }
.toc-item.active { color: rgba(255,255,255,.96); background: rgba(255,255,255,.08); }
.toc-item.active .toc-ico { border-color: rgba(140,200,255,.70); background: rgba(140,200,255,.22); }
.toc-text { min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.readme :deep(a) { color: rgba(120,200,255,.95); text-decoration: none; }
.readme :deep(a:hover) { text-decoration: underline; }
.readme :deep(p) { color: rgba(255,255,255,.80); line-height: 1.7; margin: 10px 0; font-size: 14px; }
.readme :deep(h1),.readme :deep(h2),.readme :deep(h3) { color: rgba(255,255,255,.92); font-weight: 950; }
.readme :deep(h1) { font-size: 26px; margin: 18px 0 10px; }
.readme :deep(h2) { font-size: 18px; margin: 22px 0 10px; padding-bottom: 8px; border-bottom: 1px solid rgba(255,255,255,.10); }
.readme :deep(h3) { font-size: 15px; margin: 18px 0 8px; }
.readme :deep(ul),.readme :deep(ol) { margin: 10px 0 10px 18px; color: rgba(255,255,255,.82); }
.readme :deep(li) { margin: 6px 0; line-height: 1.6; }
.readme :deep(blockquote) { margin: 12px 0; padding: 10px 12px; border-left: 3px solid rgba(120,200,255,.55); background: rgba(120,200,255,.08); border-radius: 10px; color: rgba(255,255,255,.80); }
.readme :deep(code) { font-family: ui-monospace,SFMono-Regular,Menlo,monospace; font-size: 12.5px; color: rgba(255,255,255,.90); background: rgba(0,0,0,.22); border: 1px solid rgba(255,255,255,.10); padding: 2px 6px; border-radius: 8px; }
.readme :deep(pre) { margin: 14px 0; padding: 12px; border-radius: 12px; border: 1px solid rgba(255,255,255,.10); background: rgba(0,0,0,.30); overflow: auto; max-width: 100%; }
.readme :deep(pre code) { background: transparent; border: 0; padding: 0; font-size: 12.8px; color: rgba(255,255,255,.88); display: block; line-height: 1.6; }
.readme :deep(img) { max-width: 100%; height: auto; display: block; }
.readme :deep(table) { display: block; max-width: 100%; overflow-x: auto; border-collapse: collapse; margin: 14px 0; }
.readme :deep(th),.readme :deep(td) { border-bottom: 1px solid rgba(255,255,255,.10); padding: 10px; text-align: left; }
.readme :deep(th) { color: rgba(255,255,255,.86); font-weight: 950; }
.readme :deep(td) { color: rgba(255,255,255,.78); }
.readme :deep(hr) { border: 0; border-top: 1px solid rgba(255,255,255,.10); margin: 18px 0; }
.readme :deep(pre.shiki) { margin: 14px 0; padding: 12px 14px; overflow-x: auto; white-space: pre; line-height: 1.6; border-radius: 12px; }
.readme :deep(pre.shiki code) { display: block; white-space: pre; line-height: 1.6; }
@media (max-width: 980px) { .layout { grid-template-columns: 1fr; gap: 18px; } .side { position: static; } .toc-list { max-height: 280px; overflow: auto; } }
@media (max-width: 560px) { .layout { padding: 14px 14px 28px; } .readme-head { flex-direction: column; } }
</style>
