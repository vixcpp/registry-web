<script setup>
import { computed, onMounted, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import RegistryPackageRow from "@/components/RegistryPackageRow.vue";
import RegistryPageHeader from "@/components/RegistryPageHeader.vue";
import RegistryState from "@/components/RegistryState.vue";
import { loadRegistryIndex } from "@/lib/loadRegistryIndex";

const route = useRoute();
const router = useRouter();
const loading = ref(true);
const error = ref("");
const entries = ref([]);
const pageSize = 30;
const page = computed(() => Math.max(1, Number(route.query.page || 1)));
const namespace = computed(() => String(route.params.namespace || "").trim());
const packages = computed(() => entries.value.filter((item) => String(item.namespace).toLowerCase() === namespace.value.toLowerCase()).sort((a, b) => a.name.localeCompare(b.name)));
const totalPages = computed(() => Math.max(1, Math.ceil(packages.value.length / pageSize)));
const visiblePackages = computed(() => packages.value.slice((page.value - 1) * pageSize, page.value * pageSize));
const pageButtons = computed(() => {
  const values = [1], start = Math.max(2, page.value - 2), end = Math.min(totalPages.value - 1, page.value + 2);
  if (start > 2) values.push("…");
  for (let value = start; value <= end; value += 1) values.push(value);
  if (end < totalPages.value - 1) values.push("…");
  if (totalPages.value > 1) values.push(totalPages.value);
  return values;
});

function setPage(value) {
  const next = Math.max(1, Math.min(Number(value), totalPages.value));
  router.push({ path: `/ns/${namespace.value}`, query: next > 1 ? { page: next } : {} });
}

async function load() {
  loading.value = true;
  error.value = "";
  try {
    const { data } = await loadRegistryIndex();
    entries.value = Array.isArray(data?.entries) ? data.entries : [];
    if (page.value > totalPages.value) setPage(totalPages.value);
  } catch {
    error.value = "The public registry could not be loaded.";
  } finally {
    loading.value = false;
  }
}

onMounted(load);
watch(() => route.params.namespace, load);
</script>

<template>
  <div class="namespace-page registry-container">
    <RegistryPageHeader eyebrow="Public namespace" :title="`Packages published by ${namespace}`" description="Public C++ packages published under this Vix Registry namespace.">
      <RouterLink class="registry-button registry-button--primary" to="/browse">Browse all packages</RouterLink>
      <RouterLink class="registry-button registry-button--secondary" to="/publish">Publish a package</RouterLink>
    </RegistryPageHeader>

    <section class="namespace-summary" aria-label="Namespace summary">
      <div><span>Namespace</span><strong>{{ namespace }}</strong></div>
      <div><span>Public packages</span><strong>{{ loading ? "-" : packages.length }}</strong></div>
    </section>

    <RegistryState v-if="loading" kind="loading" title="Loading namespace" message="Reading packages from the public registry." />
    <RegistryState v-else-if="error" kind="error" title="Namespace unavailable" :message="error"><button class="registry-button registry-button--secondary" type="button" @click="load">Try again</button></RegistryState>
    <RegistryState v-else-if="!packages.length" kind="empty" title="Namespace not found" :message="`No public packages are currently published under ${namespace}.`"><RouterLink class="registry-button registry-button--secondary" to="/browse">Browse packages</RouterLink></RegistryState>

    <template v-else>
      <div class="namespace-list registry-panel"><RegistryPackageRow v-for="pkg in visiblePackages" :key="`${pkg.namespace}/${pkg.name}`" :pkg="pkg" /></div>
      <nav v-if="totalPages > 1" class="pagination" aria-label="Namespace package pages">
        <button type="button" :disabled="page <= 1" @click="setPage(page - 1)">Previous</button>
        <template v-for="value in pageButtons" :key="value"><span v-if="value === '…'">…</span><button v-else type="button" :class="{ active: value === page }" :aria-current="value === page ? 'page' : undefined" @click="setPage(value)">{{ value }}</button></template>
        <button type="button" :disabled="page >= totalPages" @click="setPage(page + 1)">Next</button>
      </nav>
    </template>
  </div>
</template>

<style scoped>
.namespace-page { padding-top: 42px; padding-bottom: 72px; }
.namespace-summary { display: grid; grid-template-columns: minmax(0, 1fr) 180px; margin-bottom: 26px; border-block: 1px solid var(--line); }
.namespace-summary > div { min-width: 0; padding: 15px 18px; border-right: 1px solid var(--line); }
.namespace-summary > div:last-child { border-right: 0; }
.namespace-summary span { display: block; margin-bottom: 6px; color: var(--text-muted); font: .64rem var(--font-mono); text-transform: uppercase; }
.namespace-summary strong { color: var(--text); font: 650 .84rem var(--font-mono); overflow-wrap: anywhere; }
.namespace-list { overflow: hidden; }
.pagination { display: flex; justify-content: center; align-items: center; flex-wrap: wrap; gap: 6px; margin-top: 25px; }
.pagination button { min-width: 36px; height: 36px; padding: 0 11px; border: 1px solid var(--line); border-radius: var(--radius-sm); background: var(--bg-panel); color: var(--text-muted); font-size: .72rem; }
.pagination button:hover:not(:disabled), .pagination button.active { border-color: var(--green-line); color: var(--green-bright); background: var(--green-wash); }
.pagination button:disabled { opacity: .35; cursor: not-allowed; }
.pagination span { padding: 0 5px; color: var(--text-muted); }
@media (max-width: 560px) { .namespace-page { padding-top: 28px; } .namespace-summary { grid-template-columns: 1fr 115px; } .namespace-summary > div { padding: 13px; } .pagination button:first-child, .pagination button:last-child { width: 100%; } }
</style>
