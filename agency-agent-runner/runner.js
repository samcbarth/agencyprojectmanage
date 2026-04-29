import 'dotenv/config';
import Anthropic from '@anthropic-ai/sdk';
import { createClient } from '@supabase/supabase-js';

const required = ['SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY', 'ANTHROPIC_API_KEY', 'ANTHROPIC_MODEL'];
const missing = required.filter((key) => !process.env[key]);
if (missing.length) {
  throw new Error(`Missing required env vars: ${missing.join(', ')}`);
}

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const stuckThreshold = Number(process.env.STUCK_RUN_THRESHOLD || 3);

const trackedFields = [
  'priority',
  'decision_needed',
  'action_needed',
  'action_status',
  'ai_summary',
  'ai_recommendation',
  'ai_risk_assessment',
  'ai_questions'
];

function compactCard(card) {
  return {
    id: card.id,
    title: card.title,
    status: card.status,
    priority: card.priority,
    goal: card.goal,
    next_action: card.next_action,
    blocker: card.blocker,
    decision_needed: card.decision_needed,
    action_needed: card.action_needed,
    action_type: card.action_type,
    action_owner: card.action_owner,
    action_target: card.action_target,
    action_input: card.action_input,
    action_output_expected: card.action_output_expected,
    action_status: card.action_status,
    action_result: card.action_result,
    progress_count: card.progress_count || 0,
    no_progress_run_count: card.no_progress_run_count || 0
  };
}

function buildSeniorPmPrompt(card) {
  return `You are the Senior Project Manager agent for this agency initiative board.

Review the card and return ONLY valid JSON. Do not include markdown.

Your job:
- Update priority if needed.
- Clarify decision_needed.
- Create or improve action_needed.
- Keep the action executable by a specific agent.
- Write a short ai_summary and ai_recommendation.
- Identify ai_risk_assessment and ai_questions.
- If progress is blocked, set action_status to "Blocked".

Required JSON keys:
priority, decision_needed, action_needed, action_status, ai_summary, ai_recommendation, ai_risk_assessment, ai_questions

Card:
${JSON.stringify(compactCard(card), null, 2)}`;
}

function parseJson(text) {
  const trimmed = text.trim();
  const start = trimmed.indexOf('{');
  const end = trimmed.lastIndexOf('}');
  if (start === -1 || end === -1) throw new Error('No JSON object returned by model');
  return JSON.parse(trimmed.slice(start, end + 1));
}

function changed(before, updates) {
  return trackedFields.some((field) => String(before[field] || '') !== String(updates[field] || ''));
}

function buildUpdate(card, modelOutput) {
  const now = new Date().toISOString();
  const proposed = {};
  for (const field of trackedFields) {
    proposed[field] = modelOutput[field] ?? card[field] ?? '';
  }

  const madeProgress = changed(card, proposed);
  const noProgressRunCount = madeProgress ? 0 : Number(card.no_progress_run_count || 0) + 1;
  const shouldEscalate = noProgressRunCount >= stuckThreshold;
  const actionLog = Array.isArray(card.action_log) ? card.action_log : [];
  const logText = madeProgress
    ? 'Senior PM updated priority, decision, or action fields.'
    : `Senior PM found no field changes. No-progress run ${noProgressRunCount}.`;

  return {
    ...proposed,
    status: shouldEscalate ? 'Stuck' : card.status,
    action_status: shouldEscalate ? 'Blocked' : proposed.action_status,
    blocker: shouldEscalate ? (card.blocker || 'No progress after repeated Senior PM runs.') : card.blocker,
    last_updated_by_agent: 'Senior Project Manager',
    last_progress_timestamp: madeProgress ? now : card.last_progress_timestamp,
    progress_count: madeProgress ? Number(card.progress_count || 0) + 1 : Number(card.progress_count || 0),
    no_progress_run_count: noProgressRunCount,
    action_log: [
      { time: now, agent: 'Senior Project Manager', field: madeProgress ? 'agent fields' : 'stuck detection', text: logText },
      ...actionLog
    ].slice(0, 50),
    updated_at: now
  };
}

async function runSeniorPm(card) {
  const message = await anthropic.messages.create({
    model: process.env.ANTHROPIC_MODEL,
    max_tokens: 1200,
    temperature: 0.2,
    messages: [{ role: 'user', content: buildSeniorPmPrompt(card) }]
  });

  const text = message.content.map((part) => part.type === 'text' ? part.text : '').join('\n');
  const output = parseJson(text);
  const update = buildUpdate(card, output);
  const { error } = await supabase.from('kanban_items').update(update).eq('id', card.id);
  if (error) throw error;
  console.log(`${card.title}: updated by Senior PM`);
}

async function main() {
  const { data, error } = await supabase
    .from('kanban_items')
    .select('*')
    .not('status', 'eq', 'Done')
    .order('sort_order', { ascending: true });

  if (error) throw error;
  for (const card of data || []) {
    await runSeniorPm(card);
  }
  console.log(`Processed ${(data || []).length} cards`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
