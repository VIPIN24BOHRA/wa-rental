/* eslint-disable no-plusplus */
import {
  getUserDetails,
  saveUserState,
  setUserDetails,
} from '@/modules/firebase/database';
import { whatsappStateTransition } from '@/modules/xstate';
import type { UserMetaData } from '@/modules/xstate/machine.types';

import { parseMessage } from './messageParser';

export const replyToUser = async (messageObj: any) => {
  const { phonenumber, message, name } = parseMessage(messageObj);

  // get the user details from db from here.

  const userDetails = await getUserDetails(phonenumber);

  const stateObj = userDetails.state;

  const newState = await whatsappStateTransition(
    { type: 'text', text: message },
    { state: stateObj?.state ?? '', name, phonenumber } as UserMetaData
  );
  const dateObj = new Date();
  // save user state;
  if (!Object.keys(userDetails).length) {
    await setUserDetails({
      phoneNumber: phonenumber,
      isPremium: false,
      attempts: 0,
      state: {
        state: newState ?? '',
        lastSeenAt: dateObj.getTime(),
        totalAttempts: 0,
        getContactAttempts: 0,
      },
      createdAt: dateObj.getTime(),
      updatedAt: dateObj.getTime(),
    });
  } else {
    const newStateObj = JSON.parse(newState ?? '{}');
    const oldStateObj = JSON.parse(stateObj.state ?? '{}');
    const payload = {
      totalAttempts: stateObj.totalAttempts ?? 0,
      getContactAttempts: stateObj.getContactAttempts ?? 0,
      state: newState ?? '',
      lastSeenAt: dateObj.getTime(),
    };
    if (
      newStateObj.value === 'allflats' &&
      message.toLowerCase().includes('get contact')
    )
      payload.getContactAttempts++;

    if (newStateObj.value === 'allflats' && message.toLowerCase() === 'more')
      payload.totalAttempts++;

    if (newStateObj.value === 'allflats' && oldStateObj.value === 'budget')
      payload.totalAttempts++;

    await saveUserState(phonenumber, payload);
  }
};
