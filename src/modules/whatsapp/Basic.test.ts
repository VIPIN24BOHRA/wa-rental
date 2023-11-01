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
      const message = `👋 Welcome to Secret App!\n\nShare secrets with your friends anonymously! 👫\n\nYour secret will be anonymously forwarded to a group of your choice without revealing your identity. \n🙋 send “help” for more details. \n\n1️⃣Send Message: Send a secret message 📝💬 in your groups.\n 2️⃣My Groups: See all the groups you can send secret messages to.\n3️⃣New Group: Add the option to send secret message to a new group.`;

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
      const message = `👋 Enable Secret Message Sharing 🔒\n\n 1. 📝 Save the provided contact as "Secret App" in your phone's contacts.\n 2. Tap 👥 "Add Participants" inside the group and choose "Secret App" from the contact list.\n 3. If not admin, please ask group admin to add "Secret App" contact.😊`;

      const payload: CreateMessagePayload = {
        phoneNumber: TEST_PHONE_NUMBER,
        type: 'quick_reply',
        quickContentText: message,
        quickContentType: 'video',
        button1Title: 'cancel',
        quickContentUrl: 'https://secretapp.net/assets/videos/adminVideo.mp4',
        quickContentCaption: 'this is caption',
      };
      const res = await sendMessageToWhatsapp(payload);
      console.log(res);
      expect(res).not.toEqual(null);
    });

    it('should send list with message body', async () => {
      const message = `👋inside the group and choose "Secret App" from the contact list.\n 3. If not admin, please ask group admin to add "Secret App" contact.😊`;

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
