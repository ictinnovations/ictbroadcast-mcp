/**
 * Config and write-gate tests. Run after build (they import from dist/).
 */
import { test } from "node:test";
import assert from "node:assert/strict";

import { loadConfig } from "../dist/config.js";
import { registerTools } from "../dist/tools.js";

const base = {
  ICTBROADCAST_BASE_URL: "https://cc.example.com/rest/",
  ICTBROADCAST_USERNAME: "admin",
  ICTBROADCAST_PASSWORD: "x",
};

test("loadConfig requires base url, username and password", () => {
  assert.throws(() => loadConfig({}), /ICTBROADCAST_BASE_URL/);
  assert.throws(() => loadConfig({ ICTBROADCAST_BASE_URL: "https://x" }), /ICTBROADCAST_USERNAME/);
});

test("base url trims trailing slash and a /rest suffix", () => {
  assert.equal(loadConfig(base).baseUrl, "https://cc.example.com");
  assert.equal(loadConfig({ ...base, ICTBROADCAST_BASE_URL: "https://cc.example.com/" }).baseUrl, "https://cc.example.com");
});

test("write is off by default and parses truthy strings", () => {
  assert.equal(loadConfig(base).allowWrite, false);
  assert.equal(loadConfig({ ...base, ICTBROADCAST_MCP_ALLOW_WRITE: "yes" }).allowWrite, true);
});

function collectTools(allowWrite) {
  const names = [];
  const fakeServer = { registerTool: (name) => names.push(name) };
  registerTools(fakeServer, { ...loadConfig(base), allowWrite }, /* client */ {});
  return names;
}

test("read-only install registers only the four read tools", () => {
  assert.deepEqual(new Set(collectTools(false)), new Set([
    "ictbroadcast_list_campaigns", "ictbroadcast_campaign_status",
    "ictbroadcast_campaign_summary", "ictbroadcast_campaign_result",
  ]));
});

test("write install additionally registers start and stop", () => {
  const names = collectTools(true);
  assert.ok(names.includes("ictbroadcast_start_campaign"));
  assert.ok(names.includes("ictbroadcast_stop_campaign"));
  assert.equal(names.length, 6);
});
