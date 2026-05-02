<template>
  <div class="rh">

    <!-- Animated background -->
    <div class="rh-bg" aria-hidden="true">
      <RegistryNetBg />
    </div>

    <!-- Top nav -->
    <header class="rh-header">
      <div class="rh-header-inner">
        <!-- Logo -->
        <RouterLink class="rh-brand" to="/" aria-label="Vix Registry home">
          <svg class="rh-brand-mark" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <defs>
              <linearGradient id="rhg-left" x1="5" y1="6" x2="18" y2="30" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stop-color="#d4fcd4"/>
                <stop offset="55%" stop-color="#4ade80"/>
                <stop offset="100%" stop-color="#22c55e"/>
              </linearGradient>
              <linearGradient id="rhg-right" x1="31" y1="6" x2="18" y2="30" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stop-color="#22c55e"/>
                <stop offset="100%" stop-color="#15803d"/>
              </linearGradient>
            </defs>
            <polygon points="5,6 12,6 18,28 14,28" fill="url(#rhg-left)"/>
            <polygon points="31,6 24,6 18,28 22,28" fill="url(#rhg-right)"/>
            <line x1="9" y1="16" x2="13.5" y2="29" stroke="#bbf7d0" stroke-width="1.1" stroke-linecap="round" opacity="0.7"/>
          </svg>
          <span class="rh-brand-name">Vix</span><span class="rh-brand-ext"> Registry</span>
        </RouterLink>

        <!-- Nav links -->
        <nav class="rh-nav" aria-label="Registry navigation">
          <RouterLink class="rh-nav-link" to="/browse">Packages</RouterLink>
          <a class="rh-nav-link" href="https://docs.vixcpp.com" target="_blank" rel="noreferrer">Docs</a>
          <a class="rh-nav-link" href="https://vixcpp.com" target="_blank" rel="noreferrer">Vix.cpp</a>
        </nav>

        <!-- Actions -->
        <div class="rh-header-actions">
          <RouterLink class="rh-publish-btn" to="/publish">
            <svg viewBox="0 0 16 16" fill="none"><path d="M8 2v9M4 7l4 4 4-4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M2 12h12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
            Publish
          </RouterLink>
        </div>

        <!-- Mobile burger -->
        <button type="button" class="rh-burger" @click="mobileOpen = !mobileOpen" aria-label="Toggle menu">
          <span></span><span></span><span></span>
        </button>
      </div>

      <!-- Mobile menu -->
      <div v-if="mobileOpen" class="rh-mobile-menu">
        <RouterLink class="rh-mobile-link" to="/browse" @click="mobileOpen = false">Packages</RouterLink>
        <a class="rh-mobile-link" href="https://docs.vixcpp.com" target="_blank" rel="noreferrer" @click="mobileOpen = false">Docs</a>
        <a class="rh-mobile-link" href="https://vixcpp.com" target="_blank" rel="noreferrer" @click="mobileOpen = false">Vix.cpp</a>
        <RouterLink class="rh-mobile-link rh-mobile-publish" to="/publish" @click="mobileOpen = false">Publish a package</RouterLink>
      </div>
    </header>

    <!-- Hero -->
    <main class="rh-hero">
      <div class="rh-hero-inner">

        <!-- Badge -->
        <div class="rh-badge">
          <span class="rh-badge-dot"></span>
          Open source · Offline-first · MIT
        </div>

        <!-- Title -->
        <h1 class="rh-title">
          The C++ package registry<br>
          <span class="rh-title-accent">built for Vix.cpp</span>
        </h1>

        <!-- Subtitle -->
        <p class="rh-subtitle">
          Discover, install, and publish C++ packages for the Vix runtime.<br class="rh-br">
          Works fully offline after sync. No friction.
        </p>

        <!-- Search -->
        <form class="rh-search-wrap" @submit.prevent="goSearch" role="search">
          <div class="rh-search">
            <svg class="rh-search-icon" viewBox="0 0 20 20" fill="none" aria-hidden="true">
              <circle cx="9" cy="9" r="6" stroke="currentColor" stroke-width="1.6"/>
              <path d="M13.5 13.5L17 17" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
            </svg>
            <input
              v-model.trim="q"
              ref="searchInput"
              class="rh-search-input"
              type="search"
              placeholder="Search packages…"
              autocomplete="off"
              autocorrect="off"
              spellcheck="false"
              @keydown.esc="q = ''"
            />
            <kbd class="rh-search-kbd" aria-hidden="true">⌘K</kbd>
          </div>
          <button type="submit" class="rh-search-btn" :disabled="!q">
            Search
          </button>
        </form>

        <!-- Quick links -->
        <div class="rh-quick">
          <span class="rh-quick-label">Popular:</span>
          <button
            v-for="tag in popularTags"
            :key="tag"
            type="button"
            class="rh-quick-tag"
            @click="quickSearch(tag)"
          >{{ tag }}</button>
        </div>

        <!-- Stats -->
        <div class="rh-stats">
          <div class="rh-stat">
            <span class="rh-stat-val">{{ stats.packages }}</span>
            <span class="rh-stat-label">Packages</span>
          </div>
          <div class="rh-stat-sep" aria-hidden="true"></div>
          <div class="rh-stat">
            <span class="rh-stat-val">{{ stats.publishers }}</span>
            <span class="rh-stat-label">Publishers</span>
          </div>
          <div class="rh-stat-sep" aria-hidden="true"></div>
          <div class="rh-stat">
            <span class="rh-stat-val">MIT</span>
            <span class="rh-stat-label">Licensed</span>
          </div>
          <div class="rh-stat-sep" aria-hidden="true"></div>
          <div class="rh-stat">
            <span class="rh-stat-val">Offline</span>
            <span class="rh-stat-label">First</span>
          </div>
        </div>

      </div>
    </main>

    <!-- Features strip -->
    <section class="rh-features" aria-label="Key features">
      <div class="rh-features-inner">
        <div class="rh-feature">
          <div class="rh-feature-icon">
            <svg viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="8" stroke="currentColor" stroke-width="1.5"/><path d="M7 10l2 2 4-4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </div>
          <div class="rh-feature-body">
            <div class="rh-feature-title">One command install</div>
            <div class="rh-feature-desc">vix add @scope/pkg · vix install</div>
          </div>
        </div>

        <div class="rh-feature-divider" aria-hidden="true"></div>

        <div class="rh-feature">
          <div class="rh-feature-icon">
            <svg viewBox="0 0 20 20" fill="none"><path d="M4 10h12M10 4v12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><rect x="2" y="2" width="16" height="16" rx="3" stroke="currentColor" stroke-width="1.5"/></svg>
          </div>
          <div class="rh-feature-body">
            <div class="rh-feature-title">Reproducible builds</div>
            <div class="rh-feature-desc">vix.lock pins exact versions</div>
          </div>
        </div>

        <div class="rh-feature-divider" aria-hidden="true"></div>

        <div class="rh-feature">
          <div class="rh-feature-icon">
            <svg viewBox="0 0 20 20" fill="none"><path d="M3 10c0-3.86 3.14-7 7-7s7 3.14 7 7" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><path d="M10 17a7 7 0 0 1-7-7" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-dasharray="2 2"/><circle cx="10" cy="10" r="2" fill="currentColor"/></svg>
          </div>
          <div class="rh-feature-body">
            <div class="rh-feature-title">Works offline</div>
            <div class="rh-feature-desc">Sync once, build anywhere</div>
          </div>
        </div>

        <div class="rh-feature-divider" aria-hidden="true"></div>

        <div class="rh-feature">
          <div class="rh-feature-icon">
            <svg viewBox="0 0 20 20" fill="none"><path d="M10 2L2 7l8 5 8-5-8-5Z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/><path d="M2 13l8 5 8-5" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/></svg>
          </div>
          <div class="rh-feature-body">
            <div class="rh-feature-title">Scoped namespaces</div>
            <div class="rh-feature-desc">@scope/package like npm</div>
          </div>
        </div>
      </div>
    </section>

   <!-- How it works -->
