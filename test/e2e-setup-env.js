const { existsSync, readFileSync } = require('fs');
const { join } = require('path');

require('dotenv').config();

const dbUrlFile = join(__dirname, '.e2e-db-url');
if (existsSync(dbUrlFile)) {
  process.env.DATABASE_URL = readFileSync(dbUrlFile, 'utf8').trim();
}

process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'e2e-test-secret';
process.env.JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1d';
process.env.FRONTEND_BASE_URL = process.env.FRONTEND_BASE_URL || 'http://localhost:3000';
process.env.CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:3000';
process.env.UPLOAD_DRIVER = process.env.UPLOAD_DRIVER || 'local';
process.env.MAX_UPLOAD_SIZE_MB = process.env.MAX_UPLOAD_SIZE_MB || '5';
