import type { MachineContext } from '@/modules/xstate/machine.types';

import { getFlatDetails } from './flatDetailsHelper';

/* eslint-disable jest/no-commented-out-tests */
require('dotenv').config({
  path: '.env.local',
});

jest.setTimeout(20000);

describe('Whatsapp Tests', () => {
  describe('send various messages', () => {
    it('should get the flat details after using user saved state', async () => {
      const userState: MachineContext = {
        longitude: 77.0662896,
        budget: '0 - 20k',
        noOfRooms: 0,
        currentPage: 1,
        latitude: 28.4669058,
        videoLinkMap: {},
      };
      const details = await getFlatDetails(userState);
      console.log(details);
      expect(details).not.toEqual(null);
    });
  });
});
