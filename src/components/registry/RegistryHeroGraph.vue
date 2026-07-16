<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from "vue";
import { heroEdges, heroNodes, heroPulsePaths } from "./registryHeroGraphData";
const graph = ref(null), hovered = ref(""), paused = ref(false);
const finePointer = typeof window !== "undefined" && matchMedia("(hover: hover) and (pointer: fine)").matches;
const graphClass = computed(() => ({ "is-focused": !!hovered.value, "is-paused": paused.value }));
function edgeClass(edge) { return { "is-related": hovered.value && (edge.from === hovered.value || edge.to === hovered.value), "is-muted": hovered.value && edge.from !== hovered.value && edge.to !== hovered.value, "is-desktop-only": edge.desktopOnly }; }
function move(event) {
  if (!finePointer || !graph.value) return;
  const rect = graph.value.getBoundingClientRect();
  graph.value.style.setProperty("--dx", `${(((event.clientX - rect.left) / rect.width - .5) * 4).toFixed(2)}px`);
  graph.value.style.setProperty("--dy", `${(((event.clientY - rect.top) / rect.height - .5) * 3).toFixed(2)}px`);
}
function clear() { hovered.value = ""; graph.value?.style.setProperty("--dx", "0px"); graph.value?.style.setProperty("--dy", "0px"); }
function visibility() { paused.value = document.hidden; }
onMounted(() => document.addEventListener("visibilitychange", visibility));
onBeforeUnmount(() => document.removeEventListener("visibilitychange", visibility));
</script>
<template>
  <div ref="graph" class="package-core" :class="graphClass" aria-hidden="true" @pointermove="move" @pointerleave="clear">
    <svg viewBox="0 0 600 520" preserveAspectRatio="xMidYMid meet">
      <defs><pattern id="core-grid" width="32" height="32" patternUnits="userSpaceOnUse"><path d="M32 0H0V32" fill="none" stroke="currentColor" stroke-width=".7" /></pattern></defs>
      <rect class="grid" x="18" y="18" width="564" height="484" rx="18" fill="url(#core-grid)" />
      <path class="registration" d="M26 78H54M26 78V106M574 412H546M574 412V384" />
      <path v-for="edge in heroEdges" :key="edge.id" :d="edge.path" pathLength="1" class="edge" :class="edgeClass(edge)" :style="{ '--delay': `${edge.delay}s` }" />
      <path v-for="(path, index) in heroPulsePaths" :key="path" :d="path" pathLength="1" class="pulse" :style="{ '--pulse-delay': `${2.85 + index * 1.8}s` }" />
      <g v-for="node in heroNodes" :key="node.id" :data-node="node.id" class="node" :class="{ active: hovered === node.id, muted: hovered && hovered !== node.id, labeled: node.labeled, 'is-desktop-only': node.desktopOnly }" :transform="`translate(${node.x} ${node.y})`" :style="{ '--delay': `${node.delay}s`, '--float-delay': `${node.delay * -1.3}s` }" @pointerenter="hovered = node.id">
        <g class="node-body"><path class="node-surface" d="M-33-17H24L33-8V17H-33Z" /><path class="node-fold" d="M24-17V-8H33" /><circle cx="-21" cy="0" r="2.7" /><text class="node-label" x="5" y="4">{{ node.label }}</text><text class="node-version" x="0" y="33">{{ node.version }}</text></g>
      </g>
      <g class="cpp-core">
        <path class="shell" pathLength="1" d="M190 176L232 134H368L410 176V338L368 380H232L190 338Z" />
        <path class="inner" pathLength="1" d="M207 184L239 152H361L393 184V330L361 362H239L207 330Z" />
        <path class="ports" d="M190 256H170M410 256H430M300 134V114M300 380V400" />
        <g class="cpp-mark">
          <rect class="c c1" x="240" y="210" width="58" height="14" rx="2" /><rect class="c c2" x="226" y="224" width="14" height="64" rx="2" /><rect class="c c3" x="240" y="288" width="58" height="14" rx="2" /><rect class="c c4" x="240" y="238" width="12" height="36" rx="2" />
          <g class="plus plus1"><rect x="315" y="245" width="42" height="12" rx="2" /><rect x="330" y="230" width="12" height="42" rx="2" /></g><g class="plus plus2"><rect x="359" y="245" width="42" height="12" rx="2" /><rect x="374" y="230" width="12" height="42" rx="2" /></g>
        </g>
        <g class="caption"><path d="M248 329H352" /><text x="300" y="345">PACKAGE CORE</text></g>
      </g>
    </svg>
  </div>
