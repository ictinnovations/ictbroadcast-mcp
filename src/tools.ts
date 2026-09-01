/**
 * ICTBroadcast tools exposed over MCP.
 *
 * Read tools are always registered. The two write tools — start and stop a
 * campaign — begin or halt live outbound calling (real money), so they are only
 * registered when ICTBROADCAST_MCP_ALLOW_WRITE is set.
 *
 * Part of ictbroadcast-mcp by Tahir Almas, ICT Innovations (https://ictinnovations.com).
 */

import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Config } from "./config.js";
import type { ICTBroadcastClient } from "./client.js";
import { json, toolError } from "./format.js";

export function registerTools(server: McpServer, cfg: Config, client: ICTBroadcastClient): void {
  server.registerTool(
    "ictbroadcast_list_campaigns",
    {
      title: "List campaigns",
      description:
        "List the outbound campaigns on the ICTBroadcast server (id and name of each). " +
        "Start here to find a campaign id.",
      inputSchema: {},
      annotations: { readOnlyHint: true, openWorldHint: true },
    },
    async () => { try { return json(await client.listCampaigns()); } catch (e) { return toolError(e); } }
  );

  server.registerTool(
    "ictbroadcast_campaign_status",
    {
      title: "Campaign status",
      description:
        "Live status of a campaign by id (for example running or stopped). Poll this while a campaign runs.",
      inputSchema: { campaign_id: z.number().int().describe("The campaign id.") },
      annotations: { readOnlyHint: true, openWorldHint: true },
    },
    async ({ campaign_id }) => { try { return json(await client.campaignStatus(campaign_id)); } catch (e) { return toolError(e); } }
  );

  server.registerTool(
    "ictbroadcast_campaign_summary",
    {
      title: "Campaign summary",
      description:
        "Totals for a campaign: answered, failed, human vs machine and so on. Optionally scope to one " +
        "agent/user id.",
      inputSchema: {
        campaign_id: z.number().int().describe("The campaign id."),
        usr_id: z.number().int().optional().describe("Optional agent/user id to scope the summary."),
      },
      annotations: { readOnlyHint: true, openWorldHint: true },
    },
    async ({ campaign_id, usr_id }) => { try { return json(await client.campaignSummary(campaign_id, usr_id)); } catch (e) { return toolError(e); } }
  );

  server.registerTool(
    "ictbroadcast_campaign_result",
    {
      title: "Campaign call results",
      description:
        "Per-call results for a campaign (contact, response, answering-machine detection, DNC), " +
        "optionally filtered by call status.",
      inputSchema: {
        campaign_id: z.number().int().describe("The campaign id."),
        status: z.string().optional().describe("Optional call-status filter."),
      },
      annotations: { readOnlyHint: true, openWorldHint: true },
    },
    async ({ campaign_id, status }) => { try { return json(await client.campaignResult(campaign_id, status)); } catch (e) { return toolError(e); } }
  );

  if (!cfg.allowWrite) return;

  // ---- writes (only when ICTBROADCAST_MCP_ALLOW_WRITE is set) -------------
  server.registerTool(
    "ictbroadcast_start_campaign",
    {
      title: "Start a campaign",
      description:
        "Start (launch) a campaign by id. THIS BEGINS LIVE OUTBOUND CALLING and can cost real money. " +
        "Use ictbroadcast_stop_campaign to halt it.",
      inputSchema: { campaign_id: z.number().int().describe("The campaign id to start.") },
      annotations: { readOnlyHint: false, openWorldHint: true },
    },
    async ({ campaign_id }) => { try { return json(await client.startCampaign(campaign_id)); } catch (e) { return toolError(e); } }
  );

  server.registerTool(
    "ictbroadcast_stop_campaign",
    {
      title: "Stop a campaign",
      description: "Stop a running campaign by id.",
      inputSchema: { campaign_id: z.number().int().describe("The campaign id to stop.") },
      annotations: { readOnlyHint: false, openWorldHint: true },
    },
    async ({ campaign_id }) => { try { return json(await client.stopCampaign(campaign_id)); } catch (e) { return toolError(e); } }
  );
}
