/* =========================================================
   Vix Registry — Search Worker
   Supports: load, search, browse, getPackage, getNamespaceCounts
   ========================================================= */

let DATA = null;
let VERSION = "";

/* ── helpers ── */
function toLower(s) {
  return (s || "").toLowerCase();
}
function containsIcase(hay, q) {
  return !q || toLower(hay).includes(q);
}

function joinKeywords(e) {
  const kw = e?.keywords;
  return Array.isArray(kw)
    ? kw.filter((x) => typeof x === "string").join(" ")
    : "";
}

function parseTime(v) {
  if (!v) return 0;
  const t = new Date(v).getTime();
  return Number.isFinite(t) ? t : 0;
}

function latestVersion(e) {
  if (typeof e?.latest === "string" && e.latest) return e.latest;
  if (typeof e?.latestVersion === "string" && e.latestVersion)
    return e.latestVersion;
  const vs = e?.versions;
  if (!vs || typeof vs !== "object") return "";
  let best = "";
  for (const v of Object.keys(vs)) {
    if (!best || semverGt(v, best)) best = v;
  }
  return best;
}

function semverGt(a, b) {
  const pa = String(a || "")
    .split("-")[0]
    .split(".")
    .map((x) => parseInt(x, 10) || 0);
  const pb = String(b || "")
    .split("-")[0]
    .split(".")
    .map((x) => parseInt(x, 10) || 0);
  for (let i = 0; i < 3; i++) {
    const da = pa[i] ?? 0,
      db = pb[i] ?? 0;
    if (da !== db) return da > db;
  }
  return false;
}

function getRepoUrl(e) {
  if (e?.repo && typeof e.repo === "object") return e.repo.url || "";
  if (typeof e?.repo === "string") return e.repo;
  return "";
}

function getUpdatedAt(e) {
  return (
    e?.api?.updatedAt ||
    e?.api?.generatedAt ||
    e?.updatedAt ||
    e?.lastUpdatedAt ||
    ""
  );
}

/* ── scoring ── */
function scoreEntry(e, qLower) {
  if (!qLower) return 0;
  const ns = e?.namespace || "";
  const name = e?.name || "";
  const id = `${ns}/${name}`;
  let s = 0;
  if (containsIcase(id, qLower)) s += 100;
  if (containsIcase(name, qLower)) s += 60;
  if (containsIcase(ns, qLower)) s += 40;
  if (containsIcase(e?.displayName || "", qLower)) s += 25;
  if (containsIcase(e?.description || "", qLower)) s += 20;
  if (containsIcase(joinKeywords(e), qLower)) s += 15;
  return s;
}

/* ── hit builder ── */
function buildHit(e, score) {
  const ns = e?.namespace || "";
  const name = e?.name || "";
  return {
    id: `${ns}/${name}`,
    namespace: ns,
    name,
    displayName: e?.displayName || name,
    description: e?.description || "",
    repo: getRepoUrl(e),
    latest: latestVersion(e),
    license: e?.license || "MIT",
    score: Number(score) || 0,
    updatedAt: getUpdatedAt(e),
    createdAt: e?.createdAt || "",
  };
}

/* ── sort ── */
function sortHits(hits, mode) {
  if (mode === "latest") {
    hits.sort((a, b) => {
      const ta = parseTime(a.updatedAt),
        tb = parseTime(b.updatedAt);
      if (ta !== tb) return tb - ta;
      if (semverGt(a.latest, b.latest)) return -1;
      if (semverGt(b.latest, a.latest)) return 1;
      return a.id.localeCompare(b.id);
    });
  } else {
    hits.sort((a, b) => {
      if (a.score !== b.score) return b.score - a.score;
      const ta = parseTime(a.updatedAt),
        tb = parseTime(b.updatedAt);
      if (ta !== tb) return tb - ta;
      return a.id.localeCompare(b.id);
    });
  }
}

/* ── namespace filter ── */
function filterByNs(entries, ns) {
  if (!ns) return entries;
  const nsLow = ns.toLowerCase();
  return entries.filter((e) => (e?.namespace || "").toLowerCase() === nsLow);
}

/* ── browse (no query) ── */
function browse({ namespace, limit = 50, offset = 0 } = {}) {
  if (!DATA?.entries)
    return {
      ok: false,
      error: "not_loaded",
      hits: [],
      total: 0,
      version: VERSION,
    };
  const entries = filterByNs(DATA.entries, namespace);
  const hits = entries.map((e) => buildHit(e, 0));
  sortHits(hits, "latest");
  return {
    ok: true,
    version: VERSION,
    total: hits.length,
    hits: hits.slice(offset, offset + limit),
  };
}