<section class="rh-how">
  <div class="rh-how-inner">
    <h2 class="rh-how-title">Install a framework in one command</h2>
    <p class="rh-how-sub">
      Search a package, install it globally, then use it in a Vix project.
    </p>

    <div class="rh-how-steps">
      <div class="rh-how-step">
        <div class="rh-how-step-n">1</div>
        <div class="rh-how-step-body">
          <div class="rh-how-step-title">Find the package</div>
          <div class="rh-how-code code-card">
            <div class="code-head">
              <div class="head-left">
                <span class="dot dot-red"></span>
                <span class="dot dot-yellow"></span>
                <span class="dot dot-green"></span>
              </div>
            </div>
            <div class="code-body rh-code-body">
              <pre class="code-pre rh-code-pre"><code><span class="shell-path">~$</span> <span class="shell-cmd">vix search</span> <span class="shell-flag">cnerium/app</span>
  <span class="shell-cmd">cnerium/app</span> <span class="shell-path">(latest: 0.5.0)</span>
  the fast, minimalist web framework for Vix.

<span class="shell-success">✔</span> Showing 1-1 of 1 result(s).</code></pre>
            </div>
          </div>
        </div>
      </div>

      <div class="rh-how-connector" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none">
          <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </div>

      <div class="rh-how-step">
        <div class="rh-how-step-n">2</div>
        <div class="rh-how-step-body">
          <div class="rh-how-step-title">Install the framework</div>
          <div class="rh-how-code code-card">
            <div class="code-head">
              <div class="head-left">
                <span class="dot dot-red"></span>
                <span class="dot dot-yellow"></span>
                <span class="dot dot-green"></span>
              </div>
            </div>
            <div class="code-body rh-code-body">
              <pre class="code-pre rh-code-pre"><code><span class="shell-path">~$</span> <span class="shell-cmd">vix install</span> <span class="shell-flag">-g</span> <span class="shell-path">cnerium/app</span>
