import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { AppLogger } from './logger/logger.service';
import { HttpExceptionFilter } from './common/exception.filter';
import { RequestContextInterceptor } from './common/request-context.interceptor';
import cookieParser from 'cookie-parser';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
  });
  app.use(cookieParser());

  const logger = app.get(AppLogger);

  app.useLogger(logger);

  app.setGlobalPrefix('api');

  app.enableCors({
    origin: process.env.CORS_ORIGIN?.split(',').map((origin) =>
      origin.trim(),
    ),
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  app.useGlobalFilters(new HttpExceptionFilter());

  app.useGlobalInterceptors(
    new RequestContextInterceptor(logger),
  );

  const swaggerConfig = new DocumentBuilder()
    .setTitle('CareerBridge Nigeria API')
    .setDescription(
      'Backend API for the CareerBridge Nigeria mentorship and career-guidance platform.',
    )
    .setVersion('1.0')
    .addBearerAuth(
    {
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT',
      description: 'Enter your JWT access token'
    },
    'access-token',
    )
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);

  SwaggerModule.setup('docs', app, document);

  const port = Number(process.env.PORT ?? 3000);

  await app.listen(port);

  logger.log(
    `CareerBridge API running on http://localhost:${port}`,
    'Bootstrap',
  );

  logger.log(
    `Swagger documentation available at http://localhost:${port}/docs`,
    'Bootstrap',
  );
}

void bootstrap();