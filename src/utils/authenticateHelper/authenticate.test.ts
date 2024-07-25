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
        'Hi Please log me in to Clipskart\n' +
        '\n' +
        '--eyJjdXJyZW50S2V5IjoiMTkiLCJjdXJyZW50UmF0aW8iOiIwIiwibmV4dEtleSI6IjEiLCJuZXh0UmF0aW8iOiIwMDAwMF8xIiwicHJvZHVjdFVybCI6Imh0dHBzOi8vY2xpcHNrYXJ0LmluL3Byb2R1Y3QvdGFsa2luZy1mbGFzaC1jYXJkcz90eXBlPXRveXMiLCJuZXh0VmlkZW9VcmwiOiJodHRwczovL3ZpZGVvLmd1bWxldC5pby82NjM4NjZiNDQ1ZGNiNGM2YWE4NTI3NWEvNjY4NjM1Zjc3MGExNmVlNGViMjI3Y2I0L21haW4ubTN1OCJ9--',
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
