import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { InjectBot } from 'nestjs-telegraf';
import { Telegraf } from 'telegraf';
import { Context } from './interfaces/context.interface';
import { ChatFromGetChat, ParseMode, User } from '@telegraf/types';
import { HttpService } from '@nestjs/axios';
import { AxiosInstance } from 'axios';
import { ConfigService } from '@nestjs/config';
import { Markup } from 'telegraf';

@Injectable()
export class TelegramBotService implements OnModuleInit {
  private readonly logger = new Logger(TelegramBotService.name);
  private readonly apiClient: AxiosInstance;

  constructor(
    @InjectBot('main')
    private readonly bot: Telegraf<Context>,
    private readonly httpService: HttpService,
    private configService: ConfigService,
  ) {
    this.apiClient = this.httpService.axiosRef;
  }

  async onModuleInit() {
    await this.setCommands();
  }

  private async setCommands(): Promise<void> {
    const commands = [
      { command: 'start', description: 'Начать работу с ботом' },
      { command: 'help', description: 'Показать справочную информацию' },
      { command: 'subscribe', description: 'Подписаться на обновления игры' },
      { command: 'unsubscribe', description: 'Отписаться от обновлений игры' },
      { command: 'list', description: 'Показать список ваших подписок' },
    ];

    try {
      await this.bot.telegram.setMyCommands(commands);
      this.logger.log('Команды бота успешно установлены');
    } catch (error) {
      this.logger.error('Ошибка при установке команд бота:', error);
    }
  }

  async registerUser(telegramUser: User): Promise<void> {
    const { id, ...payload } = telegramUser;
    try {
      const response = await this.apiClient.post('/auth/register', {
        id: id.toString(),
        ...payload,
      });
      this.logger.log('Пользователь успешно зарегистрирован:', response.data);
    } catch (error) {
      this.logger.error('Ошибка при регистрации пользователя:', error);
    }
  }

  async isUserRegistered(userId: string): Promise<boolean> {
    try {
      const response = await this.apiClient.get(`/users/${userId}`);
      return response.data.id !== null;
    } catch (error) {
      this.logger.error(
        `Error checking if user is registered: ${error.message}`,
      );
      throw error;
    }
  }

  async sendMessageToUser(
    chatId: number,
    message: string,
    parse_mode: ParseMode = 'HTML',
  ): Promise<void> {
    try {
      await this.bot.telegram.sendMessage(chatId, message, {
        parse_mode,
      });
      this.logger.log(`Message sent to user ${chatId}`);
    } catch (error) {
      this.logger.error(
        `Failed to send message to user with chat ${chatId}:`,
        error.stack,
      );
      throw error;
    }
  }

  async getChatWithUser(userId: number): Promise<ChatFromGetChat> {
    try {
      const chat = await this.bot.telegram.getChat(userId);
      this.logger.log(`Retrieved chat for user ${userId}`);
      return chat;
    } catch (error) {
      this.logger.error(
        `Failed to get chat for user ${userId}: ${error.message}`,
      );
      throw error;
    }
  }

  async sendMessageWithUpdateButton(
    chatId: number | string,
    message: string,
    callbackData: string = 'update',
    parse_mode: ParseMode = 'HTML',
  ): Promise<void> {
    try {
      // Ограничиваем длину callbackData до 64 байт
      const truncatedCallbackData = callbackData.slice(0, 64);

      const keyboard = Markup.inlineKeyboard([
        Markup.button.callback('Обновить', truncatedCallbackData),
      ]);

      await this.bot.telegram.sendMessage(chatId, message, {
        parse_mode,
        ...keyboard,
      });
      this.logger.log(`Message with update button sent to chat ${chatId}`);
    } catch (error) {
      this.logger.error(
        `Failed to send message with update button to chat ${chatId}: ${error.message}`,
      );
      throw error;
    }
  }

  async editMessageWithoutButton(
    chatId: number | string,
    messageId: number,
    newText: string,
    parse_mode: ParseMode = 'Markdown',
  ): Promise<void> {
    try {
      await this.bot.telegram.editMessageText(
        chatId,
        messageId,
        undefined,
        newText,
        {
          parse_mode,
        },
      );
      this.logger.log(
        `Message edited for chat ${chatId}, message ${messageId}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to edit message for chat ${chatId}, message ${messageId}: ${error.message}`,
      );
      throw error;
    }
  }
}
