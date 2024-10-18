import { UseFilters, UseGuards } from '@nestjs/common';
import {
  Help,
  InjectBot,
  On,
  Message,
  Start,
  Update,
  Command,
  Ctx,
  Action,
} from 'nestjs-telegraf';
import { Telegraf, Markup } from 'telegraf';
import { TelegramBotService } from './telegram-bot.service';
import { Context } from './interfaces/context.interface';
import { TelegrafExceptionFilter } from './filters/telegraf-exception.filter';
import { TelegramAuthGuard } from './guards/telegram-auth.guard';
import { TelegramUser } from './decorators/telegram-user.decorator';
import { Message as TelegramMessage, User } from 'telegraf/types';
import { isAxiosError } from 'axios';
import { Logger } from '@nestjs/common';
import { UpdatesService } from '../updates/updates.service';

@Update()
@UseFilters(TelegrafExceptionFilter)
export class TelegramBotUpdate {
  private readonly logger = new Logger(TelegramBotUpdate.name);

  constructor(
    @InjectBot('main')
    private readonly bot: Telegraf<Context>,
    private readonly telegramBotService: TelegramBotService,
    private readonly updatesService: UpdatesService,
  ) {}

  @Start()
  async onStart(@TelegramUser() user: User): Promise<string> {
    this.logger.log(`Start command received from user ${user.id}`);
    let registrationMessage = '';
    try {
      const isRegistered = await this.telegramBotService.isUserRegistered(
        user.id.toString(),
      );
      if (!isRegistered) {
        await this.telegramBotService.registerUser(user);
        registrationMessage = 'Вы успешно зарегистрированы. ';
      } else {
        registrationMessage = 'С возвращением! ';
      }
    } catch (error) {
      if (isAxiosError(error)) {
        if (error.response?.status === 409) {
          registrationMessage = 'С возвращением! ';
        } else if (error.response?.status === 404) {
          await this.telegramBotService.registerUser(user);
          registrationMessage = 'Вы успешно зарегистрированы. ';
        }
      } else {
        console.error('Error during registration:', error);
      }
    }

    const me = await this.bot.telegram.getMe();
    return `Привет, ${user.first_name}! 👋 ${registrationMessage}Я ${me.first_name} - ваш помощник по обновлениям игр. 🎮

Вот что я могу для вас сделать:

🔔 /subscribe - Подписаться на обновления игры
🔕 /unsubscribe - Отписаться от обновлений игры
📋 /list - Показать список ваших подписок
🧹 /clear_history - Очистить историю чата
❓ /help - Получить дополнительную информацию

Выберите команду, чтобы начать!`;
  }

  @Help()
  async onHelp(@TelegramUser() user: User): Promise<string> {
    return `Привет, ${user.first_name}! 👋 Вот подробное описание доступных команд:

🔔 /subscribe - Подписаться на обновления игры
   Получайте уведомления о новых патчах и обновлениях

🔕 /unsubscribe - Отписаться от обновлений игры
   Прекратите получать уведомления об определенной игре

📋 /list - Показать список ваших подписок
   Просмотрите все игры, на которые вы подписаны

🧹 /clear_history - Очистить историю чата
   Удалите предыдущие сообщения для конфиденциальности

Если у вас есть вопросы или нужна дополнительная помощь, не стесняйтесь спрашивать!`;
  }

  @Command('admin')
  @UseGuards(TelegramAuthGuard)
  onAdminCommand(@TelegramUser() user: User): string {
    return `Добро пожаловать, администратор ${user.first_name}`;
  }

  @Command('subscribe')
  async onSubscribe(
    @TelegramUser() user: User,
    @Ctx() ctx: Context,
  ): Promise<void> {
    // Замените 'your_mini_app_url' на фактический URL вашего мини-приложения
    const miniAppUrl = 'https://mini-app.updateio.dev';

    const keyboard = Markup.inlineKeyboard([
      Markup.button.webApp('Открыть подписки', miniAppUrl),
    ]);

    await ctx.reply(
      'Нажмите кнопку ниже, чтобы открыть мини-приложение для подписки на игры:',
      keyboard,
    );
  }

  @Command('unsubscribe')
  async onUnsubscribe(
    @TelegramUser() user: User,
    @Ctx() ctx: Context,
  ): Promise<void> {
    const miniAppUrl = 'https://mini-app.updateio.dev';

    const keyboard = Markup.inlineKeyboard([
      Markup.button.webApp('Открыть подписки', miniAppUrl),
    ]);

    await ctx.reply(
      'Нажмите кнопку ниже, чтобы открыть мини-приложение для того, чтобы отписаться:',
      keyboard,
    );
  }

  @Command('list')
  async onList(@TelegramUser() user: User, @Ctx() ctx: Context): Promise<void> {
    const miniAppUrl = 'https://mini-app.updateio.dev';

    const keyboard = Markup.inlineKeyboard([
      Markup.button.webApp('Открыть подписки', miniAppUrl),
    ]);

    await ctx.reply(
      'Нажмите кнопку ниже, чтобы открыть мини-приложение для того, чтобы увидеть подписки:',
      keyboard,
    );
  }

  @Command('clear_history')
  async onClearHistory(
    @TelegramUser() user: User,
    @Ctx() ctx: Context,
  ): Promise<void> {
    const confirmationKeyboard = Markup.inlineKeyboard([
      Markup.button.callback('Да, очистить историю', 'confirm_clear_history'),
      Markup.button.callback('Нет, отмена', 'cancel_clear_history'),
    ]);

    await ctx.reply(
      `${user.first_name}, вы уверены, что хотите очистить историю чата?`,
      confirmationKeyboard,
    );
  }

  @On('text')
  onMessage(
    @TelegramUser() user: User,
    @Message() message: TelegramMessage,
  ): void {
    console.log(`Сообщение от ${user.first_name}:`, message.chat);
  }

  @Action(/^pn_/)
  async onUpdateButtonClick(@Ctx() ctx: Context) {
    if (
      'data' in ctx.callbackQuery &&
      typeof ctx.callbackQuery.data === 'string' &&
      ctx.callbackQuery.message &&
      'text' in ctx.callbackQuery.message
    ) {
      const [, gameId, appId] = ctx.callbackQuery.data.split('_');
      const userId = ctx.from.id.toString();

      try {
        await this.updatesService.handleUpdateButtonClick(
          userId,
          gameId,
          appId,
        );

        await ctx.answerCbQuery('Запрос на обновление отправлен');

        // Получаем оригинальный текст сообщения
        const originalMessage = ctx.callbackQuery.message.text;

        // Добавляем сноску о запуске обновления
        const updatedMessage = `${originalMessage}\n\n_Запрос на обновление отправлен ${new Date().toLocaleString()}_`;

        // Редактируем сообщение, убирая кнопку
        await ctx.editMessageText(updatedMessage, { parse_mode: 'Markdown' });
      } catch (error) {
        this.logger.error('Ошибка при обработке запроса на обновление:', error);
        await ctx.answerCbQuery('Произошла ошибка при запросе обновления. Пожалуйста, попробуйте позже.');
        
        // Оставляем кнопку и добавляем сообщение об ошибке
        const errorMessage = `${ctx.callbackQuery.message.text}\n\n_Ошибка: Не удалось запросить обновление. Пожалуйста, попробуйте позже._`;
        await ctx.editMessageText(errorMessage, {
          parse_mode: 'Markdown',
          reply_markup: ctx.callbackQuery.message.reply_markup,
        });
      }
    } else {
      this.logger.warn('Некорректный формат callback query или сообщения');
    }
  }
}
