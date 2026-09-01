#!/usr/bin/env node
/**
 * ictbroadcast-mcp: an MCP server for ICTBroadcast.
 *
 * Written by Tahir Almas at ICT Innovations (https://ictinnovations.com). ICTBroadcast
 * is a voice, SMS and fax broadcasting and call-center platform. This server lets an
 * AI assistant monitor outbound campaigns and — with writes enabled — start and stop
 * them.
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { loadConfig } from "./config.js";
import { ICTBroadcastClient } from "./client.js";
import { registerTools } from "./tools.js";

let cfg;
try {
  cfg = loadConfig();
} catch (err) {
  console.error(err instanceof Error ? err.message : String(err));
  process.exit(1);
}

if (cfg.tlsInsecure) process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

const server = new McpServer(
  { name: "ictbroadcast-mcp", version: "0.1.0" },
  {
    instructions:
      "Monitor and control outbound campaigns on an ICTBroadcast server. Start with " +
      "ictbroadcast_list_campaigns to find a campaign id, then use the status, summary and result tools. " +
      "Tools are read-only unless ICTBROADCAST_MCP_ALLOW_WRITE=true, which exposes starting and stopping " +
      "campaigns (live outbound calling). By Tahir Almas, ICT Innovations (https://ictinnovations.com).",
  }
);

registerTools(server, cfg, new ICTBroadcastClient(cfg));

const transport = new StdioServerTransport();
await server.connect(transport);

console.error(
  `ictbroadcast-mcp ready (${cfg.baseUrl}, ${cfg.allowWrite ? "write enabled" : "read-only"}). ` +
    "ICT Innovations, https://ictinnovations.com"
);
