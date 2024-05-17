/* eslint-disable  simple-import-sort/imports */
import { sendMessageToWhatsapp } from '@/modules/whatsapp/whatsapp';
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
  const msg = `${message}`;
  if (msg.includes('Hi Please log me in to flatdekho')) {
    const filterData = msg.split('--')[1];
    console.log('this is filterData', filterData);
    if (filterData) {
      const filters = atob(filterData);
      console.log('this is filters', filters);
    }

    const userDetails = {
      phoneNumber: phonenumber,
      name,
      expireAt: Date.now() + 5 * 60 * 1000,
    };
    console.log('this is user data', userDetails);

    const encryptKey = encryptData(userDetails);
    console.log('this is encrypted key', encryptKey);
    await sendMessageToWhatsapp({
      phoneNumber: phonenumber,
      type: 'text',
      text: 'Hi there! 👋 Your flat dekho adventure awaits! Click on the link below for seamless login',
    });
    await sendMessageToWhatsapp({
      phoneNumber: phonenumber,
      type: 'text',
      text: `https://flatdekho.co.in/waLogin/${encodeURIComponent(
        encryptKey
      )}?utm_source=whatsapp_login&mobileId=${phonenumber}`,
    });
  }
};
