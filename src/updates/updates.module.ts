import { Module } from '@nestjs/common';
import { UpdatesService } from './updates.service';
import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';

@Module({
  providers: [UpdatesService],
  exports: [UpdatesService],
  imports: [
    ConfigModule,
    HttpModule,
    RabbitMQModule.forRootAsync(RabbitMQModule, {
      useFactory: (configService: ConfigService) => ({
        uri: configService.get('RABBITMQ_URI'),
        exchanges: [
          {
            name: 'updates',
            type: 'topic',
          },
        ],
      }),
      inject: [ConfigService],
    }),
  ],
})
export class UpdatesModule {}
