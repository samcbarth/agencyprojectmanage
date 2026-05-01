# Agency Project Manager Context Handoff

Date: 2026-05-01
Repo: `samcbarth/agencyprojectmanage`
Live site: `https://samcbarth.github.io/agencyprojectmanage/`

## What the project is

This is a single-file Kanban-style project manager for agency work packets. The app uses:

- a simplified user-facing create form
- a detailed AI-owned drawer for card metadata
- mobile-first Kanban rendering
- live GitHub Pages publishing from `main`

The user verifies changes on the live Pages site, so pushes to `main` are part of the normal workflow.

## Core product decision

Only these fields are user-filled on create:

- `Title`
- `Short Description`
- `Tools I Expect To Use`
- `Comprehensive Detailed Action Plan`

Everything else stays in the system, but is AI-owned.

## Important UI decisions already made

- The create-new-card form only shows the four user fields.
- The Kanban cards only show user fields, with the detailed action plan shown on mobile only.
- The card drawer is split into:
  - `User Fields`
  - `AI Fields`
- The AI fields are grouped into categories.
- Section headers now include the owning agent name.
- Button / tab / pill / checkbox interactions now have hover and click feedback.
- `Tools I Expect To Use` is a checkbox group with additional options:
  - `Other APIs`
  - `Other AIs`
  - `Other Communications`
  - `Other Databases`
  - `Other CRMs`

## AI field grouping and ownership

The AI drawer is currently sectioned like this:

### Classification
Owner: `Tool Evaluator`

This section covers AI routing and taxonomy:

- AI Status
- AI System
- AI Blocker Type
- AI Approval Type
- AI Script Category
- AI Learning Loop Status
- AI Output Type
- AI Workflow Stage
- AI Effort Size
- AI Frequency
- AI Data Sensitivity
- AI Failure Mode
- AI Retry Strategy
- AI Logging Level
- AI Source System
- AI Target System
- AI Dependency Type
- AI Decision Type
- AI SLA / Urgency
- AI Completion Signal
- AI QA Status
- AI QA Type
- AI Prompt Type
- AI Prompt Status
- AI Agent Confidence

### Planning
Owner: `Project Shepherd`

This section covers intent, framing, and planning detail:

- AI Success Criteria
- AI Input Context
- AI Desired Output
- AI Blocker / Dependency
- AI Prompt Notes
- AI Learning Loop
- AI Resource Need
- AI Decision Needed

### Execution
Owner: `Project Manager`

This section covers the action request and execution fields:

- AI Action Type
- AI Action Owner
- AI Action Status
- AI Action Target
- AI Action Request
- AI Action Input
- AI Action Output Expected
- AI Action Result

### Progress and Intelligence
Owner: `Senior Project Manager`

This section covers progress telemetry and summaries:

- AI Last Updated By Agent
- AI Progress Count
- AI No-Progress Count
- AI Summary
- AI Recommendation
- AI Risk Assessment

## Agent guidance

Use the following defaults when deciding which agent should fill AI fields:

- `Project Manager`:
  - default for most cards
  - execution, next actions, status movement, task breakdown
- `Project Shepherd`:
  - alignment, stakeholder flow, keeping the work coordinated
- `Tool Evaluator`:
  - tools, systems, APIs, integrations, stack fit
- `Senior Project Manager`:
  - priority, risk, blockers, approvals, escalation, decision-making

## Field persistence fix

There was a save/load bug for `Tools I Expect To Use`.

What happened:

- the UI was saving the field as `toolStack`
- the backend loader expected `tool_stack`
- the value disappeared after refresh

Fix applied:

- save path now writes `tool_stack`
- load path accepts both `tool_stack` and legacy `toolStack`

## Mobile Kanban action plan

The `Comprehensive Detailed Action Plan` shows on Kanban cards only on mobile.

Current mobile behavior:

- the action plan is shown on the card in mobile/touch layouts
- it uses a preformatted rendering block so line breaks and spacing are preserved
- desktop cards remain unchanged

## Live publish history from this thread

Recent commits pushed to `main`:

- `e671e7f` - Add button hover feedback
- `b5af783` - Persist tool stack selections
- `d6eec11` - Show action plan on mobile cards
- `13937a4` - Preserve action plan formatting on mobile
- `a5d33e0` - Preformat mobile action plan cards
- `dc68bf5` - Group AI fields in drawer
- `cb33340` - Label AI sections by owner

## Things to be careful about next

- Don’t reintroduce `toolStack` as the DB write field. Keep `tool_stack` on save.
- Keep the mobile-only action plan behavior limited to Kanban cards.
- If the AI field list changes, update both:
  - the drawer sections
  - the prompt builder
- If the user-facing field model changes, update:
  - create form
  - Kanban card rendering
  - mobile view
  - drawer user section

## Helpful file

- [index.html](./index.html)

