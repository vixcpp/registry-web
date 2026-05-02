<script setup>
import { computed, ref } from "vue";

const props = defineProps({
  id:             { type: String,   default: "" },
  pkgDisplayName: { type: String,   default: "" },
  pkg:            { type: Object,   default: null },
  indexVersion:   { type: String,   default: "" },
  selectedCommit: { type: String,   default: "" },
  selectedTag:    { type: String,   default: "" },
  shortSha:       { type: Function, required: true },
  offlineMode:    { type: Boolean,  default: false },
  ghNotice:       { type: String,   default: "" },
  sortedVersions: { type: Array,    default: () => [] },
  selectedVersion:{ type: String,   default: "" },
  activeTab:      { type: String,   default: "overview" },
  overviewBadges: { type: Array,    default: () => [] },
  isDev:          { type: Boolean,  default: false },
  hasDevToken:    { type: Boolean,  default: false },
  tokenPolicyLabel:{ type: String,  default: "" },
  metaOpen:       { type: Boolean,  default: false },
  registryHintExportsJson: { type: Function, required: false, default: () => "" },
  namespace:      { type: String,   default: "" },
});

const emit = defineEmits(["setTab","reloadTab","update:selectedVersion","update:metaOpen"]);

const tabReloadKey = ref(0);

function relativeTime(iso) {
  if (!iso) return null;
  const t = Date.parse(iso);
  if (!Number.isFinite(t)) return null;
  const diff = Math.floor((Date.now() - t) / 1000);
  const m = Math.floor(diff / 60), h = Math.floor(diff / 3600), d = Math.floor(diff / 86400);
  if (diff < 60)  return "just now";
  if (m < 60)     return `${m} minute${m > 1 ? "s" : ""} ago`;
  if (h < 24)     return `${h} hour${h > 1 ? "s" : ""} ago`;
  return `${d} day${d > 1 ? "s" : ""} ago`;
}

const latest = computed(() => {
  const v = props.pkg?.latestVersion || props.selectedVersion;
  if (v) return v;
  const keys = props.pkg?.versions ? Object.keys(props.pkg.versions) : [];
  return keys.length ? keys.sort().slice(-1)[0] : "";
});

const published = computed(() => {
  const iso = props.pkg?.versions?.[latest.value]?.publishedAt;
  const rel = relativeTime(iso);
  if (rel && latest.value) return { rel, version: latest.value };
  const rel2 = relativeTime(props.indexVersion);
  if (rel2) return { rel: rel2, version: latest.value || "" };
  return null;
});

function clickTab(t) {
  if (props.activeTab === t) { tabReloadKey.value++; emit("reloadTab", t); return; }
  emit("setTab", t);
}
</script>

<template>
  <header class="header">
    <div class="header-top single">
      <div class="pkg-block">
        <div class="breadcrumb">
          <RouterLink to="/browse" class="crumb-link">Registry</RouterLink>
          <span class="crumb-sep">/</span>
          <RouterLink class="crumb-link" :to="`/ns/${pkg?.namespace || id.split('/')[0]}`">
            @{{ pkg?.namespace || id.split('/')[0] }}
          </RouterLink>
          <span class="crumb-sep">/</span>
          <span class="crumb-current">{{ pkgDisplayName || id.split('/').pop() }}</span>
        </div>

        <div class="pkg-name-row">
          <div class="pkg-name">{{ pkgDisplayName || id.split('/').pop() }}</div>
          <div class="chips">
            <span class="chip latest" v-if="latest">Latest {{ latest }}</span>
            <span class="chip offline" v-if="offlineMode">Offline</span>
          </div>
        </div>

        <div class="pkg-desc" v-if="pkg?.description">{{ pkg.description }}</div>

        <div class="meta-line" v-if="published">
          <span>Published {{ published.rel }}<span class="mono" v-if="published.version"> ({{ published.version }})</span></span>
          <span v-if="pkg?.license">· {{ pkg.license }}</span>
          <span v-if="pkg?.type">· {{ pkg.type }}</span>
        </div>

        <div class="notice" v-if="offlineMode">Offline mode is enabled. Remote sources may be limited.</div>
        <div class="notice soft" v-else-if="ghNotice">{{ ghNotice }}</div>
      </div>
    </div>

    <nav class="tabs" aria-label="Package tabs">
      <button type="button" class="tab" :class="{ active: activeTab === 'overview' }" @click="clickTab('overview')">Overview</button>
      <button type="button" class="tab" :class="{ active: activeTab === 'docs' }"     @click="clickTab('docs')">Docs</button>
      <button type="button" class="tab" :class="{ active: activeTab === 'files' }"    @click="clickTab('files')">Files</button>
      <button type="button" class="tab" :class="{ active: activeTab === 'versions' }" @click="clickTab('versions')">Versions</button>
    </nav>
  </header>