<span class="shell-success">✔</span> Installed cnerium/app@0.5.0
<span class="shell-success">✔</span> Ready to use in Vix projects</code></pre>
            </div>
          </div>
        </div>
      </div>

      <div class="rh-how-connector" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none">
          <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </div>

      <div class="rh-how-step">
        <div class="rh-how-step-n">3</div>
        <div class="rh-how-step-body">
          <div class="rh-how-step-title">Build an app</div>
          <div class="rh-how-code code-card">
            <div class="code-head">
              <div class="head-left">
                <span class="dot dot-red"></span>
                <span class="dot dot-yellow"></span>
                <span class="dot dot-green"></span>
                <span class="head-title"> main.cpp</span>
              </div>
            </div>
            <div class="code-body rh-code-body">
              <pre class="code-pre rh-code-pre"><code><span class="cpp-directive">#include</span> <span class="cpp-include">&lt;cnerium/app/app.hpp&gt;</span>
<span class="cpp-keyword">using namespace</span> cnerium::app;
<span class="cpp-keyword">int</span> <span class="cpp-fn">main</span>()
{
  App app;
  app.get(<span class="cpp-string">"/"</span>, [](AppContext &ctx) {
    ctx.text(<span class="cpp-string">"Hello from Cnerium"</span>);
  });
  app.listen(<span class="cpp-string">"127.0.0.1"</span>, <span class="cpp-type">8080</span>);
}</code></pre>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="rh-how-ctas">
      <RouterLink class="rh-cta-primary" to="/browse">Browse packages</RouterLink>
      <a class="rh-cta-secondary" href="https://docs.vixcpp.com" target="_blank" rel="noreferrer">Read the docs</a>
    </div>
  </div>
</section>

    <!-- Publish CTA -->
    <section class="rh-publish-cta">
      <div class="rh-publish-cta-inner">
        <div class="rh-publish-cta-left">
          <h2 class="rh-publish-cta-title">Share your C++ code with the world</h2>
          <p class="rh-publish-cta-desc">
            Publish a package in minutes. Tag a release on GitHub, run vix publish, and your package is live.
          </p>
        </div>
        <RouterLink class="rh-cta-primary" to="/publish">
          Publish a package
        </RouterLink>
      </div>
    </section>

    <!-- Footer -->
    <footer class="rh-footer">
      <div class="rh-footer-inner">
        <span class="rh-footer-copy">Vix Registry · MIT licensed · Part of <a href="https://vixcpp.com" target="_blank" rel="noreferrer">Vix.cpp</a></span>
        <div class="rh-footer-links">
          <a href="https://github.com/vixcpp/vix" target="_blank" rel="noreferrer">GitHub</a>
          <a href="https://docs.vixcpp.com" target="_blank" rel="noreferrer">Docs</a>
          <RouterLink to="/browse">Browse</RouterLink>
        </div>
      </div>
    </footer>

  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from "vue";
