<template>
  <footer class="registry-footer">
    <div class="registry-container registry-footer__main">
      <div>
        <RouterLink class="registry-footer__brand" to="/">Vix Registry</RouterLink>
        <p>Public packages for Vix.cpp and modern C++ projects.</p>
      </div>
      <nav aria-label="Footer navigation">
        <RouterLink to="/browse">Packages</RouterLink>
        <RouterLink to="/publish">Publish</RouterLink>
        <a href="https://docs.vixcpp.com" target="_blank" rel="noreferrer">Documentation</a>
        <a href="https://github.com/vixcpp/registry" target="_blank" rel="noreferrer">GitHub</a>
        <a href="https://cloud.softadastra.com" target="_blank" rel="noreferrer">Private packages</a>
      </nav>
    </div>
    <div class="registry-container registry-footer__bottom">
      <span>MIT licensed · Vix.cpp</span>
      <a href="https://softadastra.com" target="_blank" rel="noreferrer">Maintained by Softadastra</a>
    </div>
  </footer>
</template>

<style scoped>
.registry-footer { margin-top: auto; border-top: 1px solid var(--line); background: var(--bg-ink); }
.registry-footer__main { display: flex; justify-content: space-between; gap: 40px; padding-top: 44px; padding-bottom: 38px; }
.registry-footer__brand { color: var(--text); font-size: 1rem; font-weight: 750; }
.registry-footer p { margin-top: 8px; color: var(--text-muted); font-size: .82rem; }
.registry-footer nav { display: flex; flex-wrap: wrap; align-items: start; justify-content: flex-end; gap: 18px; color: var(--text-soft); font-size: .8rem; }
.registry-footer nav a:last-child { color: var(--green-soft); }
.registry-footer__bottom { display: flex; justify-content: space-between; gap: 20px; padding-top: 16px; padding-bottom: 16px; border-top: 1px solid var(--line); color: var(--text-muted); font: .69rem var(--font-mono); }
@media (max-width: 680px) { .registry-footer__main, .registry-footer__bottom { flex-direction: column; } .registry-footer nav { justify-content: flex-start; } }
</style>
