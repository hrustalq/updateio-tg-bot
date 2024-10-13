import { Injectable, Logger } from '@nestjs/common';
import { TelegramBotService } from 'src/telegram-bot/telegram-bot.service';
import { RabbitSubscribe, AmqpConnection } from '@golevelup/nestjs-rabbitmq';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    private readonly telegramBotService: TelegramBotService,
    private readonly amqpConnection: AmqpConnection,
  ) {}

  @RabbitSubscribe({
    exchange: 'subscriptions',
    routingKey: 'subscription.created',
    queue: 'subscription-created-queue',
  })
  async handleSubscriptionCreated(data: {
    userId: string;
    game: { id: string; name: string };
    app: { id: string; name: string };
    isSubscribed: boolean;
  }) {
    this.logger.log(
      `Received subscription created event for user ${data.userId}`,
    );
    try {
      const message = this.createSubscriptionMessage(data, true);
      // Используем sendMessageToUser вместо sendMessageWithUpdateButton
      await this.telegramBotService.sendMessageToUser(+data.userId, message);
      this.logger.log(
        `Subscription created notification sent to user ${data.userId}`,
      );
    } catch (error) {
      this.logger.error('Error handling subscription created event:', error);
    }
  }

  @RabbitSubscribe({
    exchange: 'subscriptions',
    routingKey: 'subscription.removed',
    queue: 'subscription-removed-queue',
  })
  async handleSubscriptionRemoved(data: {
    userId: string;
    game: { id: string; name: string };
    app: { id: string; name: string };
  }) {
    this.logger.log(
      `Received subscription removed event for user ${data.userId}`,
    );
    try {
      const message = this.createSubscriptionMessage(data, false);
      await this.telegramBotService.sendMessageToUser(+data.userId, message);
      this.logger.log(
        `Subscription removed notification sent to user ${data.userId}`,
      );
    } catch (error) {
      this.logger.error('Error handling subscription removed event:', error);
    }
  }

  @RabbitSubscribe({
    exchange: 'subscriptions',
    routingKey: 'subscription.updated',
    queue: 'subscription-updated-queue',
  })
  async handleSubscriptionUpdated(data: {
    userId: string;
    game: { id: string; name: string };
    app: { id: string; name: string };
    isSubscribed: boolean;
  }) {
    this.logger.log(
      `Received subscription updated event for user ${data.userId}`,
    );
    try {
      const message = this.createSubscriptionMessage(data, data.isSubscribed);
      await this.telegramBotService.sendMessageToUser(+data.userId, message);
      this.logger.log(
        `Subscription updated notification sent to user ${data.userId}`,
      );
    } catch (error) {
      this.logger.error('Error handling subscription updated event:', error);
    }
  }

  private createSubscriptionMessage(
    data: {
      game: { id: string; name: string };
      app: { id: string; name: string };
    },
    isSubscribed: boolean,
  ): string {
    const action = isSubscribed ? 'подписались на' : 'отписались от';
    return `
<b>${isSubscribed ? 'Поздравляем!' : 'Уведомление:'} Вы успешно ${action} обновления.</b>

🎮 <b>Игра:</b> ${data.game.name}
📱 <b>Приложение:</b> ${data.app.name}

${
  isSubscribed
    ? 'Вы будете получать уведомления о новых обновлениях для этой игры в данном приложении.'
    : 'Вы больше не будете получать уведомления о новых обновлениях для этой игры в данном приложении.'
}
`;
  }

  async sendUpdateNotification(dto: {
    userId: string;
    newsId: string;
    game: { name: string };
    title: string;
    content: string;
  }) {
    try {
      const message = this.formatUpdateMessage(dto);
      // Используем более короткий идентификатор для callback_data
      const callbackData = `vu_${dto.newsId.slice(0, 16)}`;
      await this.telegramBotService.sendMessageWithUpdateButton(
        dto.userId,
        message,
        callbackData,
        'Markdown',
      );

      return {
        success: true,
        message: 'Update notification sent successfully',
      };
    } catch (error) {
      this.logger.error('Error sending update notification:', error);
      throw error;
    }
  }

  private formatUpdateMessage(news: {
    game: { name: string };
    title: string;
    content: string;
  }): string {
    return `
🎮 *Обновление для игры ${news.game.name}*

*${news.title}*

${news.content}

    `;
  }

  @RabbitSubscribe({
    exchange: 'notifications',
    routingKey: 'patch-note.notification',
    queue: 'patch-note-notification-queue',
  })
  async handlePatchNoteNotification(data: {
    app: { id: string; name: string };
    game: { id: string; name: string };
    recipients: string[];
    patchNoteId: string;
  }) {
    this.logger.log(
      `Received patch note notification for game ${data.game.name}`,
    );
    try {
      for (const userId of data.recipients) {
        const message = this.createPatchNoteMessage(data);
        const callbackData = `pn_${data.patchNoteId}_${data.game.name}_${data.app.name}`;
        await this.telegramBotService.sendMessageWithUpdateButton(
          userId,
          message,
          callbackData,
          'Markdown',
        );
      }
      this.logger.log(
        `Patch note notifications sent to ${data.recipients.length} users`,
      );
    } catch (error) {
      this.logger.error('Error handling patch note notification:', error);
    }
  }

  private createPatchNoteMessage(data: {
    app: { id: string; name: string };
    game: { id: string; name: string };
    patchNoteId: string;
  }): string {
    return `
🎮 *Новое обновление для игры ${data.game.name}*
📱 *Приложение: ${data.app.name}*

Доступно новое обновление для игры *${data.game.name}* в приложении *${data.app.name}*.

Нажмите кнопку "Обновить" ниже, чтобы запустить процесс обновления на вашем устройстве.
    `;
  }

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