import { useRouter } from "vue-router";
import RegistryNetBg from "@/components/RegistryNetBg.vue";
import { useBodyClass } from "@/lib/useBodyClass";

useBodyClass("is-registry");

const router = useRouter();
const q = ref("");
const searchInput = ref(null);
const mobileOpen = ref(false);

const popularTags = ["pdf", "json", "http", "websocket", "crypto", "sqlite"];

const stats = ref({
  packages: "135",
  publishers: "6",
});

function goSearch() {
  const s = q.value.trim();
  if (!s) return;
  router.push({ path: "/browse", query: { q: s } });
}

function quickSearch(tag) {
  q.value = tag;
  router.push({ path: "/browse", query: { q: tag } });
}

function onKeydown(e) {
  if ((e.metaKey || e.ctrlKey) && e.key === "k") {
    e.preventDefault();
    searchInput.value?.focus();
  }
}

onMounted(() => {
  document.addEventListener("keydown", onKeydown);
  // Fetch real stats if API available
  // fetch("/api/stats").then(r => r.json()).then(d => { stats.value = d; }).catch(() => {});
});

onBeforeUnmount(() => {
  document.removeEventListener("keydown", onKeydown);
});
</script>

<style scoped>
/* ===================== ROOT ===================== */
.rh {
  position: relative;
  min-height: 100vh;
  background: #0e0e10;
  color: #f0f0f2;
  font-family: system-ui, -apple-system, sans-serif;
  -webkit-font-smoothing: antialiased;
  overflow-x: hidden;
}

/* ===================== BG ===================== */
.rh-bg {
  position: fixed;
  inset: 0;
  z-index: 0;
  /* pointer-events activés pour les interactions souris sur le canvas */
  opacity: 0.45;
}

/* ===================== HEADER ===================== */
.rh-header {
  position: sticky;
  top: 0;
  z-index: 40;
  background: rgba(14, 14, 16, 0.88);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.07);
}

.rh-header-inner {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1.5rem;
  height: 58px;
  display: flex;
  align-items: center;
  gap: 0;
}

.rh-brand {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  text-decoration: none;
  margin-right: 2rem;
  flex-shrink: 0;
}

.rh-brand-mark {
  width: 26px;
  height: 26px;
  flex-shrink: 0;
}

.rh-brand-name {
  font-size: 1.05rem;
  font-weight: 800;
  color: #22c55e;
  letter-spacing: -0.4px;
}

.rh-brand-ext {
  font-size: 0.95rem;
  font-weight: 400;
  color: rgba(255, 255, 255, 0.35);
  letter-spacing: 0;
}

.rh-nav {
  display: none;
  align-items: center;
  gap: 4px;
}

.rh-nav-link {
  font-size: 0.875rem;
  color: rgba(240, 240, 242, 0.6);
  text-decoration: none;
  padding: 6px 10px;
  border-radius: 7px;
  transition: color 0.13s ease, background 0.13s ease;
}

.rh-nav-link:hover {
  color: #f0f0f2;
  background: rgba(255, 255, 255, 0.05);
}

.rh-header-actions {
  display: none;
  align-items: center;
  gap: 8px;
  margin-left: auto;
}

.rh-publish-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 7px 14px;
  border-radius: 8px;
  font-size: 0.83rem;
  font-weight: 600;
  background: #22c55e;
  color: #052e16;
  text-decoration: none;
  transition: background 0.13s ease, transform 0.11s ease;
}

.rh-publish-btn svg {
  width: 14px;
  height: 14px;
}

.rh-publish-btn:hover {
  background: #4ade80;
  transform: translateY(-1px);
}

/* Burger */
.rh-burger {
  display: inline-flex;
  flex-direction: column;
  gap: 4px;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 7px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(255, 255, 255, 0.04);
  cursor: pointer;
  margin-left: auto;
}

.rh-burger span {
  display: block;
  width: 14px;
  height: 1.5px;
  border-radius: 999px;
  background: rgba(240, 240, 242, 0.7);
}

.rh-mobile-menu {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 8px 12px 14px;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
  background: rgba(14, 14, 16, 0.98);
}