</template>
<style scoped>
.package-core{--dx:0px;--dy:0px;position:relative;width:100%;min-width:0;aspect-ratio:6/5.2;color:rgba(255,255,255,.045);pointer-events:auto}.package-core svg{width:100%;height:100%;display:block;overflow:visible}.grid{opacity:.48}.registration{fill:none;stroke:rgba(74,222,128,.13);stroke-width:1;stroke-dasharray:3 6}
.edge{fill:none;stroke:rgba(74,222,128,.24);stroke-width:1;vector-effect:non-scaling-stroke;stroke-dasharray:1;stroke-dashoffset:1;animation:draw .55s ease-out var(--delay) forwards,breathe 7s ease-in-out calc(var(--delay) + .7s) infinite;transition:opacity .18s,stroke .18s,stroke-width .18s}.edge.is-related{opacity:1;stroke:rgba(134,239,172,.78);stroke-width:1.7}.edge.is-muted{opacity:.07}.pulse{fill:none;stroke:rgba(134,239,172,.78);stroke-width:2;stroke-linecap:round;stroke-dasharray:.025 .975;stroke-dashoffset:1;opacity:0;animation:pulse 7s linear var(--pulse-delay) infinite}
.node{opacity:0;pointer-events:auto;animation:node-in .38s ease-out var(--delay) forwards;transition:opacity .18s}.node-body{animation:float 9s ease-in-out var(--float-delay) infinite;transform-box:fill-box;transform-origin:center}.node-surface{fill:rgba(20,24,27,.96);stroke:rgba(74,222,128,.3);stroke-width:1;transition:fill .18s,stroke .18s}.node-fold{fill:none;stroke:rgba(134,239,172,.48)}.node circle{fill:#4ade80}.node-label{fill:rgba(255,255,255,.62);font:600 10px var(--font-mono);text-anchor:middle;opacity:0;transition:opacity .18s}.node-version{fill:rgba(134,239,172,.62);font:8px var(--font-mono);text-anchor:middle;opacity:0}.node.labeled .node-label,.node.active .node-label,.node.active .node-version{opacity:1}.node.active .node-surface{fill:rgba(34,197,94,.14);stroke:rgba(134,239,172,.85)}.node.muted{opacity:.18!important}
.cpp-core{transform:translate(var(--dx),var(--dy));transform-origin:300px 257px;transition:transform .25s ease-out}.shell,.inner{fill:rgba(15,18,21,.9);stroke:rgba(74,222,128,.34);stroke-width:1.2;stroke-dasharray:1;stroke-dashoffset:1;animation:draw .7s ease-out .12s forwards}.inner{fill:rgba(26,30,34,.74);stroke:rgba(255,255,255,.1);animation-delay:.35s}.ports{fill:none;stroke:rgba(134,239,172,.42);opacity:0;animation:reveal .3s ease .75s forwards}.c{fill:rgba(74,222,128,.8);opacity:0;transform-box:fill-box;transform-origin:center;animation:module .28s ease-out forwards}.c1{animation-delay:.72s}.c2{animation-delay:.84s}.c3{animation-delay:.96s}.c4{animation-delay:1.08s}.plus{opacity:0;transform-box:fill-box;transform-origin:center;animation:plus .36s cubic-bezier(.2,.85,.35,1) forwards}.plus1{animation-delay:1.18s;transform:translateX(16px)}.plus2{animation-delay:1.34s;transform:translateX(24px)}.plus rect{fill:rgba(134,239,172,.92)}.caption{opacity:0;animation:reveal .3s ease 1.52s forwards}.caption path{stroke:rgba(255,255,255,.12)}.caption text{fill:rgba(255,255,255,.32);font:7px var(--font-mono);letter-spacing:1.4px;text-anchor:middle}.package-core.is-paused *{animation-play-state:paused!important}
@keyframes draw{to{stroke-dashoffset:0}}@keyframes reveal{to{opacity:1}}@keyframes module{from{opacity:0;transform:scale(.45)}to{opacity:1;transform:scale(1)}}@keyframes plus{from{opacity:0}to{opacity:1;transform:translateX(0)}}@keyframes node-in{from{opacity:0;transform:scale(.9)}to{opacity:.76;transform:scale(1)}}@keyframes breathe{0%,100%{opacity:.42}50%{opacity:.7}}@keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-3px)}}@keyframes pulse{0%,22%{opacity:0;stroke-dashoffset:1}26%{opacity:1}50%{opacity:.75}56%,100%{opacity:0;stroke-dashoffset:0}}
@media(hover:none),(pointer:coarse){.node{pointer-events:none}}@media(max-width:900px){.package-core{max-width:470px;margin-inline:auto}}@media(max-width:560px){.package-core{max-width:330px;aspect-ratio:6/4.6}.package-core .is-desktop-only,.node[data-node="async"],.node[data-node="crypto"]{display:none}.grid{opacity:.28}.edge{opacity:.2}}@media(prefers-reduced-motion:reduce){.shell,.inner{stroke-dashoffset:0;animation:none}.ports,.c,.plus,.caption,.node{opacity:.76;animation:none;transform:none}.plus,.c{opacity:1}.node-body,.edge{animation:none}.edge{stroke-dashoffset:0}.pulse{display:none}}
</style>
