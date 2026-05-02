<script setup>
import { RouterLink } from "vue-router";
</script>

<template>
  <section class="page">
    <!-- Top bar -->
    <header class="topbar">
      <div class="topbar-inner">
        <RouterLink class="brand" to="/browse" aria-label="Back to registry browse">
          <span class="brand-dot" aria-hidden="true"></span>
          <span class="brand-text">Registry</span>
        </RouterLink>

        <div class="crumbs" aria-label="Breadcrumb">
          <RouterLink class="crumb" to="/browse">Browse</RouterLink>
          <span class="sep">/</span>
          <span class="here">Publish</span>
        </div>

        <nav class="nav">
          <a class="nav-link" href="https://docs.vixcpp.com/registry/publish" target="_self" rel="noreferrer">Docs</a>
          <a class="nav-link pill" href="https://docs.vixcpp.com/modules/cli/publish" target="_self" rel="noreferrer">vix publish</a>
        </nav>
      </div>
    </header>

    <div class="wrap">
      <!-- Hero -->
      <div class="hero">
        <!-- Left: steps -->
        <div class="hero-left">
          <div class="kicker">CLI-only · local workflow</div>

          <h1 class="h1">Publish a C++ library in minutes</h1>

          <p class="p">
            Create a library with <span class="mono">vix new</span>.
            The project is already configured.
            When your code is ready, tag a version and publish directly from your terminal.
          </p>

          <div class="steps" role="list" aria-label="Publish steps">
            <div class="step" role="listitem">
              <div class="num">1</div>
              <div class="txt">
                <div class="t">Create</div>
                <div class="s">Generate a header-only library template with <span class="mono-sm">vix new --lib</span>.</div>
              </div>
            </div>

            <div class="step" role="listitem">
              <div class="num">2</div>
              <div class="txt">
                <div class="t">Test</div>
                <div class="s">Run tests locally with <span class="mono-sm">vix tests</span> and iterate.</div>
              </div>
            </div>

            <div class="step" role="listitem">
              <div class="num">3</div>
              <div class="txt">
                <div class="t">Tag + Publish</div>
                <div class="s">Push a git tag, then run <span class="mono-sm">vix publish</span> — one command.</div>
              </div>
            </div>
          </div>

          <div class="cta">
            <a class="btn primary" href="https://docs.vixcpp.com/registry/publish" target="_self" rel="noreferrer">
              Publish docs
            </a>
            <RouterLink class="btn" to="/browse">Browse packages</RouterLink>
          </div>

          <div class="note">
            Requirement: your repository must be <span class="em">open source</span> and tagged on origin.
          </div>
        </div>

        <!-- Right: terminal + mini info -->
        <div class="hero-right">
          <div class="terminal" role="region" aria-label="CLI publish example">
            <div class="term-top">
              <span class="dot r" aria-hidden="true"></span>
              <span class="dot y" aria-hidden="true"></span>
              <span class="dot g" aria-hidden="true"></span>
              <span class="term-title">Terminal</span>
              <span class="term-hint">vix publish</span>
            </div>

            <pre class="term"><code><span class="c"># 1. Create a C++ library (already configured)</span>
vix new tree --lib
cd tree

<span class="c"># 2. Run tests</span>
vix tests

<span class="c"># 3. Tag a version and push it</span>
git tag -a v0.1.0 -m "v0.1.0"
git push origin v0.1.0

<span class="c"># 4. Publish to the registry</span>
vix publish 0.1.0 --notes "Initial release"

