<script setup>
import PrivatePackagesNotice from "@/components/PrivatePackagesNotice.vue";
import RegistryCopyBlock from "@/components/RegistryCopyBlock.vue";
import RegistryPageHeader from "@/components/RegistryPageHeader.vue";

const manifest = `{
  "name": "string-kit",
  "namespace": "example",
  "version": "0.1.0",
  "type": "header-only",
  "include": "include",
  "deps": [],
  "license": "MIT",
  "description": "Small string utilities for modern C++ projects.",
  "keywords": ["cpp", "strings", "vix"],
  "repository": "https://github.com/example/string-kit",
  "authors": [
    {
      "name": "Package Author",
      "github": "example"
    }
  ]
}`;

const terminal = `# Build and test the package
vix build
vix tests

# Create the release tag declared in vix.json
git tag -a v0.1.0 -m "v0.1.0"
git push origin v0.1.0

# Validate, then publish to the public registry
vix publish 0.1.0 --dry-run
vix publish 0.1.0 --notes "Initial release"`;

const rules = [
  ["Identity", "namespace and name must use the supported package naming format."],
  ["Version", "The manifest version must be valid semantic versioning and match the selected Git tag."],
  ["Repository", "The manifest repository must match the Git origin, and the release tag must exist locally and on origin."],
  ["Metadata", "type, license, description, repository, and at least one author are required."],
  ["Description", "The public description must contain at least eight characters."],
  ["Sources", "The tagged source must contain vix.json and use safe, repository-relative include roots."],
  ["Working tree", "Publication requires a Git repository with no uncommitted changes."],
  ["Namespace rights", "The registry contribution must be accepted for the package namespace before it becomes public."],
];

const steps = [
  ["Prepare the manifest", "Add a valid vix.json at the repository root. Its version and repository are treated as release metadata."],
  ["Build and test", "Run the project locally with Vix so the tagged source represents a working package."],
  ["Commit the release", "Commit the manifest and package changes. The working tree must be clean before publication."],
  ["Tag the exact version", "Create and push the semantic version tag. The tag must contain the same vix.json version."],
  ["Validate locally", "Use --dry-run to execute publication checks without preparing or pushing a registry contribution."],
  ["Publish", "Run vix publish. Vix prepares the public registry entry and contribution workflow from the tagged repository."],
];
</script>

<template>
  <div class="publish-page registry-container">
    <RegistryPageHeader eyebrow="Vix Registry" title="Publish a public package" description="Prepare a versioned C++ package in its repository and publish it to Vix Registry with the Vix CLI.">
      <a class="registry-button registry-button--primary" href="https://docs.vixcpp.com/registry/publish" target="_blank" rel="noreferrer">Publication docs</a>
      <RouterLink class="registry-button registry-button--secondary" to="/browse">Browse packages</RouterLink>
    </RegistryPageHeader>

    <div class="publish-intro">
      <div><span>Public registry</span><p>Publishing happens from a versioned Git repository. This website does not upload package files or replace the CLI validation workflow.</p></div>
      <code>vix publish</code>
    </div>

    <section class="publish-section workflow-section">
      <div class="section-heading"><span>Release workflow</span><h2>From repository to registry</h2><p>These steps reflect the validations performed by the Vix CLI. A GitHub release is optional; the pushed Git tag is the required release source.</p></div>
      <ol class="workflow-list"><li v-for="(step, index) in steps" :key="step[0]"><span>{{ String(index + 1).padStart(2, "0") }}</span><div><h3>{{ step[0] }}</h3><p>{{ step[1] }}</p></div></li></ol>
    </section>

    <section class="publish-section manifest-section">
      <div class="section-heading"><span>Package metadata</span><h2>Minimal vix.json</h2><p>This generic example uses fields accepted by the current CLI for a public header-only package.</p></div>
      <RegistryCopyBlock :value="manifest" label="vix.json" language="json" />
    </section>

    <section class="publish-section commands-section">
      <div class="section-heading"><span>Terminal workflow</span><h2>Validate before publishing</h2><p><code>vix publish</code> can infer the latest local semantic version tag when no version is passed. An explicit version keeps the release operation easy to audit.</p></div>
      <RegistryCopyBlock :value="terminal" label="Release commands" />
      <div class="flag-list" aria-label="Publication flags">
        <div><code>--dry-run</code><span>Run validation without publishing.</span></div>
        <div><code>--notes "..."</code><span>Attach release notes to the registry contribution.</span></div>
        <div><code>--verbose</code><span>Show detailed publication diagnostics.</span></div>
        <div><code>--cleanup</code><span>Remove older local publication branches.</span></div>
      </div>
    </section>

    <section class="publish-section rules-section">
      <div class="section-heading"><span>CLI validation</span><h2>Publication rules</h2><p>Vix rejects incomplete metadata and release state before preparing the public registry entry.</p></div>
      <dl class="rules-grid"><div v-for="rule in rules" :key="rule[0]"><dt>{{ rule[0] }}</dt><dd>{{ rule[1] }}</dd></div></dl>
      <aside class="github-note"><strong>GitHub CLI is optional.</strong><p>When <code>gh</code> is authenticated, Vix can automate the registry pull request. Public package publication itself does not require <code>vix login</code>; that command authenticates Softadastra Cloud workflows.</p></aside>
    </section>

    <PrivatePackagesNotice title="Publishing a private package?">
      Vix Registry is for public packages. Private package versions are published and managed through Softadastra Cloud with <code>vix login</code> and <code>vix publish --cloud</code>, alongside workspace permissions, access tokens, lockfiles, and team controls.
    </PrivatePackagesNotice>
  </div>
