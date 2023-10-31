import console from 'console';
import process from 'process';

import type { ICreateMessagePayload } from './whatsapp';
import { sendMessageToWhatsapp } from './whatsapp';

require('dotenv').config({
  path: '.env.local',
});

console.log(process.env.WHATSAPP_TOKEN);
jest.setTimeout(20000);
const { TEST_PHONE_NUMBER } = process.env;

describe('Whatsapp Tests', () => {
  describe('send various messages', () => {
    it('should send hello_world template', async () => {
      const payload: ICreateMessagePayload = {
        phoneNumber: TEST_PHONE_NUMBER,
        template: true,
        templateName: 'hello_world',
        templateLanguageCode: 'en_US',
      };

      const res = await sendMessageToWhatsapp(payload);
      console.log(res);
      expect(res).not.toEqual(null);
    });

    it('should send text hello', async () => {
      const message = `🤔: What is Secret App?\n✅: 🤫 Secret App is an anonymous messaging service for WhatsApp.\n\n🤔: How does it work?\n👍: 📲 Send a message to the WhatsApp bot, 🙋‍♂️ add a number to your group, and start sharing secrets anonymously.🎥 Watch our tutorial videos for admins or members for more details.\n\n🤔: How much does it cost?\n💯: 💸 It's absolutely free! Upgrade to our premium plan for additional features and benefits.`;
      const payload: ICreateMessagePayload = {
        phoneNumber: TEST_PHONE_NUMBER,
        text: true,
        msgBody: message,
      };

      const res = await sendMessageToWhatsapp(payload);
      console.log(res);
      expect(res).not.toEqual(null);
    });

    it('should send text hello with 1 button', async () => {
      const payload: ICreateMessagePayload = {
        phoneNumber: TEST_PHONE_NUMBER,
        quickReply: true,
        button1: 'OK',
        msgBody: 'Hello World!',
      };

      const res = await sendMessageToWhatsapp(payload);
      console.log(res);
      expect(res).not.toEqual(null);
    });

    it('should send text hello with 2 buttons', async () => {
      const message = `👋 Welcome to Secret App!\n\nShare secrets with your friends anonymously! 👫\n\nYour secret will be anonymously forwarded to a group of your choice without revealing your identity. \n🙋 send “help” for more details. \n\n1️⃣Send Message: Send a secret message 📝💬 in your groups.\n 2️⃣My Groups: See all the groups you can send secret messages to.\n3️⃣New Group: Add the option to send secret message to a new group.`;

      const payload: ICreateMessagePayload = {
        phoneNumber: TEST_PHONE_NUMBER,
        quickReply: true,
        button1: 'YES',
        button2: 'NO',
        msgBody: message,
      };

      const res = await sendMessageToWhatsapp(payload);
      console.log(res);
      expect(res).not.toEqual(null);
    });

    it('should send contact number', async () => {
      const payload: ICreateMessagePayload = {
        phoneNumber: TEST_PHONE_NUMBER,
        contact: true,
        contactFirstName: 'full name',
        contactFullName: 'first name',
        contactPhoneNumber: '911234567898',
      };

      const res = await sendMessageToWhatsapp(payload);
      console.log(res);
      expect(res).not.toEqual(null);
    });

    it('should send video with message body and one button', async () => {
      const message = `👋 Enable Secret Message Sharing 🔒\n\n 1. 📝 Save the provided contact as "Secret App" in your phone's contacts.\n 2. Tap 👥 "Add Participants" inside the group and choose "Secret App" from the contact list.\n 3. If not admin, please ask group admin to add "Secret App" contact.😊`;

      const payload: ICreateMessagePayload = {
        phoneNumber: TEST_PHONE_NUMBER,
        quickReply: true,
        msgBody: message,
        button1: 'cancel',
        videoHeader: true,
        videoLink: 'https://secretapp.net/assets/videos/adminVideo.mp4',
      };
      const res = await sendMessageToWhatsapp(payload);
      console.log(res);
      expect(res).not.toEqual(null);
    });

    it('should send image with message body and two buttons', async () => {
      const payload: ICreateMessagePayload = {
        phoneNumber: TEST_PHONE_NUMBER,
        quickReply: true,
        button1: 'YES',
        button2: 'NO',
        imageHeader: true,
        imageLink: 'https://secretapp.net/assets/images/logo.png',
        msgBody:
          "📨 Hey there!\n\nPlease send group invite link so that secret message sharing can be enabled in your group in no time! 🚀💫\n\n Or 🔒 Select Manual option if you don't have invite link.\n\n  🌐👥",
      };
      const res = await sendMessageToWhatsapp(payload);
      console.log(res);
      expect(res).not.toEqual(null);
    });
  });

  // it('should send video', async () => {
  //   const payload: ICreateMessagePayload = {
  //     phoneNumber: TEST_PHONE_NUMBER,
  //     video: true,
  //     videoLink:
  //       'https://firebasestorage.googleapis.com/v0/b/connectsapp-248c9.appspot.com/o/vedios%2Fyoutube%2FZDs97NqZvEI.mp4?alt=media&token=71eb6480-73e8-4c02-8f69-1fed0801a5db',
  //   };
  //   const res = await sendMessageToWhatsapp(payload);
  //   console.log(res);
  //   expect(res).not.toEqual(null);
  // });
});
