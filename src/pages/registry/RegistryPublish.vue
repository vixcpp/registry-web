<script setup>
import { RouterLink } from "vue-router";
</script>

<template>
  <div class="rp">

    <!-- ══ TOPBAR — identique à RegistryBrowse ══ -->
    <header class="rp-topbar">
      <div class="rp-topbar-inner">

        <RouterLink class="rp-brand" to="/" aria-label="Registry home">
          <svg class="rp-brand-mark" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="rpl" x1="5" y1="6" x2="18" y2="30" gradientUnits="userSpaceOnUse">
                <stop offset="0%"   stop-color="#d4fcd4"/>
                <stop offset="55%"  stop-color="#4ade80"/>
                <stop offset="100%" stop-color="#22c55e"/>
              </linearGradient>
              <linearGradient id="rpr" x1="31" y1="6" x2="18" y2="30" gradientUnits="userSpaceOnUse">
                <stop offset="0%"   stop-color="#22c55e"/>
                <stop offset="100%" stop-color="#15803d"/>
              </linearGradient>
            </defs>
            <polygon points="5,6 12,6 18,28 14,28"  fill="url(#rpl)"/>
            <polygon points="31,6 24,6 18,28 22,28" fill="url(#rpr)"/>
            <line x1="9" y1="16" x2="13.5" y2="29" stroke="#bbf7d0" stroke-width="1.1" stroke-linecap="round" opacity="0.7"/>
          </svg>
          <span class="rp-brand-name">Vix</span><span class="rp-brand-dim"> Registry</span>
        </RouterLink>

        <nav class="rp-crumbs" aria-label="Breadcrumb">
          <RouterLink class="rp-crumb" to="/browse">Browse</RouterLink>
          <span class="rp-crumb-sep">/</span>
          <span class="rp-crumb rp-crumb--active">Publish</span>
        </nav>

        <div class="rp-topbar-right">
          <a class="rp-docs-link" href="https://docs.vixcpp.com/registry/publish" rel="noreferrer">Docs</a>
          <a class="rp-cmd-pill" href="https://docs.vixcpp.com/modules/cli/publish" rel="noreferrer">vix publish</a>
        </div>

      </div>
    </header>

    <!-- ══ BODY ══ -->
    <div class="rp-layout">

      <!-- ── Left: hero ── -->
      <div class="rp-hero">
        <div class="rp-kicker">CLI-only · local workflow</div>
        <h1 class="rp-h1">Publish a C++ library<br class="rp-br"/> in minutes</h1>

        <p class="rp-lead">
          Create a library with <code class="rp-code">vix new</code>.
          The project is already configured.
          When your code is ready, tag a version and publish directly from your terminal.
        </p>

        <!-- Steps -->
        <ol class="rp-steps" role="list">
          <li class="rp-step">
            <div class="rp-step-num">1</div>
            <div class="rp-step-body">
              <div class="rp-step-t">Create</div>
              <div class="rp-step-s">Generate a header-only library template with <code class="rp-code">vix new --lib</code>.</div>
            </div>
          </li>
          <li class="rp-step">
            <div class="rp-step-num">2</div>
            <div class="rp-step-body">
              <div class="rp-step-t">Test</div>
              <div class="rp-step-s">Run tests locally with <code class="rp-code">vix tests</code> and iterate.</div>
            </div>
          </li>
          <li class="rp-step">
            <div class="rp-step-num">3</div>
            <div class="rp-step-body">
              <div class="rp-step-t">Tag + Publish</div>
              <div class="rp-step-s">Push a git tag, then run <code class="rp-code">vix publish</code> — one command.</div>
            </div>
          </li>
        </ol>

        <div class="rp-cta">
          <a class="rp-btn rp-btn--primary" href="https://docs.vixcpp.com/registry/publish" rel="noreferrer">
            Read the docs
          </a>
          <RouterLink class="rp-btn" to="/browse">Browse packages</RouterLink>
        </div>

        <div class="rp-note">
          Requirement: your repository must be <strong>open source</strong> and your tag pushed to origin.
        </div>
      </div>

      <!-- ── Right: terminal + info ── -->
      <div class="rp-side">

        <!-- Terminal -->
        <div class="rp-terminal">
          <div class="rp-term-top">
            <span class="rp-dot rp-dot--r"></span>
            <span class="rp-dot rp-dot--y"></span>
            <span class="rp-dot rp-dot--g"></span>
            <span class="rp-term-title">Terminal</span>
            <span class="rp-term-hint">vix publish</span>
          </div>
          <pre class="rp-term"><code><span class="rp-c"># 1. Create a C++ library</span>
