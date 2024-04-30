/* eslint-disable  simple-import-sort/imports */
import { sendMessageToWhatsapp } from '@/modules/whatsapp/whatsapp';
import { createWaNewLoginObj } from '@/modules/firebase/userDB';
import { parseMessage } from '../replyHelper/messageParser';
import { encryptData } from './helper';

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
    const userDetails = {
      phoneNumber: phonenumber,
      name,
      expireAt: Date.now() + 5 * 60 * 1000,
    };
    console.log('this is user data', userDetails);
    const keyObj = await createWaNewLoginObj(userDetails);
    if (keyObj) {
      const encryptKey = encryptData({ ...userDetails, key: keyObj.key });
      console.log('this is encrypted key', encryptKey);
      await sendMessageToWhatsapp({
        phoneNumber: '916396623229',
        type: 'text',
        text: 'Hi there! 👋 Your flat dekho adventure awaits! Click on the link below for seamless login',
      });
      await sendMessageToWhatsapp({
        phoneNumber: '916396623229',
        type: 'text',
        text: `https://flatdekho.co.in/waLogin/${encryptKey}`,
      });
    }
  }
};
