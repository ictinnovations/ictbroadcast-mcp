/**
 * Configuration for ictbroadcast-mcp.
 *
 * Part of ictbroadcast-mcp by Tahir Almas, ICT Innovations (https://ictinnovations.com).
 */

export interface Config {
  baseUrl: string;
  username: string;
  password: string;
  allowWrite: boolean;
  timeoutMs: number;
  tlsInsecure: boolean;
}

function num(value: string | undefined, fallback: number): number {
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

function bool(value: string | undefined): boolean {
  return /^(1|true|yes)$/i.test(value ?? "");
}

/**
 * Read config from the environment. Throws a clear error when a required value is
 * missing, so the server fails at startup rather than on the first tool call.
 */
export function loadConfig(env: NodeJS.ProcessEnv = process.env): Config {
  // Base URL WITHOUT the /rest suffix, e.g. https://your-ictbroadcast.
  const baseUrl = (env.ICTBROADCAST_BASE_URL ?? "").trim().replace(/\/+$/, "").replace(/\/rest$/i, "");
  const username = (env.ICTBROADCAST_USERNAME ?? "").trim();
  const password = env.ICTBROADCAST_PASSWORD ?? "";

  const missing: string[] = [];
  if (!baseUrl) missing.push("ICTBROADCAST_BASE_URL");
  if (!username) missing.push("ICTBROADCAST_USERNAME");
  if (!password) missing.push("ICTBROADCAST_PASSWORD");
  if (missing.length) {
    throw new Error(
      `ictbroadcast-mcp: missing required config: ${missing.join(", ")}.\n` +
        "See https://github.com/ictinnovations/ictbroadcast-mcp for the full variable list."
    );
  }

  return {
    baseUrl,
    username,
    password,
    allowWrite: bool(env.ICTBROADCAST_MCP_ALLOW_WRITE),
    timeoutMs: num(env.ICTBROADCAST_TIMEOUT_MS, 30000),
    tlsInsecure: bool(env.ICTBROADCAST_TLS_INSECURE),
  };
}
