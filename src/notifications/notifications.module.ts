import { Module } from '@nestjs/common';
import { TelegramBotModule } from '../telegram-bot/telegram-bot.module';
import { NotificationsService } from './notifications.service';
import { ConfigService } from '@nestjs/config';
import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq';
import { UpdatesModule } from 'src/updates/updates.module';

@Module({
  imports: [
    TelegramBotModule,
    UpdatesModule,
    RabbitMQModule.forRootAsync(RabbitMQModule, {
      useFactory: (configService: ConfigService) => ({
        uri: configService.get('RABBITMQ_URI'),
        exchanges: [
          {
            name: 'subscriptions',
            type: 'topic',
          },
          {
            name: 'notifications',
            type: 'topic',
          },
        ],
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [NotificationsService],
  exports: [NotificationsService],
})
export class NotificationsModule {}