</template>

<style scoped>
.header { --page-max: 1180px; --pad-x: 24px; --accent: #3aa6ff; border: 0; border-radius: 0; box-shadow: none; background: transparent; position: relative; }
.header-top { width: 100%; max-width: var(--page-max); margin: 0 auto; padding: 18px var(--pad-x) 12px; }
.header-top.single { display: block; }
.pkg-block { min-width: 0; }
.breadcrumb { margin-bottom: 10px; font-size: 13px; font-weight: 700; display: flex; align-items: center; gap: 8px; }
.crumb-link { color: rgba(140,200,255,.95); text-decoration: none; transition: color .15s; }
.crumb-link:hover { color: rgba(255,255,255,.95); }
.crumb-sep { color: rgba(255,255,255,.35); }
.crumb-current { color: rgba(255,255,255,.90); }
.pkg-name-row { margin-top: 10px; display: flex; align-items: baseline; justify-content: space-between; gap: 12px; flex-wrap: wrap; }
.pkg-name { font-size: 30px; line-height: 1.15; font-weight: 900; letter-spacing: -0.02em; color: rgba(255,255,255,.92); word-break: break-word; }
.chips { display: inline-flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.chip { display: inline-flex; align-items: center; padding: 4px 8px; border-radius: 10px; border: 1px solid rgba(255,255,255,.12); background: rgba(255,255,255,.04); color: rgba(255,255,255,.86); font-size: 12px; font-weight: 900; }
.chip.latest { border-color: rgba(255,208,0,.35); background: rgba(255,208,0,.14); }
.chip.offline { border-color: rgba(255,255,255,.14); }
.pkg-desc { margin-top: 8px; color: rgba(255,255,255,.68); font-size: 14px; line-height: 1.55; max-width: 80ch; }
.meta-line { margin-top: 10px; font-size: 13.5px; color: rgba(255,255,255,.65); display: flex; flex-wrap: wrap; gap: 8px; align-items: center; }
.meta-line .mono { font-family: ui-monospace,SFMono-Regular,Menlo,monospace; font-size: 12.5px; color: rgba(255,255,255,.75); }
.notice { margin-top: 10px; color: rgba(255,255,255,.70); font-size: 13px; line-height: 1.45; }
.notice.soft { color: rgba(255,255,255,.70); }
.tabs { width: 100%; max-width: var(--page-max); margin: 10px auto 0; padding: 0 var(--pad-x); display: flex; align-items: flex-end; gap: 18px; background: transparent; border: 0; border-bottom: 1px solid rgba(255,255,255,.10); overflow-x: auto; scrollbar-width: none; }
.tabs::-webkit-scrollbar { height: 0; }
.tab { appearance: none; background: transparent; border: 0; border-radius: 0; box-shadow: none; padding: 12px 2px; color: rgba(255,255,255,.72); font-weight: 800; font-size: 13.5px; cursor: pointer; position: relative; line-height: 1; }
.tab:hover { color: rgba(255,255,255,.92); }
.tab::after { content: ""; position: absolute; left: 0; right: 0; bottom: -1px; height: 2px; background: transparent; border-radius: 999px; }
.tab.active { color: rgba(255,255,255,.95); }
.tab.active::after { background: var(--accent); }
@media (max-width: 900px) { .header-top { padding: 16px 16px 12px; } .tabs { padding: 0 16px; gap: 14px; } .pkg-name { font-size: 26px; } }
@media (max-width: 520px) { .header-top { padding: 14px 14px 10px; } .tabs { padding: 0 14px; } .pkg-name { font-size: 22px; } }
</style>
