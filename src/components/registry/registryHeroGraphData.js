export const heroNodes = [
  { id: "json", x: 92, y: 110, label: "json", version: "v1.4", delay: 1.65, labeled: true },
  { id: "http", x: 500, y: 92, label: "http", version: "v1.8", delay: 1.8, labeled: true },
  { id: "async", x: 536, y: 274, label: "async", version: "v0.9", delay: 1.95 },
  { id: "crypto", x: 462, y: 442, label: "crypto", version: "v1.2", delay: 2.1, labeled: true },
  { id: "db", x: 116, y: 430, label: "db", version: "v3.0", delay: 2.25, desktopOnly: true },
  { id: "core", x: 60, y: 272, label: "core", version: "v2.1", delay: 2.0 },
];

export const heroEdges = [
  { id: "json-core", from: "json", to: "core", path: "M 112 130 C 88 170 72 214 66 250", delay: 2.05 },
  { id: "json-hub", from: "json", to: "hub", path: "M 120 119 C 168 150 196 185 226 220", delay: 2.15 },
  { id: "http-hub", from: "http", to: "hub", path: "M 476 112 C 426 144 394 180 365 219", delay: 2.2 },
  { id: "async-http", from: "async", to: "http", path: "M 523 252 C 520 204 514 158 504 116", delay: 2.3 },
  { id: "async-hub", from: "async", to: "hub", path: "M 512 274 C 452 274 414 270 380 263", delay: 2.35 },
  { id: "crypto-hub", from: "crypto", to: "hub", path: "M 444 422 C 408 382 382 342 358 307", delay: 2.4 },
  { id: "db-core", from: "db", to: "core", path: "M 106 408 C 88 362 74 322 67 294", delay: 2.45, desktopOnly: true },
  { id: "core-hub", from: "core", to: "hub", path: "M 84 272 C 140 272 184 268 218 262", delay: 2.5 },
];

export const heroPulsePaths = [
  "M 120 119 C 168 150 196 185 226 220",
  "M 444 422 C 408 382 382 342 358 307",
];
