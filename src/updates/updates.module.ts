import { Module } from '@nestjs/common';
import { UpdatesService } from './updates.service';
import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq';
import { ConfigService } from '@nestjs/config';

@Module({
  providers: [UpdatesService],
  exports: [UpdatesService],
  imports: [
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
