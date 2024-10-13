import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { TelegrafExecutionContext } from 'nestjs-telegraf';
import { Context } from '../interfaces/context.interface';

export const TelegramSession = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const telegrafContext = TelegrafExecutionContext.create(ctx);
    const context = telegrafContext.getContext<Context>();

    if (!context.session) {
      throw new Error('Session is not available');
    }

    return context.session;
  },
);
