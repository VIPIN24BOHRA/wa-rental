/* eslint-disable no-plusplus */
import {
  getUserDetails,
  saveUserSearchedDetails,
  saveUserState,
  setUserDetails,
} from '@/modules/firebase/database';
import type { UserSearchedFilters } from '@/modules/firebase/firebase.types';
import { whatsappStateTransition } from '@/modules/xstate';
import type { UserMetaData } from '@/modules/xstate/machine.types';

import { setStopNotification } from '../flatDetailsHelper';
import { isStopMessage } from '../helper';
import { parseMessage } from './messageParser';

export const replyToUser = async (messageObj: any) => {
  if (
    messageObj?.type !== 'text' &&
    messageObj?.type !== 'button_reply' &&
    messageObj?.type !== 'list_reply' &&
    messageObj?.type !== 'quick_reply'
  )
    return;
  const { phonenumber, message, name } = parseMessage(messageObj);

  if (isStopMessage(message)) {
    await setStopNotification(phonenumber);
    return;
  }

  // get the user details from db from here.

  const userDetails = await getUserDetails(phonenumber);

  const stateObj = userDetails.state;

  const newState = await whatsappStateTransition(
    { type: 'text', text: message },
    {
      state: stateObj?.state ?? '',
      name,
      phonenumber,
      totalAttempts: stateObj?.totalAttempts ?? 0,
      getContactAttempts: stateObj?.getContactAttempts ?? 0,
      subscribed: userDetails?.subscribed ?? false,
    } as UserMetaData
  );
  const dateObj = new Date();
  // save user state,
  if (!Object.keys(userDetails).length) {
    await setUserDetails({
      phoneNumber: phonenumber,
      subscribed: false,
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
    const oldStateObj = JSON.parse(stateObj?.state ?? '{}');
    const payload = {
      totalAttempts: stateObj?.totalAttempts ?? 0,
      getContactAttempts: stateObj?.getContactAttempts ?? 0,
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

    if (newStateObj.value === 'budget' && oldStateObj.value === 'rooms') {
      if (newStateObj?.context) {
        const searchedFilter: UserSearchedFilters = {
          lat: newStateObj?.context?.latitude ?? 0,
          lng: newStateObj?.context?.longitude ?? 0,
          location: newStateObj?.context?.location ?? '',
          room:
            newStateObj?.context?.noOfRooms === '1RK'
              ? '1RK'
              : `${newStateObj?.context?.noOfRooms}BHK`,
          phoneNumber: phonenumber,
          createdAt: Date.now(),
        };
        // console.log(searchedFilter)
        await saveUserSearchedDetails(searchedFilter);
      }
    }
  }
};
