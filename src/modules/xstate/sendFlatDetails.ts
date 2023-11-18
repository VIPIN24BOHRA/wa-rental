/* eslint-disable no-await-in-loop */
/* eslint-disable no-plusplus */
/* eslint-disable no-promise-executor-return */

import type { CreateMessagePayload } from '../whatsapp/whatsapp';
import { sendMessageToWhatsapp } from '../whatsapp/whatsapp';
import type { UserMetaData } from './machine.types';

const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

export const sendFlatDetails = async (
  flats: any,
  userMetaData: UserMetaData
) => {
  const message2 = `👋 Hello!\n\nHumne aapko kuch options diye hai. Inme se kisi bhi property ka video dekhne ke liye *‘Get Video’* button par click karein.`;

  await sendMessageToWhatsapp({
    phoneNumber: userMetaData.phonenumber,
    type: 'text',
    text: message2,
  });
  await delay(50);
  for (let i = 0; i < flats.length; i++) {
    // console.log('calling ', i);
    const flatdetails = flats[i];
    const message = `*Rooms* - ${flatdetails.tagLine} \n*Rent* - ${
      flatdetails.price
    }\n*Address* - ${flatdetails.address}\n*Floor* - ${
      flatdetails.floorNo
    }\n*For* - ${flatdetails.for}\n*Avalilable from* -  ${new Date(
      flatdetails.availableFrom
    )
      .toDateString()
      .slice(3)}\n*Owner* - ${flatdetails.agentContact}\n*Property Code* - ${
      flatdetails.propertyCode
    }`;
    const payload: CreateMessagePayload = {
      phoneNumber: userMetaData.phonenumber,
      type: 'quick_reply',
      button1Title: 'Get Video',
      quickContentType: 'text',
      quickContentText: message,
      quickContentHeader: '',
      quickContentCaption: '',
      Button1PostBackText: flatdetails.videoAssetId,
    };

    await sendMessageToWhatsapp(payload);
    await delay(50);
  }
};
