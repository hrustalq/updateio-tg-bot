import { Module } from '@nestjs/common';
import { TelegramBotUpdate } from './telegram-bot.update';
import { TelegramBotService } from './telegram-bot.service';
import { HttpModule } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { UpdatesModule } from 'src/updates/updates.module';

@Module({
  imports: [
    HttpModule.registerAsync({
      useFactory: async (configService: ConfigService) => ({
        baseURL: configService.getOrThrow('API_URL'),
        headers: {
          'Content-Type': 'application/json',
          Authorization: `apiKey ${configService.getOrThrow('API_KEY')}`,
        },
      }),
      inject: [ConfigService],
    }),
    UpdatesModule,
  ],
  providers: [TelegramBotUpdate, TelegramBotService],
  exports: [TelegramBotService],
})
export class TelegramBotModule {}
