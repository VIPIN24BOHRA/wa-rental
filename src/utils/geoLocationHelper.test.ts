import { getLatLongFromAddress } from './geoLocationHelper';

/* eslint-disable jest/no-commented-out-tests */
require('dotenv').config({
  path: '.env.local',
});

jest.setTimeout(20000);

describe('Whatsapp Tests', () => {
  describe('send various messages', () => {
    it('should get the latitude and longitude details using address', async () => {
      const address = 'sector 29, gurugram, India ';
      const details = await getLatLongFromAddress(address);
      console.log(details);
      expect(details).not.toEqual(null);
    });
  });
});
