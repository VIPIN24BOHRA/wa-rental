import { authenticateUser } from '.';

/* eslint-disable jest/no-commented-out-tests */
/* eslint-disable no-console */
require('dotenv').config({
  path: '.env.local',
});

jest.setTimeout(20000);

describe('crypto test', () => {
  const messageObj = {
    id: 'ABEGkWOWYjIpAgk-gt7Kyf55pqc',
    source: '916396623229',
    type: 'text',
    payload: {
      text:
        'Hi Please log me in to flatdekho\n' +
        '\n' +
        '--eyJtaW5QcmljZSI6MCwibWF4UHJpY2UiOjAsImxhdGl0dWRlIjoiIiwibG9uZ2l0dWRlIjoiIiwiaXNNZWFsUmVxdWlyZWQiOmZhbHNlLCJzaGFyaW5nVHlwZXMiOltdLCJhdmFpbGFibGVGb3IiOiIiLCJsYXN0UHJvcGVydHlDb2RlIjoiMzIiLCJjdXJyZW50UGFnZSI6MX0=--',
    },
    sender: {
      phone: '916396623229',
      name: 'vipin bohra',
      country_code: '91',
      dial_code: '6396623229',
    },
  };

  it('should encrypt the data', async () => {
    const data = await authenticateUser(messageObj);
    console.log(data, btoa(JSON.stringify(data)));
    expect(data).not.toEqual(null);
  });
});
