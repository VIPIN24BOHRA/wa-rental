/* eslint-disable jest/no-commented-out-tests */
import { replyToUser } from '.';

require('dotenv').config({
  path: '.env.local',
});

jest.setTimeout(20000);

describe('ReplyHelper tests', () => {
  describe('replyToUser', () => {
    it('should send responses', async () => {
      const mockMessage = {
        id: 'ABEGkYaYVSEEAhAL3SLAWwHKeKrt6s3FKB0c',
        source: '918x98xx21x4',
        type: 'text',
        payload: {
          text: 'Get Contact',
        },
        sender: {
          phone: '916396623229',
          name: 'Andy',
          country_code: '91',
          dial_code: '6396623229',
        },
      };

      const res = await replyToUser(mockMessage);
      // eslint-disable-next-line no-console
      console.log(`Result: ${res}`);
      expect(res).not.toEqual(null);
    });
  });
});

// describe('print firebase message', () => {
//   describe('printLastMsg', () => {
//     it('should send Last Msg', async () => {
//       const res = await replyToUser(
//         `${process.env.TEST_PHONE_NUMBER}`,
//         'arabic'
//       );
//       // eslint-disable-next-line no-console
//       console.log(`Quote: ${res}`);
//       expect(res).not.toEqual(null);
//     });
//   });
// });
