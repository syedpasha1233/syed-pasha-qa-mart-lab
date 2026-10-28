#!/usr/bin/env node
// preToolUse hook: block agent edits that add test.only / describe.only to a spec.
// Exit code 2 blocks the tool call; the reason goes to stderr (and to stdout as a deny decision for Copilot).
// Works with Copilot (toolName/toolArgs) and Local (tool_name/tool_input) payloads.
const fs = require('node:fs');

let event;
try { event = JSON.parse(fs.readFileSync(0, 'utf8')); } catch { process.stdout.write('{}'); process.exit(0); }

const toolName = String(event.toolName ?? event.tool_name ?? '');
let args = event.toolArgs ?? event.tool_input ?? {};
// A raw patch arrives as a plain string; keep it so its added lines are still checked.
if (typeof args === 'string') { try { args = JSON.parse(args); } catch { /* keep raw text */ } }

const EDIT_TOOL = /edit|create|write|replace|patch|insert/i;
const PATH_KEY = /^(path|filepath|file_path|file|uri)$/i;
const OLD_KEY = /^(old_?str(?:ing)?|old_?text)$/i;
const SPEC_FILE = /\.(?:spec|test)\.[cm]?[jt]sx?$/i;
const ONLY = /\b(?:test|it|describe)(?:\s*\.\s*\w+)*\s*\.\s*only\s*\(/;
const PATCH_HEADER = /^\*\*\* (?:Add|Update) File:[ \t]*(.+?)\s*$/;

const hits = [];
const clean = (p) => p.replace(/^file:\/\//, '');

function checkText(text, files) {
  const specs = files.filter((f) => SPEC_FILE.test(f));
  if (!specs.length) return;
  text.split('\n').forEach((line, i) => {
    if (ONLY.test(line)) hits.push({ file: specs[0], line: i + 1, text: line.trim() });
  });
}

function checkPatch(text) {
  let file = '';
  text.split('\n').forEach((line, i) => {
    const header = line.match(PATCH_HEADER);
    if (header) { file = clean(header[1]); return; }
    if (SPEC_FILE.test(file) && line.startsWith('+') && !line.startsWith('+++') && ONLY.test(line)) {
      hits.push({ file, line: i + 1, text: line.slice(1).trim() });
    }
  });
}

// Each object that names a file scopes its own text fields, so multi-file edits are checked per file.
function scan(value, files) {
  if (Array.isArray(value)) { value.forEach((v) => scan(v, files)); return; }
  if (value && typeof value === 'object') {
    const own = Object.entries(value).filter(([k, v]) => PATH_KEY.test(k) && typeof v === 'string').map(([, v]) => clean(v));
    const scope = own.length ? own : files;
    for (const [k, v] of Object.entries(value)) {
      if (PATH_KEY.test(k) || OLD_KEY.test(k)) continue;
      scan(v, scope);
    }
    return;
  }
  if (typeof value !== 'string') return;
  if (/^\*\*\* (?:Begin Patch|Add File|Update File)/m.test(value)) checkPatch(value);
  else checkText(value, files);
}

if (EDIT_TOOL.test(toolName)) scan(args, []);

if (hits.length) {
  const where = hits.map((h) => `  ${h.file}:${h.line}  ${h.text}`).join('\n');
  const reason = [
    'BLOCKED by qamart-ai-testing: this edit adds test.only / describe.only.',
    where,
    '.only silently skips every other test in the run. Remove it and retry. To focus a run use',
    '`npx playwright test <file> -g "<name>"`; to park a failing test use test.fixme() with a BUG comment.',
  ].join('\n');
  process.stderr.write(reason + '\n');
  process.stdout.write(JSON.stringify({ permissionDecision: 'deny', permissionDecisionReason: reason }));
  process.exit(2);
}

process.stdout.write('{}');
