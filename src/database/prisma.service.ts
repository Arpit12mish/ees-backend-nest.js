import { readFileSync } from 'node:fs';
import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

function createPrismaAdapter(): PrismaPg {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error('DATABASE_URL is required');
  }

  const url = new URL(databaseUrl);

  // These are Prisma/libpq-style options, not PostgreSQL server parameters.
  url.searchParams.delete('schema');
  url.searchParams.delete('sslmode');

  const caPath = process.env.DATABASE_SSL_CA_PATH;

  return new PrismaPg({
    connectionString: url.toString(),
    ...(caPath
      ? {
          ssl: {
            ca: readFileSync(caPath, 'utf8'),
            rejectUnauthorized: true,
          },
        }
      : {}),
  });
}

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor() {
    super({ adapter: createPrismaAdapter() });
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
