import { whatsappStateTransition } from '@/modules/xstate';
import type { UserMetaData } from '@/modules/xstate/machine.types';

import { parseMessage } from './messageParser';

export const replyToUser = async (messageObj: any) => {
  const { phonenumber, message, name } = parseMessage(messageObj);
  const newState = await whatsappStateTransition(
    { type: 'text', text: message },
    { state: '', name, phonenumber } as UserMetaData
  );
  console.log(newState);
};
