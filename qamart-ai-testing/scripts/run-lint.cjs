#!/usr/bin/env node
// postToolUse hook: after a spec or Page Object is edited, run the workspace convention lint
// (scripts/lint-specs.cjs) and hand findings back to the agent as additionalContext.
// Non-blocking: always exits 0 and prints {} when clean, when nothing relevant was edited, or on any error.
const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

function main() {
  const event = JSON.parse(fs.readFileSync(0, 'utf8'));
  const toolName = String(event.toolName ?? event.tool_name ?? '');
  let args = event.toolArgs ?? event.tool_input ?? {};
  // A raw patch arrives as a plain string; keep it so its file headers are still read.
  if (typeof args === 'string') { try { args = JSON.parse(args); } catch { /* keep raw text */ } }

  const EDIT_TOOL = /edit|create|write|replace|patch|insert/i;
  const PATH_KEY = /^(path|filepath|file_path|file|uri)$/i;

  const paths = (value, out = []) => {
    if (Array.isArray(value)) value.forEach((v) => paths(v, out));
    else if (value && typeof value === 'object') {
      for (const [k, v] of Object.entries(value)) {
        if (PATH_KEY.test(k) && typeof v === 'string') out.push(v.replace(/^file:\/\//, ''));
        else paths(v, out);
      }
    } else if (typeof value === 'string') {
      for (const m of value.matchAll(/^\*\*\* (?:Add|Update) File:[ \t]*([^\r\n]+)/gm)) out.push(m[1].trim());
    }
    return out;
  };

  const root = path.resolve(event.cwd || process.cwd());
  const edited = EDIT_TOOL.test(toolName)
    ? [...new Set(paths(args).map((p) => path.relative(root, path.resolve(root, p)).split(path.sep).join('/')))]
        .filter((rel) => /\.spec\.ts$/.test(rel) || /^pages\/.+\.ts$/.test(rel))
    : [];

  if (!edited.length || !fs.existsSync(path.join(root, 'scripts', 'lint-specs.cjs'))) return {};

  const lint = spawnSync('node', ['scripts/lint-specs.cjs', ...edited], { cwd: root, encoding: 'utf8', timeout: 60000 });
  if (lint.status === 0) return {};

  const additionalContext = `lint:specs found problems in the file(s) you just edited:\n${(lint.stdout || lint.stderr || '').trim()}`.slice(0, 4000)
    + '\n\nFix these before continuing.';
  return { additionalContext, hookSpecificOutput: { hookEventName: 'PostToolUse', additionalContext } };
}

let result = {};
try { result = main(); } catch { result = {}; }
process.stdout.write(JSON.stringify(result));
process.exit(0);
