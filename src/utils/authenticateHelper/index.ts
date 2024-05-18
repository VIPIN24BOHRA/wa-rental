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
    let filterData = msg.split('--')[1];

    console.log('this is filterData', filterData);
    if (filterData) {
      filterData = JSON.parse(atob(filterData));
      console.log('this is filters', filterData);
    }

    const userDetails = {
      phoneNumber: phonenumber,
      name,
      expireAt: Date.now() + 5 * 60 * 1000,
    };
    console.log('this is user data', userDetails);

    const encryptKey = encryptData(userDetails);
    console.log('this is encrypted key', encryptKey);

    const urlData = { filters: filterData ?? '', token: encryptKey };

    console.log(
      'this is encrypted data',
      urlData,
      btoa(JSON.stringify(urlData))
    );

    await sendMessageToWhatsapp({
      phoneNumber: phonenumber,
      type: 'text',
      text: 'Hi there! 👋 Your flat dekho adventure awaits! Click on the link below for seamless login',
    });
    await sendMessageToWhatsapp({
      phoneNumber: phonenumber,
      type: 'text',
      text: `https://flatdekho.co.in/waLogin/1?filtersData=${encodeURIComponent(
        btoa(JSON.stringify(urlData))
      )}?utm_source=whatsapp_login&utm_medium=inbox&mobileId=${phonenumber}`,
    });
  }
};
