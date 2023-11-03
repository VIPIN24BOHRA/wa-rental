/* eslint-disable jest/no-commented-out-tests */
import console from 'console';
import process from 'process';

import type { CreateMessagePayload } from './whatsapp';
import { sendMessageToWhatsapp } from './whatsapp';

require('dotenv').config({
  path: '.env.local',
});

jest.setTimeout(20000);
const { TEST_PHONE_NUMBER } = process.env;

describe('Whatsapp Tests', () => {
  describe('send various messages', () => {
    it('should send hello_world template', async () => {
      const payload: CreateMessagePayload = {
        phoneNumber: TEST_PHONE_NUMBER,
        type: 'text',
        text: 'hello World',
      };
      const res = await sendMessageToWhatsapp(payload);
      console.log(res);
      expect(res).not.toEqual(null);
    });

    it('should send text hello with 1 button', async () => {
      const payload: CreateMessagePayload = {
        phoneNumber: TEST_PHONE_NUMBER,
        type: 'quick_reply',
        button1Title: 'OK',
        quickContentType: 'text',
        quickContentText: 'hello world! how are you',
      };

      const res = await sendMessageToWhatsapp(payload);
      console.log(res);
      expect(res).not.toEqual(null);
    });

    it('should send text hello with 2 buttons', async () => {
      const message = `this is message`;

      const payload: CreateMessagePayload = {
        phoneNumber: TEST_PHONE_NUMBER,
        type: 'quick_reply',
        button1Title: 'YES',
        button2Title: 'NO',
        quickContentType: 'text',
        quickContentText: message,
        quickContentHeader: 'this is header',
        quickContentCaption: 'this is caption',
      };

      const res = await sendMessageToWhatsapp(payload);
      console.log(res);
      expect(res).not.toEqual(null);
    });

    it('should send video with message body and one button', async () => {
      const message = `this is message`;

      const payload: CreateMessagePayload = {
        phoneNumber: TEST_PHONE_NUMBER,
        type: 'quick_reply',
        quickContentText: message,
        quickContentType: 'video',
        button1Title: 'cancel',
        quickContentUrl:
          'https://video.gumlet.io/64b7a399964ce62040a7baf7/6542484d411da17d32fa2388/main.m3u8',
        quickContentCaption: 'this is caption',
      };
      const res = await sendMessageToWhatsapp(payload);
      console.log(res);
      expect(res).not.toEqual(null);
    });

    it('should send list with message body', async () => {
      const message = `this is message`;

      const payload: CreateMessagePayload = {
        phoneNumber: TEST_PHONE_NUMBER,
        type: 'list',
        sectionTitle: '',
        title: '',
        body: message,
        listButtonTitle: 'main menu',
        listDescription1: 'this is description',
        listTitle1: 'item 1 for saling',
        listDescription2: 'this is description',
        listTitle2: 'item 2 for saling',
        listDescription3: 'this is description',
        listTitle3: 'item 3 for to let',
      };
      const res = await sendMessageToWhatsapp(payload);
      console.log(res);
      expect(res).not.toEqual(null);
    });
  });
});
