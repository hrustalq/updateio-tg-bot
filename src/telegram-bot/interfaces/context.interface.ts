import { Context as TelegrafContext } from 'telegraf';

export interface UpdateData {
  userId: string;
  chatId: number;
  gameId: string;
  appId: string;
  gameName: string;
  appName: string;
  messageId: number;
  status: string;
  originalMessage: string;
}

export interface Context extends TelegrafContext {
  session: {
    updates: { [key: string]: UpdateData };
  };
}
