const { execFileSync } = require('child_process');
const { writeFileSync } = require('fs');
const { join } = require('path');
const { Client } = require('pg');

require('dotenv').config();

module.exports = async () => {
  const baseUrl = process.env.DATABASE_URL;
  if (!baseUrl) {
    throw new Error('DATABASE_URL is required for e2e tests');
  }

  const schema = process.env.E2E_DB_SCHEMA || 'e2e';
  const url = new URL(baseUrl);
  url.searchParams.set('schema', schema);
  const testDatabaseUrl = url.toString();

  writeFileSync(join(__dirname, '.e2e-db-url'), testDatabaseUrl);

  const adminClient = new Client({ connectionString: baseUrl });
  await adminClient.connect();
  await adminClient.query(`CREATE SCHEMA IF NOT EXISTS "${schema}"`);
  await adminClient.end();

  execFileSync('npx', ['prisma', 'generate'], {
    cwd: join(__dirname, '..'),
    env: { ...process.env, DATABASE_URL: testDatabaseUrl },
    stdio: 'inherit',
  });

  execFileSync('npx', ['prisma', 'migrate', 'deploy'], {
    cwd: join(__dirname, '..'),
    env: { ...process.env, DATABASE_URL: testDatabaseUrl },
    stdio: 'inherit',
  });
};
