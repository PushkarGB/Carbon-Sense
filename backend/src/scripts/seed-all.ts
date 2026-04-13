/**
 * Orchestrator: runs all seed scripts in sequence as child processes.
 * Usage: npx ts-node src/scripts/seed-all.ts
 *   or:  npm run seed
 *
 * Each sub-script manages its own MongoDB connection independently.
 * Running them as separate child processes avoids shared-connection race conditions.
 */
import { execSync } from 'child_process';
import * as path from 'path';

const scripts = [
  { name: 'Seeding badges', file: 'seed-badges.ts' },
  { name: 'Seeding task templates', file: 'seed-task-templates.ts' },
  { name: 'Seeding emission factors', file: 'seed-emission-factors.ts' },
];

console.log('=== CarbonSense — Seed All ===\n');

for (let i = 0; i < scripts.length; i++) {
  const script = scripts[i];
  const scriptPath = path.resolve(__dirname, script.file);
  console.log(`--- [${i + 1}/${scripts.length}] ${script.name} ---`);

  try {
    execSync(`npx ts-node "${scriptPath}"`, {
      cwd: path.resolve(__dirname, '../..'),
      stdio: 'inherit',
      env: process.env,
    });
  } catch (error) {
    console.error(`\n❌ ${script.name} failed!`);
    process.exit(1);
  }

  console.log('');
}

console.log('=== All seeds complete ===');
