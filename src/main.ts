import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { allowedOrigins, appConfig } from './common/config/app.config';
import { NestExpressApplication } from '@nestjs/platform-express';
import helmet from 'helmet';
import { swaggerConfig } from './common/config/swagger.config';
import { SwaggerModule } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  /* Security */
  app
    .use(helmet())
    .use(cookieParser())
    .enableCors({
      ...appConfig.cors,
      origin: (origin, callback) => {
        if (allowedOrigins.includes(origin) || !origin) {
          callback(null, true);
        } else {
          callback(new Error('Not allowed by CORS'));
        }
      },
    });

  app.setGlobalPrefix(appConfig.apiPrefix);

  /* Swagger */
  const document = SwaggerModule.createDocument(
    app,
    swaggerConfig.documentBuilder,
  );
  SwaggerModule.setup(swaggerConfig.path, app, document);

  /* Start server */
  await app.listen(appConfig.port, appConfig.host, () => {
    console.log(
      `[Telegram Bot] Server is running on ${appConfig.host}:${appConfig.port}`,
    );
  });
}
bootstrap();
