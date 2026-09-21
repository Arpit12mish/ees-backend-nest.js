import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';
import { json, urlencoded, static as expressStatic } from 'express';
import { AppModule } from './app.module';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import { applyCacheControlHeaders } from './common/middleware/cache-control.middleware';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  app.use(helmet());
  app.use(
    '/uploads',
    expressStatic('uploads', {
      maxAge: '1y',
      immutable: true,
    }),
  );
  app.use(applyCacheControlHeaders);

  const bodyLimit = configService.get<string>('bodyLimit', '1mb');
  app.use(json({ limit: bodyLimit }));
  app.use(urlencoded({ extended: true, limit: bodyLimit }));

  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const compression = require('compression');
  app.use(compression());

  const corsOrigin = configService.get<string>(
    'corsOrigin',
    'http://localhost:3000',
  );
  const allowedOrigins = corsOrigin
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
  app.enableCors({
    origin: (
      origin: string | undefined,
      callback: (error: Error | null, allow?: boolean) => void,
    ) => {
      if (!origin || allowedOrigins.includes(origin))
        return callback(null, true);
      return callback(new Error('Not allowed by CORS'), false);
    },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    credentials: true,
  });

  app.setGlobalPrefix('api');

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  app.useGlobalFilters(new GlobalExceptionFilter());
  app.useGlobalInterceptors(new ResponseInterceptor());

  const port = configService.get<number>('port', 8080);
  await app.listen(port);
  console.log(`Application running on http://localhost:${port}/api`);
}
void bootstrap();
