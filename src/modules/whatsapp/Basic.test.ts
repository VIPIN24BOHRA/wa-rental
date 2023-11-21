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
        type: 'quick_reply',
        button1Title: 'YES',
        button2Title: 'NO',
        quickContentType: 'text',
        quickContentText:
          'this is long long message \n\n this is long long message \n\n this is long long message \n\n this is long long message \n\n this is long long message \n\n this is long long message \n\n this is long long message \n\n this is long long message \n\n this is long long message \n\n this is long long message \n\n ',
        quickContentHeader: 'this is header',
        quickContentCaption: 'this is caption',
      };
      const res = await sendMessageToWhatsapp(payload);

      expect(res).not.toEqual(null);
    });

    it('should send text hello with 1 button', async () => {
      const payload: CreateMessagePayload = {
        phoneNumber: TEST_PHONE_NUMBER,
        type: 'quick_reply',
        button1Title: 'OK',
        quickContentType: 'text',
        quickContentText: 'hello world! how are you',
        Button1PostBackText: 'hello world',
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

    it('should send video with message body', async () => {
      const message = `this is message`;

      const payload: CreateMessagePayload = {
        phoneNumber: TEST_PHONE_NUMBER,
        type: 'video',
        caption: message,
        url: 'https://video.gumlet.io/64b7a399964ce62040a7baf7/654cd7e3f7f3302c85df6aaf/download.mp4',
        // url: 'https://gumlet-video-user-uploads.s3-accelerate.dualstack.amazonaws.com/gumlet-user-uploads-prod/64b7a399964ce62040a7baf7/64ea5172869c1d6d33b33a36/origin-64ea5172869c1d6d33b33a36?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=AKIA4WNLTXWDGN6RDBVQ%2F20231107%2Fus-west-2%2Fs3%2Faws4_request&X-Amz-Date=20231107T130831Z&X-Amz-Expires=3600&X-Amz-Signature=6aa2335a051401823ea540c510e82d0ab503663c12aca1a831966ae58f0b6b07&X-Amz-SignedHeaders=host&x-id=GetObject',
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