.rh-mobile-link {
  display: block;
  padding: 10px 12px;
  border-radius: 7px;
  font-size: 0.92rem;
  color: rgba(240, 240, 242, 0.75);
  text-decoration: none;
  transition: background 0.12s ease;
}

.rh-mobile-link:hover {
  background: rgba(255, 255, 255, 0.05);
}

.rh-mobile-publish {
  margin-top: 6px;
  background: rgba(34, 197, 94, 0.1);
  color: #4ade80;
  border: 1px solid rgba(34, 197, 94, 0.2);
}

/* ===================== HERO ===================== */
.rh-hero {
  position: relative;
  z-index: 1;
  padding: 80px 0 64px;
}

.rh-hero-inner {
  max-width: 760px;
  margin: 0 auto;
  padding: 0 1.5rem;
  text-align: center;
}

.rh-badge {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 4px 12px;
  border-radius: 999px;
  background: rgba(34, 197, 94, 0.08);
  border: 1px solid rgba(34, 197, 94, 0.2);
  font-size: 0.73rem;
  color: #4ade80;
  margin-bottom: 24px;
  letter-spacing: 0.02em;
}

.rh-badge-dot {
  width: 6px;
  height: 6px;
  border-radius: 999px;
  background: #22c55e;
  flex-shrink: 0;
}

.rh-title {
  margin: 0 0 18px;
  font-size: clamp(2.2rem, 5vw, 3.8rem);
  font-weight: 800;
  letter-spacing: -0.05em;
  line-height: 1.08;
  color: #f0f0f2;
}

.rh-title-accent {
  color: #22c55e;
}

.rh-subtitle {
  margin: 0 0 36px;
  font-size: 1.05rem;
  color: rgba(240, 240, 242, 0.55);
  line-height: 1.7;
  max-width: 52ch;
  margin-left: auto;
  margin-right: auto;
  margin-bottom: 36px;
}

.rh-br { display: none; }

/* ===================== SEARCH ===================== */
.rh-search-wrap {
  display: flex;
  gap: 8px;
  max-width: 620px;
  margin: 0 auto 16px;
}

.rh-search {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 10px;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 10px;
  padding: 0 14px;
  transition: border-color 0.15s ease, background 0.15s ease, box-shadow 0.15s ease;
}

.rh-search:focus-within {
  border-color: rgba(34, 197, 94, 0.4);
  background: rgba(255, 255, 255, 0.08);
  box-shadow: 0 0 0 3px rgba(34, 197, 94, 0.1);
}

.rh-search-icon {
  width: 16px;
  height: 16px;
  color: rgba(240, 240, 242, 0.35);
  flex-shrink: 0;
}

.rh-search-input {
  flex: 1;
  background: transparent;
  border: 0;
  outline: none;
  font-size: 0.95rem;
  color: #f0f0f2;
  padding: 13px 0;
  caret-color: #22c55e;
  min-width: 0;
}

.rh-search-input::placeholder {
  color: rgba(240, 240, 242, 0.3);
}

/* Hide default search cancel button */
.rh-search-input::-webkit-search-cancel-button { display: none; }

.rh-search-kbd {
  font-family: ui-monospace, monospace;
  font-size: 0.68rem;
  color: rgba(240, 240, 242, 0.25);
  padding: 2px 6px;
  border-radius: 5px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  flex-shrink: 0;
  white-space: nowrap;
}

.rh-search-btn {
  padding: 0 20px;
  height: 48px;
  border-radius: 10px;
  background: #22c55e;
  color: #052e16;
  font-size: 0.875rem;
  font-weight: 700;
  border: none;
  cursor: pointer;
  flex-shrink: 0;
  transition: background 0.13s ease, transform 0.11s ease;
}

.rh-search-btn:hover {
  background: #4ade80;
  transform: translateY(-1px);
}

.rh-search-btn:disabled {
  opacity: 0.45;
  cursor: not-allowed;
  transform: none;
}

/* Quick tags */
.rh-quick {
  display: flex;
  align-items: center;
  gap: 6px;
  justify-content: center;
  flex-wrap: wrap;
  margin-bottom: 48px;
}

.rh-quick-label {
  font-size: 0.8rem;
  color: rgba(240, 240, 242, 0.35);
}