/* ── search ── */
function search({
  query,
  namespace,
  limit = 30,
  offset = 0,
  sort = "score",
} = {}) {
  if (!DATA?.entries)
    return {
      ok: false,
      error: "not_loaded",
      hits: [],
      total: 0,
      version: VERSION,
    };
  const q = (query || "").trim();
  if (!q) return browse({ namespace, limit, offset });

  const qLow = toLower(q);
  const entries = filterByNs(DATA.entries, namespace);
  const hits = [];
  for (const e of entries) {
    const s = scoreEntry(e, qLow);
    if (s > 0) hits.push(buildHit(e, s));
  }
  sortHits(hits, sort === "latest" ? "latest" : "score");
  return {
    ok: true,
    version: VERSION,
    total: hits.length,
    hits: hits.slice(offset, offset + limit),
  };
}

/* ── namespace counts ── */
function getNamespaceCounts() {
  if (!DATA?.entries) return {};
  const counts = {};
  for (const e of DATA.entries) {
    const ns = e?.namespace || "__unknown__";
    counts[ns] = (counts[ns] || 0) + 1;
  }
  return counts;
}

/* ── get single package ── */
function findEntry(id) {
  if (!DATA?.entries) return null;
  const [ns, name] = String(id || "").split("/");
  return (
    DATA.entries.find((e) => e?.namespace === ns && e?.name === name) || null
  );
}

function buildPackagePayload(e) {
  if (!e) return null;
  const ns = e?.namespace || "";
  const name = e?.name || "";
  const vs = e?.versions && typeof e.versions === "object" ? e.versions : {};
  const versionsCount = Object.keys(vs).length;
  return {
    id: `${ns}/${name}`,
    namespace: ns,
    name,
    displayName: e?.displayName || name,
    description: e?.description || "",
    keywords: Array.isArray(e?.keywords) ? e.keywords : [],
    repo: getRepoUrl(e),
    homepage: e?.homepage || "",
    license: e?.license || "MIT",
    latest: latestVersion(e),
    type: e?.type || "header-only",
    constraints: e?.constraints || {},
    maintainers: Array.isArray(e?.maintainers) ? e.maintainers : [],
    quality: e?.quality || {},
    versions: vs,
    versionsCount,
    updatedAt: getUpdatedAt(e),
    createdAt: e?.createdAt || "",
    readme: typeof e?.readme === "string" ? e.readme : "",
  };
}

/* ── message handler ── */
self.onmessage = (ev) => {
  const msg = ev.data || {};
  const type = msg.type;

  /* load */
  if (type === "load") {
    DATA = msg.data || null;
    VERSION = DATA?.meta?.generatedAt || "";
    self.postMessage({ type: "loaded", ok: !!DATA, version: VERSION });
    return;
  }

  /* search */
  if (type === "search") {
    const q = (msg.query || "").toString().trim();
    const res = q
      ? search({
          query: q,
          namespace: msg.namespace || null,
          limit: msg.limit,
          offset: msg.offset,
          sort: msg.sort,
        })
      : browse({
          namespace: msg.namespace || null,
          limit: msg.limit,
          offset: msg.offset,
        });
    self.postMessage({
      type: "searchResult",
      ...res,
      query: q,
      offset: Math.max(0, Number(msg.offset) || 0),
      limit: Number(msg.limit || (q ? 30 : 50)),
      mode: q ? "search" : "browse",
    });
    return;
  }

  /* namespace counts */
  if (type === "getNamespaceCounts") {
    self.postMessage({
      type: "namespaceCounts",
      counts: getNamespaceCounts(),
      version: VERSION,
    });
    return;
  }

  /* single package */
  if (type === "getPackage") {
    const id = String(msg.id || "").trim();
    const ent = findEntry(id);
    if (!ent) {
      self.postMessage({
        type: "packageResult",
        ok: false,
        error: "not_found",
        id,
        pkg: null,
        version: VERSION,
      });
      return;
    }
    self.postMessage({
      type: "packageResult",
      ok: true,
      id,
      pkg: buildPackagePayload(ent),
      version: VERSION,
    });
    return;
  }

  self.postMessage({ type: "error", error: "unknown_message_type" });
};
