# Agency Agent Runner

Local runner for the Senior Project Manager agent loop.

## Setup

```powershell
cd agency-agent-runner
npm install
Copy-Item .env.example .env
```

Fill in `.env` with your Supabase service role key and Anthropic API key. Keep `.env` local only.

## Run Once

```powershell
npm run run-once
```

## Run From The Dashboard

Start the local runner server:

```powershell
npm run serve
```

Then open the dashboard's Scripts tab and use:

```text
http://127.0.0.1:8787
```

The Run now button calls `POST /run/senior-pm` and writes a readable status message back to the dashboard log.

## Schedule

Use Windows Task Scheduler to run:

```powershell
npm --prefix "C:\path\to\agency-agent-runner" run run-once
```

The runner reviews active cards, updates Senior PM fields, writes to `action_log`, increments `progress_count` when fields change, and marks cards blocked/stuck after repeated no-progress runs.