.rh-quick-tag {
  font-size: 0.78rem;
  color: rgba(240, 240, 242, 0.55);
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.09);
  border-radius: 999px;
  padding: 3px 10px;
  cursor: pointer;
  transition: color 0.12s ease, background 0.12s ease, border-color 0.12s ease;
}

.rh-quick-tag:hover {
  color: #4ade80;
  background: rgba(34, 197, 94, 0.08);
  border-color: rgba(34, 197, 94, 0.2);
}

/* Stats */
.rh-stats {
  display: inline-flex;
  align-items: center;
  gap: 0;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.03);
  overflow: hidden;
}

.rh-stat {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  padding: 14px 24px;
}

.rh-stat-val {
  font-size: 1.15rem;
  font-weight: 800;
  color: #f0f0f2;
  letter-spacing: -0.02em;
  line-height: 1;
}

.rh-stat-label {
  font-size: 0.7rem;
  color: rgba(240, 240, 242, 0.38);
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.rh-stat-sep {
  width: 1px;
  height: 32px;
  background: rgba(255, 255, 255, 0.08);
  flex-shrink: 0;
}

/* ===================== FEATURES STRIP ===================== */
.rh-features {
  position: relative;
  z-index: 1;
  border-top: 1px solid rgba(255, 255, 255, 0.07);
  border-bottom: 1px solid rgba(255, 255, 255, 0.07);
  background: rgba(255, 255, 255, 0.02);
}

.rh-features-inner {
  max-width: 1100px;
  margin: 0 auto;
  padding: 0 1.5rem;
  display: flex;
  align-items: stretch;
}

.rh-feature {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 20px 16px;
}

.rh-feature-icon {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: rgba(34, 197, 94, 0.1);
  border: 1px solid rgba(34, 197, 94, 0.18);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  color: #22c55e;
}

.rh-feature-icon svg {
  width: 14px;
  height: 14px;
}

.rh-feature-title {
  font-size: 0.85rem;
  font-weight: 700;
  color: #e0e0e2;
  line-height: 1.3;
}

.rh-feature-desc {
  font-size: 0.75rem;
  color: rgba(240, 240, 242, 0.4);
  margin-top: 1px;
  font-family: "JetBrains Mono", ui-monospace, monospace;
}

.rh-feature-divider {
  width: 1px;
  background: rgba(255, 255, 255, 0.07);
  flex-shrink: 0;
}

/* ===================== HOW IT WORKS ===================== */
.rh-how {
  position: relative;
  z-index: 1;
  padding: 72px 0 64px;
}

.rh-how-inner {
  max-width: 1100px;
  margin: 0 auto;
  padding: 0 1.5rem;
  text-align: center;
}

.rh-how-title {
  margin: 0 0 10px;
  font-size: clamp(1.5rem, 2.5vw, 2rem);
  font-weight: 800;
  letter-spacing: -0.03em;
  color: #f0f0f2;
}

.rh-how-sub {
  margin: 0 0 48px;
  font-size: 0.95rem;
  color: rgba(240, 240, 242, 0.5);
  line-height: 1.65;
}

.rh-how-steps {
  display: flex;
  align-items: flex-start;
  gap: 0;
  text-align: left;
}

.rh-how-step {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.rh-how-step-n {
  width: 28px;
  height: 28px;
  border-radius: 999px;
  background: #22c55e;
  color: #052e16;
  font-size: 0.8rem;
  font-weight: 800;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.rh-how-step-body {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.rh-how-step-title {
  font-size: 0.88rem;
  font-weight: 700;
  color: #e0e0e2;
}

.rh-how-code {
  /* inherits code-card */
}

.rh-code-body {
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}

.rh-code-pre {
  margin: 0;
  padding: 12px 14px;
  font-size: 0.78rem;
  line-height: 1.7;
  white-space: pre;
  width: max-content;
  min-width: 100%;
}

.rh-how-connector {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 12px;
  padding-top: 40px;
  color: rgba(255, 255, 255, 0.2);
  flex-shrink: 0;
}

.rh-how-connector svg {
  width: 20px;
  height: 20px;
}

.rh-how-ctas {
  display: flex;
  gap: 10px;
  justify-content: center;
  margin-top: 48px;
  flex-wrap: wrap;
}

/* ===================== CTAs ===================== */
.rh-cta-primary {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 11px 24px;
  border-radius: 9px;
  font-size: 0.88rem;
  font-weight: 700;
  background: #22c55e;
  color: #052e16;
  text-decoration: none;
  transition: background 0.13s ease, transform 0.11s ease;
}

.rh-cta-primary:hover {
  background: #4ade80;
  transform: translateY(-1px);
}

.rh-cta-secondary {
  display: inline-flex;
  align-items: center;
  padding: 11px 24px;
  border-radius: 9px;
  font-size: 0.88rem;
  font-weight: 500;
  color: rgba(240, 240, 242, 0.65);
  border: 1px solid rgba(255, 255, 255, 0.12);
  text-decoration: none;
  transition: color 0.13s ease, background 0.13s ease, border-color 0.13s ease;
}

.rh-cta-secondary:hover {
  color: #f0f0f2;
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(255, 255, 255, 0.2);
}

/* ===================== PUBLISH CTA ===================== */
.rh-publish-cta {
  position: relative;
  z-index: 1;
  border-top: 1px solid rgba(255, 255, 255, 0.07);
  padding: 48px 0;
  background: rgba(34, 197, 94, 0.03);
}

.rh-publish-cta-inner {
  max-width: 1100px;
  margin: 0 auto;
  padding: 0 1.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 32px;
  flex-wrap: wrap;
}

.rh-publish-cta-title {
  margin: 0 0 8px;
  font-size: 1.2rem;
  font-weight: 700;
  color: #f0f0f2;
  letter-spacing: -0.02em;
}

.rh-publish-cta-desc {
  margin: 0;
  font-size: 0.88rem;
  color: rgba(240, 240, 242, 0.5);
  line-height: 1.65;
  max-width: 54ch;
}

/* ===================== FOOTER ===================== */
.rh-footer {
  position: relative;
  z-index: 1;
  border-top: 1px solid rgba(255, 255, 255, 0.07);
  padding: 20px 0;
}

.rh-footer-inner {
  max-width: 1100px;
  margin: 0 auto;
  padding: 0 1.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
}

.rh-footer-copy {
  font-size: 0.78rem;
  color: rgba(240, 240, 242, 0.35);
}

.rh-footer-copy a {
  color: rgba(240, 240, 242, 0.5);
  text-decoration: none;
  transition: color 0.12s ease;
}

.rh-footer-copy a:hover { color: #f0f0f2; }

.rh-footer-links {
  display: flex;
  gap: 16px;
}

.rh-footer-links a {
  font-size: 0.78rem;
  color: rgba(240, 240, 242, 0.35);
  text-decoration: none;
  transition: color 0.12s ease;
}

.rh-footer-links a:hover { color: rgba(240, 240, 242, 0.7); }

/* ===================== RESPONSIVE ===================== */
@media (min-width: 900px) {
  .rh-nav { display: flex; }
  .rh-header-actions { display: flex; }
  .rh-burger { display: none; }
  .rh-br { display: inline; }
}

@media (max-width: 899px) {
  .rh-brand { margin-right: auto; }

  .rh-how-steps {
    flex-direction: column;
    gap: 24px;
  }

  .rh-how-connector {
    padding: 0;
    transform: rotate(90deg);
    align-self: center;
  }

  .rh-features-inner {
    flex-direction: column;
  }

  .rh-feature-divider {
    width: 100%;
    height: 1px;
  }

  .rh-stats {
    flex-wrap: wrap;
  }

  .rh-stat {
    flex: 1 1 40%;
    padding: 12px 16px;
  }

  .rh-stat:nth-child(2) { border-right: none; }
  .rh-stat:nth-child(3) { border-top: 1px solid rgba(255,255,255,0.08); }
  .rh-stat:nth-child(4) { border-top: 1px solid rgba(255,255,255,0.08); border-right: none; }

  .rh-publish-cta-inner {
    flex-direction: column;
    align-items: flex-start;
  }
}

@media (max-width: 600px) {
  .rh-hero { padding: 56px 0 48px; }
  .rh-title { font-size: 2rem; }
  .rh-search-wrap { flex-direction: column; }
  .rh-search-btn { height: 44px; }
  .rh-search-kbd { display: none; }
  .rh-stat { flex: 1 1 100%; }
  .rh-stat-sep { display: none; }
  .rh-stats { border-radius: 10px; }
}
</style>
