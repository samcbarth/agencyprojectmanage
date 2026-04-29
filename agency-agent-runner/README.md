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

## Schedule

Use Windows Task Scheduler to run:

```powershell
npm --prefix "C:\path\to\agency-agent-runner" run run-once
```

The runner reviews active cards, updates Senior PM fields, writes to `action_log`, increments `progress_count` when fields change, and marks cards blocked/stuck after repeated no-progress runs.