<span class="ok">✓  PR created for: namespace/tree v0.1.0</span>
<span class="ok">✓  registry will reflect this version after the PR merges</span></code></pre>
          </div>

          <!-- What happens after -->
          <div class="after">
            <div class="after-title">After publishing</div>
            <div class="after-row">
              <span class="after-k">Search</span>
              <code class="after-v">vix search tree</code>
            </div>
            <div class="after-row">
              <span class="after-k">Install</span>
              <code class="after-v">vix add namespace/tree</code>
            </div>
            <div class="after-row">
              <span class="after-k">Browse</span>
              <span class="after-v dim">registry.vixcpp.com/@namespace/tree</span>
            </div>
          </div>

          <!-- Options strip -->
          <div class="opts">
            <div class="opts-title">Common flags</div>
            <div class="opts-grid">
              <div class="opt">
                <code class="flag">--notes "..."</code>
                <span class="opt-desc">Attach release notes to the PR</span>
              </div>
              <div class="opt">
                <code class="flag">--dry-run</code>
                <span class="opt-desc">Validate without pushing anything</span>
              </div>
              <div class="opt">
                <code class="flag">--cleanup</code>
                <span class="opt-desc">Remove older local publish branches</span>
              </div>
              <div class="opt">
                <code class="flag">(no version)</code>
                <span class="opt-desc">Auto-detects latest local semver tag</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- How it works -->
      <div class="how">
        <div class="how-title">How publishing works</div>
        <div class="how-grid">
          <div class="how-card">
            <div class="how-num">1</div>
            <div class="how-body">
              <div class="how-h">Local git check</div>
              <div class="how-p">vix verifies the working tree is clean, the tag exists locally and on origin, and reads your <code>vix.json</code>.</div>
            </div>
          </div>
          <div class="how-card">
            <div class="how-num">2</div>
            <div class="how-body">
              <div class="how-h">Registry entry written</div>
              <div class="how-p">vix writes or updates the package entry in the local registry clone at <code>~/.vix/registry/index</code>.</div>
            </div>
          </div>
          <div class="how-card">
            <div class="how-num">3</div>
            <div class="how-body">
              <div class="how-h">Branch + PR created</div>
              <div class="how-p">A branch is pushed to <code>vixcpp/registry</code>. If <code>gh</code> is authenticated, the PR is auto-created.</div>
            </div>
          </div>
          <div class="how-card">
            <div class="how-num">4</div>
            <div class="how-body">
              <div class="how-h">Live after merge</div>
              <div class="how-p">Once the PR merges, the package appears in <code>vix search</code> and on the registry website.</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Bottom CTA -->
      <div class="footer">
        <div class="foot-left">
          <div class="foot-title">Publishing is intentionally CLI-only</div>
          <div class="foot-sub">
            The registry website is for discovery.
            Publishing is done locally — fast, reliable, and fully versioned through git.
          </div>
        </div>
        <RouterLink class="btn primary" to="/browse">Browse packages</RouterLink>
      </div>
    </div>
  </section>
</template>

<style scoped>
.page {
  --max:    1160px;
  --pad:    20px;
  --text:   rgba(255, 255, 255, 0.92);
  --muted:  rgba(255, 255, 255, 0.62);
  --border: rgba(255, 255, 255, 0.10);
  --bg-card:rgba(255, 255, 255, 0.03);
  --accent: #22c55e;
  min-height: 100vh;
  color: var(--text);
}

/* ── Topbar ── */
.topbar {
  position: sticky;
  top: 0;
  z-index: 30;
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  background: rgba(13, 17, 23, 0.88);
  border-bottom: 1px solid var(--border);
}

.topbar-inner {
  max-width: var(--max);
  margin: 0 auto;
  padding: 12px var(--pad);
  display: grid;
  grid-template-columns: 180px minmax(0, 1fr) auto;
  gap: 12px;
  align-items: center;
}

.brand {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  text-decoration: none;
  color: var(--text);
  font-weight: 950;
}

.brand-dot {
  width: 12px;
  height: 12px;
  border-radius: 999px;
  background: var(--accent);
  box-shadow: 0 0 0 3px rgba(34, 197, 94, 0.18);
}

.brand-text { font-size: 14px; }

.crumbs {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: var(--muted);
  font-size: 13px;
  font-weight: 900;
}

.crumb { color: rgba(255,255,255,.70); text-decoration: none; }
.crumb:hover { color: var(--text); }
.sep   { opacity: .55; }
.here  { color: var(--text); }

.nav   { display: inline-flex; align-items: center; gap: 10px; }
.nav-link { text-decoration: none; color: var(--muted); font-size: 13px; font-weight: 900; }
.nav-link:hover { color: var(--text); }

