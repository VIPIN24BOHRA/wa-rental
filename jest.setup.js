// Optional: configure or set up a testing framework before each test.
// If you delete this file, remove `setupFilesAfterEnv` from `jest.config.js`
// eslint-disable-next-line import/no-unresolved

import '@testing-library/jest-dom/extend-expect';
import 'core-js';

require('dotenv').config({
  path: '.env.local',
});

require('./src/modules/firebase/firebase.ts');
