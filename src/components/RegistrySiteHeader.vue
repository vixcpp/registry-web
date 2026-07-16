<script setup>
import { onBeforeUnmount, onMounted, ref, watch } from "vue";
import { useRoute } from "vue-router";

const route = useRoute();
const open = ref(false);

function close() {
  open.value = false;
}

function onKeydown(event) {
  if (event.key === "Escape") close();
}

watch(() => route.fullPath, close);
onMounted(() => document.addEventListener("keydown", onKeydown));
onBeforeUnmount(() => document.removeEventListener("keydown", onKeydown));
</script>

<template>
  <header class="registry-header">
    <div class="registry-header__inner">
      <RouterLink class="registry-brand" to="/" aria-label="Vix Registry home">
        <img class="registry-brand__mark" src="/assets/pwa/icon-192.png" alt="" />
        <span class="registry-brand__name">Vix</span>
        <span class="registry-brand__product">Registry</span>
      </RouterLink>

      <nav class="registry-nav" aria-label="Registry navigation">
        <RouterLink to="/browse">Browse packages</RouterLink>
        <a href="https://docs.vixcpp.com" target="_blank" rel="noreferrer">Documentation</a>
        <RouterLink to="/publish">Publish</RouterLink>
      </nav>

      <div class="registry-header__actions">
        <a
          class="registry-github"
          href="https://github.com/vixcpp/registry"
          target="_blank"
          rel="noreferrer"
          aria-label="Vix Registry on GitHub"
        >
          <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M12 .7a11.5 11.5 0 0 0-3.64 22.41c.58.11.79-.25.79-.56v-2.23c-3.22.7-3.9-1.36-3.9-1.36-.53-1.34-1.29-1.7-1.29-1.7-1.05-.72.08-.7.08-.7 1.16.08 1.77 1.2 1.77 1.2 1.03 1.76 2.7 1.25 3.36.96.1-.75.4-1.25.73-1.54-2.57-.29-5.27-1.28-5.27-5.69 0-1.26.45-2.28 1.18-3.08-.12-.29-.51-1.46.11-3.04 0 0 .96-.31 3.16 1.17a10.9 10.9 0 0 1 5.76 0C17.04 5.1 18 5.4 18 5.4c.62 1.58.23 2.75.11 3.04.74.8 1.18 1.82 1.18 3.08 0 4.42-2.71 5.39-5.29 5.68.42.36.79 1.07.79 2.15v3.2c0 .31.21.68.8.56A11.5 11.5 0 0 0 12 .7Z" />
          </svg>
          <span>GitHub</span>
        </a>
        <RouterLink class="registry-publish" to="/publish">Publish package</RouterLink>
        <button
          class="registry-menu"
          type="button"
          :aria-expanded="open"
          aria-controls="registry-mobile-nav"
          aria-label="Toggle navigation"
          @click="open = !open"
        >
          <span :class="{ open }" />
          <span :class="{ open }" />
        </button>
      </div>
    </div>

    <Transition name="registry-drawer">
      <nav v-if="open" id="registry-mobile-nav" class="registry-mobile-nav" aria-label="Mobile navigation">
        <RouterLink to="/browse" @click="close">Browse packages</RouterLink>
        <a href="https://docs.vixcpp.com" target="_blank" rel="noreferrer" @click="close">Documentation</a>
        <RouterLink to="/publish" @click="close">Publish a package</RouterLink>
        <a href="https://github.com/vixcpp/registry" target="_blank" rel="noreferrer" @click="close">GitHub</a>
      </nav>
    </Transition>
  </header>
</template>

<style scoped>
.registry-header {
  position: sticky;
  top: 0;
  z-index: 100;
  border-bottom: 1px solid var(--line);
  background: rgba(19, 22, 25, 0.9);
  backdrop-filter: saturate(180%) blur(14px);
  -webkit-backdrop-filter: saturate(180%) blur(14px);
}

.registry-header__inner {
  width: min(100% - 2rem, var(--container-wide));
  height: 60px;
  margin-inline: auto;
  display: flex;
  align-items: center;
  gap: 24px;
}

.registry-brand { display: inline-flex; align-items: center; gap: 8px; flex-shrink: 0; }
.registry-brand__mark { width: 27px; height: 27px; border-radius: 6px; }
.registry-brand__name { color: var(--text); font-size: 1rem; font-weight: 800; }
.registry-brand__product { color: var(--text-muted); font-size: .94rem; font-weight: 600; }

.registry-nav { display: flex; align-items: center; gap: 3px; }
.registry-nav a { padding: .42rem .7rem; border-radius: var(--radius-sm); color: var(--text-soft); font-size: .87rem; font-weight: 500; transition: color var(--speed), background var(--speed); }
.registry-nav a:hover, .registry-nav a.router-link-active { color: var(--text); background: var(--bg-sunken); }
.registry-nav a.router-link-active { color: var(--green-soft); }

.registry-header__actions { margin-left: auto; display: flex; align-items: center; gap: 9px; }
.registry-github, .registry-publish { height: 36px; display: inline-flex; align-items: center; justify-content: center; gap: 7px; border-radius: var(--radius-md); font-size: .84rem; font-weight: 600; transition: color var(--speed), border-color var(--speed), background var(--speed), transform var(--speed); }
.registry-github { padding: 0 .8rem; border: 1px solid var(--line-strong); background: var(--bg-panel); color: var(--text-soft); }
.registry-github svg { width: 16px; height: 16px; }
.registry-github:hover { color: var(--text); border-color: var(--green-line); transform: translateY(-1px); }
.registry-publish { padding: 0 .95rem; background: var(--green); color: #07150c; box-shadow: var(--shadow-green); }
.registry-publish:hover { color: #07150c; background: var(--green-soft); transform: translateY(-1px); }

.registry-menu { display: none; width: 38px; height: 38px; border: 1px solid var(--line); border-radius: var(--radius-sm); background: var(--bg-panel); }
.registry-menu span { display: block; width: 17px; height: 1.8px; margin: 0 auto; border-radius: 2px; background: var(--text); transition: transform var(--speed); }
.registry-menu span + span { margin-top: 5px; }
.registry-menu span.open:first-child { transform: translateY(3.4px) rotate(45deg); }
.registry-menu span.open:last-child { transform: translateY(-3.4px) rotate(-45deg); }

.registry-mobile-nav { position: absolute; inset: 100% 0 auto; display: none; flex-direction: column; padding: 8px 16px 16px; border-bottom: 1px solid var(--line); background: rgba(26, 30, 34, .98); box-shadow: 0 20px 50px rgba(0, 0, 0, .35); }
.registry-mobile-nav a { padding: .75rem .6rem; border-bottom: 1px solid var(--line-soft); border-radius: var(--radius-sm); color: var(--text-soft); font-size: .94rem; }
.registry-mobile-nav a:last-child { border-bottom: 0; color: var(--green-soft); }
.registry-drawer-enter-active, .registry-drawer-leave-active { transition: opacity var(--speed), transform var(--speed); }
.registry-drawer-enter-from, .registry-drawer-leave-to { opacity: 0; transform: translateY(-6px); }

@media (max-width: 860px) {
  .registry-nav, .registry-publish { display: none; }
  .registry-menu, .registry-mobile-nav { display: flex; }
}

@media (max-width: 520px) {
  .registry-header__inner { width: min(100% - 1.25rem, var(--container-wide)); }
  .registry-brand__product, .registry-github span { display: none; }
  .registry-github { width: 38px; padding: 0; }
}
</style>