.pill {
  padding: 6px 10px;
  border-radius: 999px;
  border: 1px solid var(--border);
  background: var(--bg-card);
}

/* ── Wrap ── */
.wrap {
  max-width: var(--max);
  margin: 0 auto;
  padding: 20px var(--pad) 48px;
}

/* ── Hero ── */
.hero {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 500px);
  gap: 16px;
  align-items: start;
  margin-top: 12px;
}

/* Left panel */
.hero-left {
  border: 1px solid var(--border);
  background: var(--bg-card);
  border-radius: 14px;
  padding: 18px;
  display: flex;
  flex-direction: column;
  gap: 0;
}

.kicker {
  font-size: 11.5px;
  font-weight: 950;
  letter-spacing: .10em;
  text-transform: uppercase;
  color: var(--accent);
}

.h1 {
  margin: 10px 0 0;
  font-size: 22px;
  font-weight: 950;
  letter-spacing: -0.01em;
  color: var(--text);
}

.p {
  margin: 10px 0 0;
  color: var(--muted);
  font-size: 14px;
  font-weight: 800;
  line-height: 1.65;
}

.mono    { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-weight: 900; color: var(--text); }
.mono-sm { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-weight: 900; font-size: 12.5px; color: rgba(255,255,255,.88); }

/* Steps */
.steps {
  margin-top: 14px;
  display: grid;
  gap: 10px;
}

.step {
  display: flex;
  gap: 12px;
  align-items: center;
  padding: 10px 12px;
  border-radius: 12px;
  border: 1px solid var(--border);
  background: rgba(0, 0, 0, 0.14);
}

.num {
  width: 28px;
  height: 28px;
  border-radius: 999px;
  display: grid;
  place-items: center;
  font-weight: 950;
  font-size: 13px;
  color: var(--accent);
  background: rgba(34, 197, 94, 0.10);
  border: 1px solid rgba(34, 197, 94, 0.25);
  flex: 0 0 auto;
}

.txt { min-width: 0; }
.t { font-size: 13px; font-weight: 950; color: var(--text); }
.s { margin-top: 2px; font-size: 12.5px; font-weight: 850; color: var(--muted); line-height: 1.45; }

/* CTAs */
.cta { display: flex; gap: 10px; flex-wrap: wrap; margin-top: 16px; }

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 9px 14px;
  border-radius: 12px;
  border: 1px solid var(--border);
  background: var(--bg-card);
  color: rgba(255,255,255,.86);
  font-size: 13px;
  font-weight: 950;
  text-decoration: none;
  transition: background 0.15s, border-color 0.15s;
}
.btn:hover { background: rgba(255,255,255,.06); border-color: rgba(255,255,255,.16); }

.primary {
  border-color: rgba(34, 197, 94, 0.30);
  background: rgba(34, 197, 94, 0.10);
  color: rgba(200,255,220,.98);
}
.primary:hover { background: rgba(34, 197, 94, 0.16); border-color: rgba(34,197,94,.50); }

.note {
  margin-top: 14px;
  font-size: 12.5px;
  font-weight: 850;
  color: var(--muted);
  border-top: 1px solid var(--border);
  padding-top: 12px;
}
.em { color: var(--text); font-weight: 950; }

/* ── Right panel ── */
.hero-right { display: grid; gap: 12px; min-width: 0; }

/* Terminal */
.terminal {
  border: 1px solid var(--border);
  background: rgba(0, 0, 0, 0.40);
  border-radius: 14px;
  overflow: hidden;
}

.term-top {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  border-bottom: 1px solid var(--border);
  background: rgba(0, 0, 0, 0.20);
}

.dot { width: 10px; height: 10px; border-radius: 999px; }
.dot.r { background: rgba(255,120,120,.70); }
.dot.y { background: rgba(255,210,120,.70); }
.dot.g { background: rgba(34,197,94,.70); }

.term-title { margin-left: 6px; font-size: 12px; font-weight: 950; color: var(--muted); }
.term-hint  { margin-left: auto; font-size: 11.5px; font-weight: 900; color: rgba(255,255,255,.45); }

