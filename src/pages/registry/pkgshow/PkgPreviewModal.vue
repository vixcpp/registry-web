<script setup>
defineProps({
  previewOpen:         { type: Boolean,  default: false },
  previewLoading:      { type: Boolean,  default: false },
  previewError:        { type: String,   default: "" },
  previewNode:         { type: Object,   default: null },
  previewLang:         { type: String,   default: "txt" },
  previewHtml:         { type: String,   default: "" },
  previewText:         { type: String,   default: "" },
  nodeWebUrl:          { type: Function, required: true },
  copyPreviewPath:     { type: Function, required: true },
  copyPreviewRawUrl:   { type: Function, required: true },
  downloadPreviewFile: { type: Function, required: true },
  closePreview:        { type: Function, required: true },
});
</script>

<template>
  <div class="modal" v-if="previewOpen" role="dialog" aria-modal="true">
    <div class="modal-card">
      <div class="modal-top">
        <div class="modal-title">
          <span class="mono">{{ previewNode?.path || "" }}</span>
        </div>
        <div class="modal-actions">
          <button class="mini-btn" @click="copyPreviewPath">Copy path</button>
          <button class="mini-btn" @click="copyPreviewRawUrl">Copy raw</button>
          <button class="mini-btn" @click="downloadPreviewFile">Download</button>
          <a class="mini-link" v-if="previewNode" :href="nodeWebUrl(previewNode)" target="_blank" rel="noreferrer">Open</a>
          <button class="mini-btn danger" @click="closePreview" aria-label="Close preview">Close</button>
        </div>
      </div>
      <div class="state" v-if="previewLoading">
        <span class="spinner"></span>
        Loading preview...
      </div>
      <div class="state error" v-else-if="previewError">
        Error: {{ previewError }}
      </div>
      <div v-else class="modal-body">
        <div v-if="previewLang === 'md'" class="readme" v-html="previewHtml"></div>
        <pre v-else class="codebox"><code>{{ previewText }}</code></pre>
      </div>
    </div>
    <div class="modal-backdrop" @click="closePreview" aria-hidden="true"></div>
  </div>
</template>

<style scoped>
.modal { position: fixed; inset: 0; z-index: 100; display: flex; align-items: center; justify-content: center; padding: 20px; }
.modal-backdrop { position: fixed; inset: 0; background: rgba(0,0,0,.72); z-index: -1; }
.modal-card { position: relative; z-index: 1; width: 100%; max-width: 900px; max-height: 85vh; display: flex; flex-direction: column; border-radius: 14px; border: 1px solid rgba(255,255,255,.12); background: #111111; overflow: hidden; }
.modal-top { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 10px 14px; background: #161616; border-bottom: 1px solid rgba(255,255,255,.10); flex-shrink: 0; }
.modal-title { min-width: 0; }
.mono { font-family: ui-monospace,SFMono-Regular,Menlo,monospace; font-size: 12.5px; font-weight: 600; color: rgba(255,255,255,.90); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.modal-actions { display: flex; align-items: center; gap: 8px; flex-shrink: 0; flex-wrap: wrap; }
.mini-btn { border: 1px solid rgba(255,255,255,.14); background: rgba(255,255,255,.06); color: rgba(255,255,255,.85); font-size: 12px; font-weight: 600; padding: 5px 10px; border-radius: 7px; cursor: pointer; }
.mini-btn:hover { background: rgba(255,255,255,.10); }
.mini-btn.danger { border-color: rgba(255,100,100,.3); }
.mini-link { font-size: 12px; font-weight: 600; color: rgba(140,200,255,.95); text-decoration: none; padding: 5px 10px; border: 1px solid rgba(140,200,255,.2); border-radius: 7px; }
.mini-link:hover { background: rgba(140,200,255,.08); }
.state { display: flex; align-items: center; gap: 10px; padding: 18px 14px; color: rgba(255,255,255,.70); font-size: 13px; }
.state.error { color: rgba(255,140,140,.90); }
.spinner { width: 14px; height: 14px; border-radius: 50%; border: 2px solid rgba(255,255,255,.18); border-top-color: rgba(255,255,255,.70); animation: spin .9s linear infinite; flex-shrink: 0; }
@keyframes spin { to { transform: rotate(360deg); } }
.modal-body { flex: 1; overflow: auto; }
.codebox { margin: 0; padding: 16px; background: #111111; color: rgba(255,255,255,.88); font-family: ui-monospace,SFMono-Regular,Menlo,monospace; font-size: 13px; line-height: 1.6; white-space: pre; overflow: auto; }
.readme { padding: 18px; color: rgba(255,255,255,.85); line-height: 1.7; }
</style>
