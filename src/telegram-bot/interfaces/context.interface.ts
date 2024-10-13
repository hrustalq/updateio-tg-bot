import { Context as TelegrafContext } from 'telegraf';

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface Context extends TelegrafContext {
  session: {
    updateData?: {
      patchNoteId: string;
      gameName: string;
      appName: string;
    };
  };
}
