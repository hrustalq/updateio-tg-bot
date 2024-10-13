import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { TelegrafExecutionContext } from 'nestjs-telegraf';
import { Context } from '../interfaces/context.interface';
import { User } from 'telegraf/typings/core/types/typegram';

export const TelegramUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): User => {
    const telegrafContext = TelegrafExecutionContext.create(ctx);
    const context = telegrafContext.getContext<Context>();

    const telegramUser =
      context.from || context.message?.from || context.callbackQuery?.from;

    if (!telegramUser) {
      throw new Error('User information not available');
    }

    return telegramUser;
  },
);
