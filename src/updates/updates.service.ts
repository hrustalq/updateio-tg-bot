import { Injectable, Logger } from '@nestjs/common';
import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class UpdatesService {
  private readonly logger = new Logger(UpdatesService.name);
  private readonly apiUrl: string;
  private readonly apiKey: string;

  constructor(
    private readonly amqpConnection: AmqpConnection,
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.apiUrl = this.configService.get<string>('API_URL');
    this.apiKey = this.configService.getOrThrow<string>('API_KEY');
    this.httpService.axiosRef.defaults.headers.Authorization = `apiKey ${this.apiKey}`;
  }

  async handleUpdateButtonClick(
    userId: string,
    gameId: string,
    appId: string,
  ): Promise<void> {
    try {
      const updateId = await this.requestUpdate(gameId, appId, userId);
      const updateCommand = await this.getUpdateCommand(appId, gameId);

      await this.amqpConnection.publish('updates', 'update.requested', {
        id: updateId,
        appId,
        gameId,
        userId,
        source: 'API',
        updateCommand,
      });

      this.logger.log(
        `Update request sent for user ${userId}, game ${gameId}, app ${appId}, update ${updateId}`,
      );
    } catch (error) {
      this.logger.error('Error handling update button click:', error);
      throw error;
    }
  }

  private async requestUpdate(
    gameId: string,
    appId: string,
    userId: string,
  ): Promise<string> {
    try {
      const response = await firstValueFrom(
        this.httpService.post(`${this.apiUrl}/updates/request_system`, {
          gameId,
          appId,
          userId,
        }),
      );
      return response.data.id;
    } catch (error) {
      console.error({ error });
      this.logger.error('Error requesting update:', error);
      throw error;
    }
  }

  private async getUpdateCommand(
    appId: string,
    gameId: string,
  ): Promise<string> {
    try {
      const response = await firstValueFrom(
        this.httpService.get(
          `${this.apiUrl}/settings/?appId=${appId}&gameId=${gameId}`,
        ),
      );
      return response.data.data[0].updateCommand;
    } catch (error) {
      this.logger.error('Error fetching update command:', error);
      throw error;
    }
  }
}
