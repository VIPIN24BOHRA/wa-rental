import {
  getAddressFromLatLng,
  getLatLongFromAddress,
} from './geoLocationHelper';

/* eslint-disable jest/no-commented-out-tests */
/* eslint-disable no-console */
require('dotenv').config({
  path: '.env.local',
});

jest.setTimeout(20000);

describe('Whatsapp Tests', () => {
  describe('send various messages', () => {
    it('should get the latitude and longitude details using address', async () => {
      const address = '56';
      const details = await getLatLongFromAddress(address);
      console.log(details);
      expect(details).not.toEqual(null);
    });

    it('should get the Address details using lat lng', async () => {
      const details = await getAddressFromLatLng(
        '77.05590439999999',
        '28.432584449999997'
      );
      console.log(details);
      expect(details).not.toEqual(null);
    });
  });
});
