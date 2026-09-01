# ictbroadcast-mcp

A [Model Context Protocol](https://modelcontextprotocol.io) server for
**[ICTBroadcast](https://ictbroadcast.com)** — the voice, SMS and fax broadcasting
and call-center platform from [ICT Innovations](https://ictinnovations.com).

It lets an AI assistant monitor outbound campaigns — list them, check status, read
summaries and per-call results — and, only when you turn writes on, start and stop
them.

## Install

```bash
npx -y ictbroadcast-mcp      # no install
npm install -g ictbroadcast-mcp
```

Requires Node.js 18 or newer.

## Configure

| Variable | Required | Default | |
|----------|----------|---------|--|
| `ICTBROADCAST_BASE_URL` | yes | | Server base URL, without the `/rest` suffix, e.g. `https://your-ictbroadcast` |
| `ICTBROADCAST_USERNAME` | yes | | API account username |
| `ICTBROADCAST_PASSWORD` | yes | | Password for that account |
| `ICTBROADCAST_MCP_ALLOW_WRITE` | no | `false` | Unlock start/stop campaign (see Safety) |
| `ICTBROADCAST_TIMEOUT_MS` | no | `30000` | Per-request timeout |
| `ICTBROADCAST_TLS_INSECURE` | no | `false` | Skip TLS verification — self-signed test servers only |

### Claude Desktop example

```json
{
  "mcpServers": {
    "ictbroadcast": {
      "command": "npx",
      "args": ["-y", "ictbroadcast-mcp"],
      "env": {
        "ICTBROADCAST_BASE_URL": "https://your-ictbroadcast",
        "ICTBROADCAST_USERNAME": "admin",
        "ICTBROADCAST_PASSWORD": "your-password"
      }
    }
  }
}
```

## Tools

Read tools are always available:

| Tool | What it does |
|------|--------------|
| `ictbroadcast_list_campaigns` | List campaigns (id and name) |
| `ictbroadcast_campaign_status` | Live status of a campaign (running, stopped) |
| `ictbroadcast_campaign_summary` | Totals: answered, failed, human vs machine |
| `ictbroadcast_campaign_result` | Per-call results (contact, response, AMD, DNC) |

Write tools appear only when `ICTBROADCAST_MCP_ALLOW_WRITE=true`:

| Tool | What it does |
|------|--------------|
| `ictbroadcast_start_campaign` | Launch a campaign — begins live outbound calling |
| `ictbroadcast_stop_campaign` | Stop a running campaign |

## Safety

The server is **read-only by default**. Starting a campaign begins live outbound
calling and can cost real money, so `ictbroadcast_start_campaign` and
`ictbroadcast_stop_campaign` are not registered at all unless you set
`ICTBROADCAST_MCP_ALLOW_WRITE=true`.

## How it connects

ICTBroadcast exposes a form-encoded RPC API at `{base}/rest/<Method>`. Each call
carries the account username and password; the server sends those for you. There is
no separate token to provision. (The ICTBroadcast REST API is bundled with the
Service Provider edition.)

## About

Built by Tahir Almas at [ICT Innovations](https://ictinnovations.com) — the team
behind ICTBroadcast, ICTContact, ICTDialer, ICTFax and ICTPBX. Learn more at
[ictbroadcast.com](https://ictbroadcast.com).

MIT licensed. Issues and PRs welcome at
[github.com/ictinnovations/ictbroadcast-mcp](https://github.com/ictinnovations/ictbroadcast-mcp).
