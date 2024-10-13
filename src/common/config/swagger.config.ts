import { DocumentBuilder } from '@nestjs/swagger';

export const swaggerConfig = {
  documentBuilder: new DocumentBuilder()
    .setTitle(process.env.TELEGRAM_BOT_SWAGGER_TITLE || 'API Documentation')
    .setDescription(
      process.env.TELEGRAM_BOT_SWAGGER_DESCRIPTION ||
        'API documentation for the application',
    )
    .setVersion(process.env.TELEGRAM_BOT_SWAGGER_VERSION || '1.0')
    .addBearerAuth()
    .build(),
  path: process.env.TELEGRAM_BOT_SWAGGER_PATH || '/api/docs',
};
