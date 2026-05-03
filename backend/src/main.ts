import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const corsOrigins =
    process.env.CLIENT_ORIGIN?.split(',')
      .map((o) => o.trim())
      .filter(Boolean) ?? [];
  app.enableCors({
    origin: corsOrigins.length > 0 ? corsOrigins : ['http://localhost:3000'],
    credentials: true,
  });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );
  const port = Number.parseInt(process.env.PORT ?? '4000', 10);
  const host = process.env.HOST ?? '0.0.0.0';
  await app.listen(port, host);
  console.log(`API listening on http://${host}:${port}`);
}

void bootstrap().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