</template>

<style scoped>
.publish-page { padding-top: 42px; padding-bottom: 72px; }
.publish-intro { display: flex; justify-content: space-between; align-items: center; gap: 30px; margin-bottom: 54px; padding: 18px 20px; border-block: 1px solid var(--line); }
.publish-intro span { display: block; margin-bottom: 6px; color: var(--green-soft); font: .64rem var(--font-mono); text-transform: uppercase; }
.publish-intro p { max-width: 760px; color: var(--text-muted); font-size: .8rem; line-height: 1.55; }
.publish-intro > code { flex-shrink: 0; color: var(--green-bright); font: 650 .82rem var(--font-mono); }
.publish-section { display: grid; grid-template-columns: minmax(210px, .42fr) minmax(0, 1fr); gap: 52px; padding: 0 0 64px; }
.section-heading { align-self: start; position: sticky; top: 96px; }
.section-heading > span { color: var(--green-soft); font: .64rem var(--font-mono); text-transform: uppercase; }
.section-heading h2 { margin-top: 7px; color: var(--text); font: 650 1.3rem var(--font-display); }
.section-heading p { margin-top: 10px; color: var(--text-muted); font-size: .78rem; line-height: 1.65; }
.section-heading code, .github-note code, .private-notice code { color: var(--text); font-family: var(--font-mono); }
.workflow-list { border-top: 1px solid var(--line); list-style: none; }
.workflow-list li { display: grid; grid-template-columns: 44px minmax(0, 1fr); gap: 16px; padding: 19px 4px; border-bottom: 1px solid var(--line); }
.workflow-list li > span { color: var(--green-soft); font: .68rem var(--font-mono); }
.workflow-list h3 { color: var(--text); font-size: .88rem; }
.workflow-list p { margin-top: 6px; color: var(--text-muted); font-size: .78rem; line-height: 1.6; }
.flag-list { display: grid; grid-template-columns: 1fr 1fr; margin-top: 16px; border: 1px solid var(--line); border-radius: var(--radius-md); overflow: hidden; }
.flag-list > div { display: grid; gap: 6px; padding: 15px; border-right: 1px solid var(--line); border-bottom: 1px solid var(--line); }
.flag-list > div:nth-child(2n) { border-right: 0; }
.flag-list > div:nth-last-child(-n+2) { border-bottom: 0; }
.flag-list code { color: var(--green-soft); font: .7rem var(--font-mono); }
.flag-list span { color: var(--text-muted); font-size: .72rem; }
.rules-section { grid-template-columns: minmax(210px, .42fr) minmax(0, 1fr); }
.rules-grid { display: grid; grid-template-columns: 1fr 1fr; border: 1px solid var(--line); border-radius: var(--radius-md); overflow: hidden; }
.rules-grid > div { padding: 17px; border-right: 1px solid var(--line); border-bottom: 1px solid var(--line); }
.rules-grid > div:nth-child(2n) { border-right: 0; }
.rules-grid > div:nth-last-child(-n+2) { border-bottom: 0; }
.rules-grid dt { color: var(--text); font-size: .78rem; font-weight: 650; }
.rules-grid dd { margin-top: 6px; color: var(--text-muted); font-size: .72rem; line-height: 1.55; }
.github-note { grid-column: 2; margin-top: -42px; padding: 17px; border-left: 2px solid var(--green-line); background: var(--bg-soft); }
.github-note strong { color: var(--text); font-size: .78rem; }
.github-note p { margin-top: 6px; color: var(--text-muted); font-size: .74rem; line-height: 1.6; }
@media (max-width: 820px) { .publish-section { grid-template-columns: 1fr; gap: 20px; padding-bottom: 52px; } .section-heading { position: static; } .github-note { grid-column: 1; margin-top: -30px; } }
@media (max-width: 580px) { .publish-page { padding-top: 28px; } .publish-intro { align-items: start; flex-direction: column; margin-bottom: 42px; } .flag-list, .rules-grid { grid-template-columns: 1fr; } .flag-list > div, .rules-grid > div { border-right: 0; border-bottom: 1px solid var(--line); } .flag-list > div:nth-last-child(-n+2), .rules-grid > div:nth-last-child(-n+2) { border-bottom: 1px solid var(--line); } .flag-list > div:last-child, .rules-grid > div:last-child { border-bottom: 0; } }
</style>
