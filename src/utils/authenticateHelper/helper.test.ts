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
      'NmQ5NGNkYTYwNjg0OTc0YTIxN2U1ZjcyYTg2ZTI3OTNhYjViMmQ2ZWI4ODEwMjJjOWFjM2FlMzMwZTdkMDgyODJmODQ1ZTVlMDFjZDQ1MmU1YzViMDhiODdiMmUyNDU0NDkzYTQ3ZmFhZDU0ZTY3MDEyODZkZjRhNjdlNThhODMwY2JjNWEzOTdiZjc5ODQ0ZGI2OTY4NDEwNzg2MmIxYw=='
    );
    console.log(decryptedData, JSON.parse(decryptedData));
    expect(decryptedData).not.toEqual(null);
  });
});
