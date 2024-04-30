import { decryptData, encryptData } from './helper';

/* eslint-disable jest/no-commented-out-tests */
/* eslint-disable no-console */
require('dotenv').config({
  path: '.env.local',
});

jest.setTimeout(20000);

describe('crypto test', () => {
  const data = {
    phoneNumber: '916396623229',

    name: 'Vipin Bohra',
    expireAt: Date.now() + 5 * 60 * 1000,
  };

  it('should encrypt the data', async () => {
    const key = encryptData(data);
    console.log(key);
    expect(key).not.toEqual(null);
  });

  it('should decrypt the data', async () => {
    const decryptedData = decryptData(
      'NmQ5NGNkYTYwNjg0OTc0YTIxN2U1ZjcyYTg2ZTI3OTNhYjViMmQ2ZWI4ODEwMjJjOWFjM2FlMzMwZTdkMDgyODcyNzZiOTc4YWYwMWI4MDQzYzZlMGY5MmIzYWVhNmIzNTUxMTQwMmYwYTk0MDc2MDJlYjQ0Y2IxOTBiYmQ0MjM4OTBmZDAzMmY1YzE5M2FhYmViYTgyZjlmNzc5NzlhODg1MDQ4NjVlNDI1MjdhNGIxMGU5MzlkZWUxMWNjOWRlN2FmNWZkYTU0ZTNkN2Y1ODAwNjdiMjc0YzdhZmY0ZjQ='
    );
    console.log(decryptedData, JSON.parse(decryptedData));
    expect(decryptedData).not.toEqual(null);
  });
});
