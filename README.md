# Agency Project Manager

Mobile-first project management dashboard for the Agency Orchestra system. The live app is a static GitHub Pages dashboard backed by Supabase, with an optional local runner that can perform Senior Project Manager review passes using Claude.

Current app version: `v0.00012`

## What This Tool Does

- Shows project cards in a Kanban board with mobile full-screen swipe lanes.
- Stores cards in Supabase when configured, with localStorage fallback for demo/offline use.
- Tracks action requests, owners, progress counts, stuck signals, blocker notes, and AI summaries.
- Gives each agent a top-card summary with status and progress bars.
- Provides tabs for Kanban, Main Table, Activity, Action Queue, Stats, and Scripts.
- Shows first-login dashboard previews for Stats and Script Runner on the main Kanban page.
- Runs an optional local Senior PM script on demand or by schedule.

## Repository Files

| File | Purpose | How It Is Used |
| --- | --- | --- |
| `index.html` | Main single-page dashboard app. | Served directly by GitHub Pages. Contains the UI, styles, Supabase client, Kanban logic, mobile lane behavior, agent cards, tabs, script controls, stats, and version history. |
| `README.md` | Main project documentation. | Explains what each file does, how to run the dashboard, and how to use the local scripts. |
| `.gitignore` | Keeps local secrets and installed packages out of Git. | Ignores `agency-agent-runner/.env` and `agency-agent-runner/node_modules/`. |
| `agency-agent-runner/README.md` | Runner-specific setup notes. | Quick reference for installing dependencies, creating `.env`, running once, serving the script API, and scheduling. |
| `agency-agent-runner/package.json` | Node package definition for the runner. | Defines `npm run run-once`, `npm run serve`, and dependencies for Anthropic, Supabase, and dotenv. |
| `agency-agent-runner/.env.example` | Safe environment variable template. | Copy to `.env` locally, then fill in private keys. Do not commit `.env`. |
| `agency-agent-runner/runner.js` | Senior Project Manager automation pass. | Reads active Supabase cards, asks Claude for structured updates, updates fields, increments progress, tracks no-progress runs, marks stuck cards, and writes action log entries. |
| `agency-agent-runner/server.js` | Local HTTP bridge for the dashboard Scripts tab. | Runs on `http://127.0.0.1:8787` by default and exposes `GET /health` plus `POST /run/senior-pm`. |

## Main Dashboard

Open the GitHub Pages site for the repo to use the dashboard. The dashboard is intentionally static so it can be hosted publicly without running a backend server.

Main areas:

- `Kanban`: Primary mobile-friendly board. On mobile, each lane takes the full screen and can be swiped horizontally.
- `Main Table`: Compact spreadsheet-style view of cards and key fields.
- `Activity`: Recent agent updates pulled from card `action_log` entries.
- `Action Queue`: Actionable requests grouped by `actionStatus`.
- `Stats`: KPI cards plus the agent leaderboard and reward badges.
- `Scripts`: Local runner controls, Run now button, runner URL, and readable status log.

## Agent Cards

The cards across the top summarize the main operating agents:

- `Project Manager`
- `Project Shepherd`
- `Tool Evaluator`
- `Senior Project Manager`

Each agent card shows:

- Number of matched cards.
- Current card or `Nothing assigned`.
- Status: `Idle`, `Active`, `Blocked`, or `Complete`.
- Progress as `done / total`.
- Progress bar with visual coloring.
- `Copy Prompt` button for that agent's current card.

## Mobile Layout

The mobile layout is designed for phone use:

- Header and controls are compact.
- Agent cards and desktop preview panels are hidden to preserve board space.
- Each lane becomes a full-screen swipe panel.
- Horizontal swipe moves between lanes cleanly.
- Card actions remain available inside each lane.

## Data Storage

The dashboard uses Supabase when the public URL and anon key are present in `index.html`.

Important notes:

- The anon key is public by design for a browser-based Supabase app.
- Real security should come from Supabase Row Level Security policies.
- Service role keys must never be placed in `index.html`.
- Private automation keys belong only in `agency-agent-runner/.env`.
- If Supabase is unavailable, the dashboard can fall back to localStorage demo data.

## Supabase Fields

`index.html` includes SQL comments for fields the dashboard expects. These support:

- Card basics like title, status, owner, priority, due date, notes, and links.
- Agent routing fields like `assigned_agent`, `claude_skill`, and prompt context.
- Action request fields like `action_needed`, `action_owner`, `action_status`, and `action_result`.
- Automation fields like `action_log`, `last_updated_by_agent`, `progress_count`, and `no_progress_run_count`.

If new UI fields do not save, check that the matching Supabase columns exist.

## Local Senior PM Runner

The runner is local-only because it uses private keys.

Setup:

```powershell
cd agency-agent-runner
npm install
Copy-Item .env.example .env
```

Then fill in `agency-agent-runner/.env`:

```text
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-local-only-service-role-key
ANTHROPIC_API_KEY=your-claude-api-key
ANTHROPIC_MODEL=your-claude-model
STUCK_RUN_THRESHOLD=3
```

Run one Senior PM pass:

```powershell
npm run run-once
```

Start the local script server:

```powershell
npm run serve
```

Then use this runner URL in the dashboard Scripts tab:

```text
http://127.0.0.1:8787
```

## Scripts Tab

The Scripts tab lets the dashboard trigger local automation without putting private keys in the public site.

Current script:

- `Senior PM Runner`
- Endpoint: `POST /run/senior-pm`
- Local server: `agency-agent-runner/server.js`
- Work performed: updates priority, decision-needed fields, action-needed fields, action status, AI summaries, progress counts, stuck signals, and action logs.

The status log is saved in browser localStorage so you can quickly see whether a script ran, failed, or needs the local runner server started.

## Suggested Scheduling

Use Windows Task Scheduler for automatic runs. Point it at:

```powershell
npm --prefix "C:\path\to\agency-agent-runner" run run-once
```

Use a schedule that matches how often you want the Senior PM to check progress. The `STUCK_RUN_THRESHOLD` setting controls how many no-progress passes happen before a card gets marked as blocked/stuck.

## Security Notes

- GitHub Pages is public, so do not put private API keys in `index.html`.
- Keep `agency-agent-runner/.env` local only.
- The local runner server should stay bound to `127.0.0.1` unless you intentionally change it.
- Device ID or IP checks in browser JavaScript are not strong security for a public site.
- For true access control, use Supabase auth, RLS policies, or move protected views behind a real server.

## Development Workflow

For dashboard changes:

```powershell
git status
```

Edit `index.html`, then sanity-check the embedded script:

```powershell
node -e "const fs=require('fs');const html=fs.readFileSync('index.html','utf8');const script=html.match(/<script>([\s\S]*)<\/script>/)[1];new Function(script);console.log('index script ok')"
```

Check for whitespace problems:

```powershell
git diff --check
```

Commit and push:

```powershell
git add index.html README.md
git commit -m "Describe your update"
git push origin main
```

GitHub Pages will update after the push finishes and the Pages build completes.
