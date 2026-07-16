import DOMPurify from "dompurify";
import { marked } from "marked";

const languages = ["bash", "c", "cmake", "cpp", "css", "diff", "html", "ini", "js", "json", "md", "sql", "toml", "ts", "txt", "xml", "yaml"];
let highlighterPromise;

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

export function normalizeCodeLanguage(value) {
  const language = String(value || "txt").trim().toLowerCase().split(/\s+/)[0];
  if (["c++", "cc", "cxx", "h", "hh", "hpp", "hxx"].includes(language)) return "cpp";
  if (["console", "shell", "sh", "zsh"].includes(language)) return "bash";
  if (language === "yml") return "yaml";
  if (language === "markdown") return "md";
  return languages.includes(language) ? language : "txt";
}

async function getHighlighter() {
  highlighterPromise ||= Promise.all([
    import("shiki/core"),
    import("shiki/engine/javascript"),
    import("@shikijs/themes/github-dark"),
    import("@shikijs/langs/bash"),
    import("@shikijs/langs/c"),
    import("@shikijs/langs/cmake"),
    import("@shikijs/langs/cpp"),
    import("@shikijs/langs/css"),
    import("@shikijs/langs/diff"),
    import("@shikijs/langs/html"),
    import("@shikijs/langs/ini"),
    import("@shikijs/langs/javascript"),
    import("@shikijs/langs/json"),
    import("@shikijs/langs/markdown"),
    import("@shikijs/langs/sql"),
    import("@shikijs/langs/toml"),
    import("@shikijs/langs/typescript"),
    import("@shikijs/langs/xml"),
    import("@shikijs/langs/yaml"),
  ]).then(([core, engine, theme, ...grammars]) => core.createHighlighterCore({
    themes: [theme.default],
    langs: grammars.flatMap((grammar) => grammar.default),
    engine: engine.createJavaScriptRegexEngine({ forgiving: true }),
  }));
  return highlighterPromise;
}

export async function highlightRegistryCode(code, language = "txt") {
  try {
    const highlighter = await getHighlighter();
    return highlighter.codeToHtml(String(code ?? ""), {
      lang: normalizeCodeLanguage(language),
      theme: "github-dark",
    });
  } catch {
    return `<pre class="shiki registry-code-fallback"><code>${escapeHtml(code)}</code></pre>`;
  }
}

function headingId(value) {
  return String(value || "section")
    .toLowerCase()
    .replace(/<[^>]*>/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .slice(0, 80);
}

export async function renderRegistryMarkdown(markdown) {
  const highlighter = await getHighlighter();
  const renderer = new marked.Renderer();

  renderer.code = (token, language) => {
    const code = typeof token === "object" ? token.text || "" : token || "";
    const info = typeof token === "object" ? token.lang || "" : language || "";
    try {
      return highlighter.codeToHtml(code, {
        lang: normalizeCodeLanguage(info),
        theme: "github-dark",
      });
    } catch {
      return `<pre class="shiki registry-code-fallback"><code>${escapeHtml(code)}</code></pre>`;
    }
  };

  renderer.heading = (token, depth) => {
    const text = typeof token === "object" ? token.text || "" : token || "";
    const requestedLevel = typeof token === "object" ? token.depth || 2 : depth || 2;
    const level = Math.max(2, Math.min(6, Number(requestedLevel)));
    return `<h${level} id="${headingId(text)}">${text}</h${level}>`;
  };

  const rendered = marked.parse(String(markdown || ""), {
    gfm: true,
    breaks: false,
    renderer,
  });
  const sanitized = DOMPurify.sanitize(rendered, { FORBID_TAGS: ["main", "script", "style"] });
  const template = document.createElement("template");
  template.innerHTML = sanitized;

  for (const link of template.content.querySelectorAll("a[href]")) {
    if (!link.getAttribute("href")?.startsWith("#")) {
      link.setAttribute("target", "_blank");
      link.setAttribute("rel", "noreferrer noopener");
    }
  }
  for (const image of template.content.querySelectorAll("img")) {
    image.setAttribute("loading", "lazy");
    image.setAttribute("decoding", "async");
  }
  return template.innerHTML;
}
