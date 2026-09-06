import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const scriptPath = new URL('./release-vps.sh', import.meta.url);
const workflowPath = new URL('../.github/workflows/deploy.yml', import.meta.url);

test('VPS release script builds deterministic dependencies and verifies both services', () => {
  const script = fs.readFileSync(scriptPath, 'utf8');

  assert.match(script, /git fetch .*origin main/);
  assert.match(script, /git reset --hard "\$TARGET_SHA"/);
  assert.match(script, /npm ci/);
  assert.match(script, /frontend-next[\s\S]*npm ci/);
  assert.match(script, /npm run build/);
  assert.match(script, /pm2 restart baznas-frontend-next/);
  assert.match(script, /pm2 restart baznas-backend/);
  assert.match(script, /127\.0\.0\.1:3001\/api\/health/);
  assert.match(script, /127\.0\.0\.1:3002\/penyaluran/);
  assert.match(script, /git reset --hard "\$PREVIOUS_SHA"/);
});

test('GitHub workflow validates then invokes the VPS release script instead of copying partial builds', () => {
  const workflow = fs.readFileSync(workflowPath, 'utf8');

  assert.doesNotMatch(workflow, /appleboy\/scp-action/);
  assert.doesNotMatch(workflow, /npm install --omit=dev/);
  assert.match(workflow, /npm ci/);
  assert.match(workflow, /release-vps\.sh/);
  assert.match(workflow, /TARGET_SHA/);
});