.term {
  margin: 0;
  padding: 14px 14px 16px;
  overflow: auto;
  white-space: pre;
  font-size: 12.5px;
  line-height: 1.65;
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  color: rgba(230,245,255,.90);
  scrollbar-width: thin;
  scrollbar-color: rgba(34,197,94,.35) transparent;
}
.term::-webkit-scrollbar { height: 6px; }
.term::-webkit-scrollbar-thumb { background: rgba(34,197,94,.35); border-radius: 999px; }

.term .c  { color: rgba(255,255,255,.38); }
.term .ok { color: var(--accent); }

/* After publishing */
.after {
  border: 1px solid var(--border);
  background: var(--bg-card);
  border-radius: 14px;
  padding: 14px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.after-title { font-size: 12.5px; font-weight: 950; color: rgba(255,255,255,.80); }

.after-row {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 12px;
  font-size: 12.5px;
}

.after-k  { color: var(--muted); font-weight: 850; flex-shrink: 0; }
.after-v  { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-weight: 900; color: rgba(255,255,255,.88); font-size: 12px; }
.after-v.dim { color: var(--muted); font-family: inherit; }

/* Options strip */
.opts {
  border: 1px solid var(--border);
  background: var(--bg-card);
  border-radius: 14px;
  padding: 14px;
}

.opts-title { font-size: 12.5px; font-weight: 950; color: rgba(255,255,255,.80); margin-bottom: 10px; }

.opts-grid { display: grid; gap: 8px; }

.opt {
  display: flex;
  align-items: baseline;
  gap: 10px;
  font-size: 12.5px;
}

.flag {
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 11.5px;
  font-weight: 900;
  color: var(--accent);
  background: rgba(34,197,94,.10);
  border: 1px solid rgba(34,197,94,.20);
  padding: 3px 8px;
  border-radius: 8px;
  white-space: nowrap;
  flex-shrink: 0;
}

.opt-desc { color: var(--muted); font-weight: 850; line-height: 1.4; }

/* ── How it works ── */
.how {
  margin-top: 16px;
  border: 1px solid var(--border);
  background: var(--bg-card);
  border-radius: 14px;
  padding: 16px;
}

.how-title {
  font-size: 13px;
  font-weight: 950;
  color: rgba(255,255,255,.88);
  margin-bottom: 14px;
}

.how-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
}

.how-card {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 12px 12px;
  border-radius: 12px;
  border: 1px solid var(--border);
  background: rgba(0,0,0,.12);
}

.how-num {
  font-size: 11px;
  font-weight: 950;
  letter-spacing: .06em;
  color: var(--accent);
  background: rgba(34,197,94,.10);
  border: 1px solid rgba(34,197,94,.20);
  width: 24px; height: 24px;
  border-radius: 999px;
  display: grid; place-items: center;
}

.how-h { font-size: 13px; font-weight: 950; color: var(--text); line-height: 1.3; }
.how-p { margin-top: 4px; font-size: 12px; font-weight: 850; color: var(--muted); line-height: 1.5; }
.how-p code { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 11px; color: rgba(255,255,255,.78); background: rgba(255,255,255,.07); padding: 1px 5px; border-radius: 5px; }

/* ── Bottom footer ── */
.footer {
  margin-top: 14px;
  border: 1px solid var(--border);
  background: var(--bg-card);
  border-radius: 14px;
  padding: 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.foot-title { font-size: 13.5px; font-weight: 950; color: var(--text); }
.foot-sub   { margin-top: 6px; font-size: 12.5px; font-weight: 850; color: var(--muted); line-height: 1.5; max-width: 54ch; }

/* ── Responsive ── */
@media (max-width: 1060px) {
  .hero { grid-template-columns: 1fr; }
  .how-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}

@media (max-width: 960px) {
  .topbar-inner { grid-template-columns: 1fr; }
  .nav { justify-content: flex-start; }
}

@media (max-width: 640px) {
  .wrap { padding: 14px 14px 34px; }
  .how-grid { grid-template-columns: 1fr; }
  .footer { flex-direction: column; align-items: flex-start; }
  .term { font-size: 12px; }
}
</style>