vix new tree --lib
cd tree

<span class="rp-c"># 2. Run tests</span>
vix tests

<span class="rp-c"># 3. Tag and push</span>
git tag -a v0.1.0 -m "v0.1.0"
git push origin v0.1.0

<span class="rp-c"># 4. Publish to the registry</span>
vix publish 0.1.0 --notes "Initial release"

<span class="rp-ok">✓  PR created for: namespace/tree v0.1.0</span>
<span class="rp-ok">✓  registry will reflect this after merge</span></code></pre>
        </div>

        <!-- After publishing -->
        <div class="rp-after">
          <div class="rp-after-title">After publishing</div>
          <div class="rp-after-row">
            <span class="rp-after-k">Search</span>
            <code class="rp-after-v">vix search tree</code>
          </div>
          <div class="rp-after-row">
            <span class="rp-after-k">Install</span>
            <code class="rp-after-v">vix add namespace/tree</code>
          </div>
          <div class="rp-after-row">
            <span class="rp-after-k">Browse</span>
            <span class="rp-after-dim">registry.vixcpp.com/@namespace/tree</span>
          </div>
        </div>

        <!-- Flags -->
        <div class="rp-flags">
          <div class="rp-flags-title">Common flags</div>
          <div class="rp-flag-row">
            <code class="rp-flag">--notes "..."</code>
            <span class="rp-flag-desc">Attach release notes to the PR</span>
          </div>
          <div class="rp-flag-row">
            <code class="rp-flag">--dry-run</code>
            <span class="rp-flag-desc">Validate without pushing anything</span>
          </div>
          <div class="rp-flag-row">
            <code class="rp-flag">--cleanup</code>
            <span class="rp-flag-desc">Remove older local publish branches</span>
          </div>
          <div class="rp-flag-row">
            <code class="rp-flag">(no version)</code>
            <span class="rp-flag-desc">Auto-detects latest local semver tag</span>
          </div>
        </div>

      </div>
    </div>

    <!-- ══ HOW IT WORKS ══ -->
    <div class="rp-how-wrap">
      <div class="rp-how">
        <div class="rp-how-head">How publishing works</div>
        <div class="rp-how-grid">
          <div class="rp-how-card">
            <div class="rp-how-num">1</div>
            <div class="rp-how-h">Local git check</div>
            <div class="rp-how-p">vix verifies the working tree is clean, the tag exists locally and on origin, and reads your <code>vix.json</code>.</div>
          </div>
          <div class="rp-how-card">
            <div class="rp-how-num">2</div>
            <div class="rp-how-h">Registry entry written</div>
            <div class="rp-how-p">vix writes or updates the package entry in the local registry clone at <code>~/.vix/registry/index</code>.</div>
          </div>
          <div class="rp-how-card">
            <div class="rp-how-num">3</div>
            <div class="rp-how-h">Branch + PR created</div>
            <div class="rp-how-p">A branch is pushed to <code>vixcpp/registry</code>. If <code>gh</code> is authenticated, the PR is auto-created.</div>
          </div>
          <div class="rp-how-card">
            <div class="rp-how-num">4</div>
            <div class="rp-how-h">Live after merge</div>
            <div class="rp-how-p">Once the PR merges, the package appears in <code>vix search</code> and on the registry website.</div>
          </div>
        </div>
      </div>
    </div>

    <!-- ══ FOOTER CTA ══ -->
    <div class="rp-footer-wrap">
      <div class="rp-footer">
        <div>
          <div class="rp-footer-h">Publishing is intentionally CLI-only</div>
          <div class="rp-footer-p">The registry website is for discovery. Publishing is done locally — fast, reliable, and versioned through git.</div>
        </div>
        <RouterLink class="rp-btn rp-btn--primary" to="/browse">Browse packages</RouterLink>
      </div>
    </div>

  </div>
</template>

<style scoped>
/* ── Base — même fond que RegistryBrowse ── */
.rp {
  min-height: 100vh;
  background: #0e0e10;
  color: rgba(240,240,242,.92);
  font-family: system-ui,-apple-system,sans-serif;
  -webkit-font-smoothing: antialiased;
  display: flex; flex-direction: column;
}

