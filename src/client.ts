/**
 * Client for the ICTBroadcast REST-RPC API.
 *
 * ICTBroadcast run the same framework and
 * expose the same methods at `{base}/rest/<Method>`. Every call is a form-encoded
 * POST carrying `username` and `password`; nested values are sent as JSON strings.
 * A success comes back as `[true, data]`, a failure as `[false, "message"]`.
 *
 * Part of ictbroadcast-mcp by Tahir Almas, ICT Innovations (https://ictinnovations.com).
 */

import type { Config } from "./config.js";

export class ICTBroadcastError extends Error {}

export class ICTBroadcastClient {
  constructor(private cfg: Config) {}

  private controller(): { signal: AbortSignal; done: () => void } {
    const c = new AbortController();
    const t = setTimeout(() => c.abort(), this.cfg.timeoutMs);
    return { signal: c.signal, done: () => clearTimeout(t) };
  }

  async call(method: string, params: Record<string, unknown> = {}): Promise<unknown> {
    const form = new URLSearchParams();
    form.set("username", this.cfg.username);
    form.set("password", this.cfg.password);
    for (const [k, v] of Object.entries(params)) {
      if (v === undefined || v === null) continue;
      form.set(k, typeof v === "object" ? JSON.stringify(v) : String(v));
    }

    const { signal, done } = this.controller();
    let res: Response;
    try {
      res = await fetch(`${this.cfg.baseUrl}/rest/${method}`, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded", Accept: "application/json" },
        body: form.toString(),
        signal,
      });
    } finally {
      done();
    }

    const textBody = await res.text();
    let body: unknown = null;
    if (textBody) {
      try { body = JSON.parse(textBody); } catch { body = textBody; }
    }

    // Framework error object, e.g. {"ErrorCode":401,"ErrorMessage":"Unauthorized..."}.
    if (body && typeof body === "object" && !Array.isArray(body) && "ErrorMessage" in (body as object)) {
      const e = body as { ErrorCode?: number; ErrorMessage?: string };
      throw new ICTBroadcastError(`${e.ErrorCode ?? res.status}: ${e.ErrorMessage}`);
    }
    if (!res.ok) throw new ICTBroadcastError(`HTTP ${res.status}: ${textBody.slice(0, 200)}`);

    // Normal shape: [ok, payload] or [false, "message"].
    if (Array.isArray(body) && typeof body[0] === "boolean") {
      if (body[0]) return body.length > 1 ? body[1] : true;
      throw new ICTBroadcastError(String(body.length > 1 ? body[1] : `${method} failed`));
    }
    return body;
  }

  // ---- reads ------------------------------------------------------------
  listCampaigns() { return this.call("Campaign_List"); }
  campaignStatus(campaignId: number) { return this.call("Campaign_Status", { campaign_id: campaignId }); }
  campaignSummary(campaignId: number, usrId?: number) {
    return this.call("Campaign_Summary", { campaign_id: campaignId, usr_id: usrId });
  }
  campaignResult(campaignId: number, status?: string) {
    return this.call("Campaign_Result", { campaign_id: campaignId, status });
  }

  // ---- writes -----------------------------------------------------------
  startCampaign(campaignId: number) { return this.call("Campaign_Start", { campaign_id: campaignId }); }
  stopCampaign(campaignId: number) { return this.call("Campaign_Stop", { campaign_id: campaignId }); }
}
