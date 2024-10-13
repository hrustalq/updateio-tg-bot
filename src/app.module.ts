import { Module, ValidationPipe } from '@nestjs/common';
import { APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { ThrottlerModule } from '@nestjs/throttler';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { session } from 'telegraf';
import { TelegrafModule } from 'nestjs-telegraf';
import { TelegramBotModule } from './telegram-bot/telegram-bot.module';
import { NotificationsModule } from './notifications/notifications.module';
import { UpdatesModule } from './updates/updates.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        throttlers: [
          {
            name: 'global',
            ttl: configService.get('THROTTLER_TTL') || 60,
            limit: configService.get('THROTTLER_LIMIT') || 10,
          },
        ],
      }),
      inject: [ConfigService],
    }),
    TelegrafModule.forRootAsync({
      botName: 'main',
      useFactory: async (configService: ConfigService) => ({
        token: configService.getOrThrow<string>('TELEGRAM_BOT_TOKEN'),
        include: [TelegramBotModule],
        middlewares: [session()],
      }),
      inject: [ConfigService],
    }),
    TelegramBotModule,
    NotificationsModule,
    UpdatesModule,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_PIPE,
      useClass: ValidationPipe,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
  ],
})
export class AppModule {}
