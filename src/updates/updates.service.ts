import { Injectable, Logger } from '@nestjs/common';
import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';

@Injectable()
export class UpdatesService {
  private readonly logger = new Logger(UpdatesService.name);

  constructor(private readonly amqpConnection: AmqpConnection) {}

  async handleUpdateButtonClick(
    userId: string,
    gameName: string,
    appName: string,
  ): Promise<void> {
    try {
      await this.amqpConnection.publish('updates', 'update.requested', {
        userId,
        game: { name: gameName },
        app: { name: appName },
      });

      this.logger.log(
        `Update request sent for user ${userId}, game ${gameName}, app ${appName}`,
      );
    } catch (error) {
      this.logger.error('Error handling update button click:', error);
    }
  }
}
