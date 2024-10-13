import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { TelegrafExecutionContext, TelegrafException } from 'nestjs-telegraf';
import { Context } from '../interfaces/context.interface';

@Injectable()
export class TelegramAuthGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const ctx = TelegrafExecutionContext.create(context);
    const { from } = ctx.getContext<Context>();

    if (!from || !from.id) {
      throw new TelegrafException('User information not available.');
    }

    // You can add any additional checks here if needed
    // For now, we'll just return true if the user has an ID
    return true;
  }
}
