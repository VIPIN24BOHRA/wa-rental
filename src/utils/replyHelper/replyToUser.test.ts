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
        id: 'ABEGkWOWYjIpAhBd_PegE8JFRybrLeWH_QE2',
        source: '916396623229',
        type: 'text',
        payload: {
          title: '',
          id: '',
          text: 'Stop ',
        },
        sender: {
          phone: '916396623229',
          name: 'vipin bohra',
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