/* ══ TOPBAR — copie exacte RegistryBrowse ══ */
.rp-topbar {
  position: sticky; top: 0; z-index: 40;
  background: rgba(14,14,16,.9);
  backdrop-filter: blur(14px);
  border-bottom: 1px solid rgba(255,255,255,.07);
}

.rp-topbar-inner {
  max-width: 1280px; margin: 0 auto; padding: 0 1.5rem;
  height: 52px;
  display: grid; grid-template-columns: 180px 1fr auto;
  gap: 16px; align-items: center;
}

.rp-brand { display: inline-flex; align-items: center; gap: 7px; text-decoration: none; }
.rp-brand-mark { width: 22px; height: 22px; }
.rp-brand-name { font-size: .95rem; font-weight: 800; color: #22c55e; letter-spacing: -.3px; }
.rp-brand-dim  { font-size: .88rem; font-weight: 400; color: rgba(255,255,255,.28); }

.rp-crumbs { display: flex; align-items: center; gap: 8px; min-width: 0; }
.rp-crumb {
  font-size: .82rem; font-weight: 600;
  color: rgba(240,240,242,.42); text-decoration: none;
  transition: color .13s;
}
.rp-crumb:hover { color: rgba(240,240,242,.85); }
.rp-crumb--active { color: rgba(240,240,242,.80); font-weight: 700; cursor: default; }
.rp-crumb-sep { color: rgba(240,240,242,.22); font-size: .75rem; }

.rp-topbar-right { display: flex; align-items: center; gap: 10px; flex-shrink: 0; }

.rp-docs-link {
  font-size: .82rem; font-weight: 600;
  color: rgba(240,240,242,.55); text-decoration: none;
  transition: color .13s;
}
.rp-docs-link:hover { color: rgba(240,240,242,.88); }

/* vix publish pill — légèrement différent du btn principal */
.rp-cmd-pill {
  display: inline-flex; align-items: center;
  padding: 5px 12px; border-radius: 999px;
  font-size: .78rem; font-weight: 700;
  font-family: "JetBrains Mono",ui-monospace,monospace;
  background: rgba(34,197,94,.1); color: #4ade80;
  border: 1px solid rgba(34,197,94,.22);
  text-decoration: none; flex-shrink: 0;
  transition: background .13s;
}
.rp-cmd-pill:hover { background: rgba(34,197,94,.16); }

/* ── Layout ── */
.rp-layout {
  max-width: 1280px; margin: 0 auto;
  padding: 32px 1.5rem 0;
  display: grid; grid-template-columns: minmax(0,1fr) 480px;
  gap: 28px; align-items: start; flex: 1;
}

/* ── Hero (left) ── */
.rp-kicker {
  font-size: .68rem; font-weight: 700;
  letter-spacing: .10em; text-transform: uppercase;
  color: #4ade80; margin-bottom: 14px;
}

.rp-h1 {
  margin: 0 0 16px;
  font-size: clamp(1.7rem, 3vw, 2.6rem);
  line-height: 1.06; letter-spacing: -0.03em; font-weight: 900;
  color: rgba(240,240,242,.96);
}
.rp-br { display: block; }

.rp-lead {
  margin: 0 0 22px;
  font-size: .9rem; line-height: 1.7;
  color: rgba(240,240,242,.55); max-width: 52ch;
}

.rp-code {
  font-family: "JetBrains Mono",ui-monospace,monospace;
  font-size: .82em; font-weight: 700;
  color: rgba(240,240,242,.88);
  background: rgba(255,255,255,.07);
  padding: 1px 6px; border-radius: 5px;
  border: 1px solid rgba(255,255,255,.08);
}

/* Steps */
.rp-steps { list-style: none; margin: 0 0 22px; padding: 0; display: grid; gap: 10px; }

.rp-step {
  display: flex; align-items: center; gap: 12px;
  padding: 12px 14px;
  border-radius: 10px;
  border: 1px solid rgba(255,255,255,.07);
  background: rgba(255,255,255,.025);
  transition: border-color .12s;
}
.rp-step:hover { border-color: rgba(34,197,94,.20); }

.rp-step-num {
  width: 28px; height: 28px; border-radius: 999px;
  display: grid; place-items: center; flex-shrink: 0;
  font-weight: 800; font-size: .8rem;
  color: #4ade80; background: rgba(34,197,94,.10);
  border: 1px solid rgba(34,197,94,.22);
}

.rp-step-body { min-width: 0; }
.rp-step-t { font-size: .875rem; font-weight: 700; color: rgba(240,240,242,.92); }
.rp-step-s { margin-top: 2px; font-size: .8rem; font-weight: 500; color: rgba(240,240,242,.45); line-height: 1.5; }

/* CTA */
.rp-cta { display: flex; gap: 10px; flex-wrap: wrap; margin-bottom: 18px; }

.rp-btn {
  display: inline-flex; align-items: center; justify-content: center;
  padding: 8px 16px; border-radius: 7px;
  font-size: .82rem; font-weight: 600;
  border: 1px solid rgba(255,255,255,.1); background: rgba(255,255,255,.05);
  color: rgba(240,240,242,.8); text-decoration: none;
  transition: background .13s, border-color .13s, transform .1s;
}
.rp-btn:hover { background: rgba(255,255,255,.08); border-color: rgba(255,255,255,.14); }

.rp-btn--primary {
  background: #22c55e; border-color: #22c55e; color: #052e16;
}
.rp-btn--primary:hover { background: #4ade80; border-color: #4ade80; transform: translateY(-1px); }

.rp-note {
  font-size: .78rem; line-height: 1.6; color: rgba(240,240,242,.35);
  border-top: 1px solid rgba(255,255,255,.06); padding-top: 14px;
}
.rp-note strong { color: rgba(240,240,242,.65); font-weight: 700; }

/* ── Side (right) ── */
.rp-side { display: flex; flex-direction: column; gap: 12px; min-width: 0; }

/* Terminal */
.rp-terminal {
  border: 1px solid rgba(255,255,255,.08);
  background: rgba(0,0,0,.35);
  border-radius: 10px; overflow: hidden;
}

.rp-term-top {
  display: flex; align-items: center; gap: 7px;
  padding: 10px 12px;
  border-bottom: 1px solid rgba(255,255,255,.07);
  background: rgba(0,0,0,.20);
}

.rp-dot { width: 10px; height: 10px; border-radius: 50%; }
.rp-dot--r { background: rgba(255,120,120,.65); }
.rp-dot--y { background: rgba(255,210,100,.65); }
.rp-dot--g { background: rgba(34,197,94,.65); }

.rp-term-title { margin-left: 6px; font-size: .75rem; font-weight: 700; color: rgba(240,240,242,.35); }
.rp-term-hint  { margin-left: auto; font-size: .72rem; font-weight: 600; color: rgba(240,240,242,.22); font-family: "JetBrains Mono",ui-monospace,monospace; }

.rp-term {
  margin: 0; padding: 14px 14px 16px;
  overflow: auto; white-space: pre;
  font-size: .8rem; line-height: 1.65;
  font-family: "JetBrains Mono",ui-monospace,monospace;
  color: rgba(220,230,245,.82);
  scrollbar-width: thin; scrollbar-color: rgba(34,197,94,.25) transparent;
}
.rp-term::-webkit-scrollbar { height: 5px; }
.rp-term::-webkit-scrollbar-thumb { background: rgba(34,197,94,.28); border-radius: 999px; }

.rp-c  { color: rgba(240,240,242,.28); }
.rp-ok { color: #4ade80; }

/* After */
.rp-after {
  border: 1px solid rgba(255,255,255,.07);
  background: rgba(255,255,255,.025);
  border-radius: 10px; padding: 14px;
  display: flex; flex-direction: column; gap: 10px;
}

.rp-after-title { font-size: .78rem; font-weight: 700; color: rgba(240,240,242,.55); text-transform: uppercase; letter-spacing: .06em; }

.rp-after-row {
  display: flex; align-items: baseline;
  justify-content: space-between; gap: 12px; font-size: .8rem;
}
.rp-after-k   { color: rgba(240,240,242,.35); font-weight: 600; flex-shrink: 0; }
.rp-after-v   { font-family: "JetBrains Mono",ui-monospace,monospace; font-size: .75rem; font-weight: 700; color: rgba(220,240,255,.80); }
.rp-after-dim { font-size: .75rem; color: rgba(240,240,242,.28); }

/* Flags */
.rp-flags {
  border: 1px solid rgba(255,255,255,.07);
  background: rgba(255,255,255,.025);
  border-radius: 10px; padding: 14px;
  display: flex; flex-direction: column; gap: 9px;
}

.rp-flags-title { font-size: .78rem; font-weight: 700; color: rgba(240,240,242,.55); text-transform: uppercase; letter-spacing: .06em; margin-bottom: 2px; }

.rp-flag-row { display: flex; align-items: baseline; gap: 10px; font-size: .8rem; }

.rp-flag {
  font-family: "JetBrains Mono",ui-monospace,monospace;
  font-size: .72rem; font-weight: 700;
  color: #4ade80;
  background: rgba(34,197,94,.08);
  border: 1px solid rgba(34,197,94,.18);
  padding: 2px 8px; border-radius: 6px;
  white-space: nowrap; flex-shrink: 0;
}
.rp-flag-desc { color: rgba(240,240,242,.40); font-size: .78rem; line-height: 1.4; }

/* ── How it works ── */
.rp-how-wrap {
  max-width: 1280px; margin: 28px auto 0;
  padding: 0 1.5rem;
}

.rp-how {
  border: 1px solid rgba(255,255,255,.07);
  background: rgba(255,255,255,.025);
  border-radius: 12px; padding: 18px;
}

.rp-how-head {
  font-size: .82rem; font-weight: 700;
  color: rgba(240,240,242,.55); text-transform: uppercase; letter-spacing: .06em;
  margin-bottom: 14px;
}

.rp-how-grid {
  display: grid; grid-template-columns: repeat(4, minmax(0,1fr)); gap: 12px;
}

.rp-how-card {
  padding: 14px; border-radius: 8px;
  border: 1px solid rgba(255,255,255,.06);
  background: rgba(0,0,0,.18);
}

.rp-how-num {
  width: 24px; height: 24px; border-radius: 999px;
  display: grid; place-items: center;
  font-size: .72rem; font-weight: 800;
  color: #4ade80; background: rgba(34,197,94,.10);
  border: 1px solid rgba(34,197,94,.20);
  margin-bottom: 10px;
}

.rp-how-h { font-size: .82rem; font-weight: 700; color: rgba(240,240,242,.88); margin-bottom: 6px; }
.rp-how-p { font-size: .75rem; line-height: 1.6; color: rgba(240,240,242,.42); }
.rp-how-p code {
  font-family: "JetBrains Mono",ui-monospace,monospace;
  font-size: .88em; color: rgba(220,240,255,.65);
  background: rgba(255,255,255,.06); padding: 1px 5px; border-radius: 4px;
}

/* ── Footer CTA ── */
.rp-footer-wrap {
  max-width: 1280px; margin: 20px auto 40px;
  padding: 0 1.5rem;
}

.rp-footer {
  border: 1px solid rgba(255,255,255,.07);
  background: rgba(255,255,255,.025);
  border-radius: 12px; padding: 18px 20px;
  display: flex; align-items: center;
  justify-content: space-between; gap: 20px;
  flex-wrap: wrap;
}

.rp-footer-h { font-size: .9rem; font-weight: 700; color: rgba(240,240,242,.85); margin-bottom: 5px; }
.rp-footer-p { font-size: .8rem; line-height: 1.6; color: rgba(240,240,242,.42); max-width: 54ch; }

/* ── Responsive ── */
@media (max-width: 1060px) {
  .rp-layout { grid-template-columns: 1fr; }
  .rp-how-grid { grid-template-columns: repeat(2, minmax(0,1fr)); }
  .rp-br { display: none; }
}

@media (max-width: 640px) {
  .rp-topbar-inner { grid-template-columns: auto 1fr; height: auto; padding: 8px 1rem; gap: 8px; }
  .rp-crumbs { grid-column: 1 / -1; order: 2; }
  .rp-topbar-right { justify-content: flex-start; }
  .rp-layout { padding: 20px 1rem 0; }
  .rp-how-wrap, .rp-footer-wrap { padding: 0 1rem; }
  .rp-how-grid { grid-template-columns: 1fr; }
  .rp-footer { flex-direction: column; align-items: flex-start; }
  .rp-term { font-size: .75rem; }
  .rp-h1 { font-size: 1.5rem; }
}
</style>
