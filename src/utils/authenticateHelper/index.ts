import { sendMessageToWhatsapp } from '@/modules/whatsapp/whatsapp';

import { parseMessage } from '../replyHelper/messageParser';

export const authenticateUser = async (messageObj: any) => {
  if (
    messageObj?.type !== 'text' &&
    messageObj?.type !== 'button_reply' &&
    messageObj?.type !== 'list_reply' &&
    messageObj?.type !== 'quick_reply'
  )
    return;
  console.log(messageObj);
  const { phonenumber, message, name } = parseMessage(messageObj);

  console.log(phonenumber, message, name);

  if (message === 'Hi Please log me in to flatdekho') {
    console.log('Message is matching');
  }
  const res = await sendMessageToWhatsapp({
    phoneNumber: '916396623229',
    type: 'text',
    text: 'Hi there! 👋 Your flat dekho adventure awaits! Click on the link below for seamless login',
  });
  console.log(res);
};
