function getEnvValue(
  config: Record<string, unknown>,
  key: string,
): string | undefined {
  const value = config[key] ?? process.env[key];

  if (typeof value === 'string') {
    const trimmedValue = value.trim();
    return trimmedValue.length > 0 ? trimmedValue : undefined;
  }

  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }

  return undefined;
}

export function validateEnv(
  config: Record<string, unknown>,
): Record<string, unknown> {
  const nodeEnv = getEnvValue(config, 'NODE_ENV') ?? 'development';

  const required = ['DATABASE_URL'];

  if (nodeEnv === 'production') {
    required.push(
      'JWT_SECRET',
      'ADMIN_DEFAULT_EMAIL',
      'ADMIN_DEFAULT_PASSWORD',
    );
  }

  const uploadDriver = getEnvValue(config, 'UPLOAD_DRIVER') ?? 'local';
  if (uploadDriver === 'r2') {
    required.push(
      'R2_ENDPOINT',
      'R2_ACCESS_KEY_ID',
      'R2_SECRET_ACCESS_KEY',
      'R2_BUCKET',
      'R2_PUBLIC_BASE_URL',
    );
  }
  if (uploadDriver === 's3') {
    required.push(
      'AWS_S3_REGION',
      'AWS_S3_ACCESS_KEY_ID',
      'AWS_S3_SECRET_ACCESS_KEY',
      'AWS_S3_BUCKET',
    );
  }

  const missing = required.filter((key) => !getEnvValue(config, key));

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(
        ', ',
      )}. Check your .env file.`,
    );
  }

  return config;
}
