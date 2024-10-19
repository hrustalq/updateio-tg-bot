import { Injectable, Logger } from '@nestjs/common';
import { TelegramBotService } from 'src/telegram-bot/telegram-bot.service';
import { RabbitSubscribe } from '@golevelup/nestjs-rabbitmq';
import { createId } from '@paralleldrive/cuid2';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    private readonly telegramBotService: TelegramBotService,
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
      // Используем более корокий идентификатор для callback_data
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
  }) {
    this.logger.log(
      `Received patch note notification for game ${data.game.name}`,
    );
    try {
      for (const userId of data.recipients) {
        const message = this.createPatchNoteMessage(data);
        const updateId = createId();
        const callbackData = `p_${updateId}`;
        const chat = await this.telegramBotService.getChatWithUser(Number(userId));
        const messageId = await this.telegramBotService.sendMessageWithUpdateButton(
          chat.id,
          message,
          callbackData,
          'Markdown',
        );
        // Сохраняем контекст обновления
        await this.telegramBotService.saveUpdateContext(updateId, {
          userId: userId,
          chatId: chat.id,
          gameId: data.game.id,
          appId: data.app.id,
          gameName: data.game.name,
          appName: data.app.name,
          messageId: messageId,
          status: 'PENDING',
          originalMessage: message,
        });
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
  }): string {
    return `
🎮 *Обновление для игры ${data.game.name}*
📱 *Приложение: ${data.app.name}*

Доступно обновление для игры *${data.game.name}* в приложении *${data.app.name}*.

Нажмите кнопку "Обновить" ниже, чтобы запустить процесс обновления на вашем устройстве.
    `;
  }

  @RabbitSubscribe({
    exchange: 'updates',
    routingKey: 'update.status',
    queue: 'update-status-queue',
  })
  async handleUpdateStatus(data: {
    id: string;
    userId: string;
    gameId: string;
    appId: string;
    status: string;
    message?: string;
  }) {
    this.logger.log(
      `Received update status for user ${data.userId}, game ${data.gameId}, app ${data.appId}, status: ${data.status}, id: ${data.id}`,
    );
    try {
      const updateContext = await this.telegramBotService.getUpdateContext(data.id);
      if (!updateContext) {
        this.logger.warn(`No context found for update ${data.id}`);
        return;
      }

      const originalMessage = updateContext.originalMessage || '';
      const statusMessage = this.createUpdateStatusMessage(data.status, data.message);
      const updatedMessage = `${originalMessage}\n\n${statusMessage}`;
      
      await this.telegramBotService.editOrSendUpdateStatusMessage(
        data.id, 
        updatedMessage, 
        'Markdown'
      );
      
      this.logger.log(`Update status notification processed for user ${data.userId}, id: ${data.id}`);
    } catch (error) {
      this.logger.error(`Error handling update status notification for id ${data.id}:`, error);
    }
  }

  private createUpdateStatusMessage(status: string, message?: string): string {
    const statusMap = {
      PENDING: '⏳ Ожидание',
      PROCESSING: '🔄 Обработка',
      COMPLETED: '✅ Завершено',
      FAILED: '❌ Ошибка',
    };

    const statusText = statusMap[status as keyof typeof statusMap] || status;
    const currentDate = new Date().toLocaleString('ru-RU', { timeZone: 'Europe/Moscow' });

    let statusMessage = `\n*🔎 Статус обновления:* ${statusText}`;
    if (message) {
      statusMessage += `\n💬 *Сообщение:* ${message}`;
    }
    statusMessage += `\n🕒 *Дата (МСК +3):* ${currentDate}`;

    return statusMessage.trim();
  }
}
