/* eslint-disable no-nested-ternary */

import { getFlatDetails } from '@/utils/flatDetailsHelper';
import { getLatLongFromAddress } from '@/utils/geoLocationHelper';

import type { UserMetaData } from './machine.types';
import { sendFlatDetails } from './sendFlatDetails';

/*

for basic bot changes:-

1. sending from idle to direct default state. check the condition in idle state.
2. directly sending details after location is selected. check the condition in default state.

*/

export const handleMessage = async (
  interpreter: any,
  message: string,
  userActionId: string,
  userMetaData: UserMetaData
) => {
  const State = Object.freeze({
    idle: 'idle',
    onboarding: 'onboarding',
    default: 'default',
    rooms: 'rooms',
    budget: 'budget',
    allflats: 'allflats',
  });

  const STATE_ACTION_EVENT_MAP: any = {
    [State.onboarding]: {
      start: 'START',
    },
    [State.allflats]: {
      restart: 'RESTART',
      more: 'MORE',
      'get contact': 'GET_CONTACT',
    },
  };
  const state = interpreter.state.value;
  if (state === State.idle) {
    if (userMetaData.state) await interpreter.send({ type: 'ON_MESSAGE' });
    else {
      const geoDetails = await getLatLongFromAddress(message);
      if (!geoDetails) await interpreter.send({ type: 'ON_MESSAGE' });
      else
        await interpreter.send({
          type: 'ON_LOCATION',
          ...geoDetails,
          location: message,
        });
    }

    /* basic flow */
    // else {
    //   const geoDetails = await getLatLongFromAddress(message);
    //   if (!geoDetails) await interpreter.send({ type: 'ON_MESSAGE' });
    //   else {
    //     /* this else condition needs to be changed right now its for basic bot */
    //     const flatDetails = await getFlatDetails({
    //       ...interpreter.state.context,
    //       latitude: geoDetails.latitude,
    //       longitude: geoDetails.longitude,
    //     });
    //     if (!flatDetails.length) await interpreter.send({ type: 'NO_FLATS' });
    //     const videoLinkMap: any = {};
    //     flatDetails.forEach((f: any) => {
    //       videoLinkMap[f.videoAssetId] = f.originalDownlaodUrl;
    //     });

    //     await sendFlatDetails(flatDetails, userMetaData);
    //     /* remove code till here */
    //     // only send geoDetails if not basic bot.
    //     await interpreter.send({
    //       type: 'SEND_FLAT_DETAILS',
    //       ...geoDetails,
    //       currentPage: interpreter.state.context.currentPage + 1,
    //       videoLinkMap,
    //     });
    //   }
    // }
  } else if (state === State.onboarding) {
    const event = STATE_ACTION_EVENT_MAP[state][userActionId] || 'INVALID';
    await interpreter.send({
      type: event,
    });
  } else if (state === State.default) {
    const geoDetails = await getLatLongFromAddress(message);
    if (!geoDetails) await interpreter.send({ type: 'INVALID' });
    else
      await interpreter.send({
        type: 'ON_MESSAGE',
        ...geoDetails,
        location: message,
      });

    /* basic flow */

    // else {
    //   /* this else condition needs to be changed right now its for basic bot */
    //   const flatDetails = await getFlatDetails({
    //     ...interpreter.state.context,
    //     latitude: geoDetails.latitude,
    //     longitude: geoDetails.longitude,
    //   });
    //   if (!flatDetails.length) await interpreter.send({ type: 'NO_FLATS' });
    //   const videoLinkMap: any = {};
    //   flatDetails.forEach((f: any) => {
    //     videoLinkMap[f.videoAssetId] = f.originalDownlaodUrl;
    //   });

    //   await sendFlatDetails(flatDetails, userMetaData);
    //   /* remove code till here */
    //   // only send geoDetails if not basic bot.
    //   await interpreter.send({
    //     type: 'ON_MESSAGE',
    //     ...geoDetails,
    //     currentPage: interpreter.state.context.currentPage + 1,
    //     videoLinkMap,
    //   });
    // }
  } else if (state === State.rooms) {
    if (message) {
      const rooms = Number(message.replace('BHK', ''));
      console.log(rooms);
      if (message === 'any') {
        await interpreter.send({ type: 'ON_MESSAGE', noOfRooms: '' });
      } else if (message === '1RK') {
        await interpreter.send({
          type: 'ON_MESSAGE',
          noOfRooms: '1RK',
        });
      } else if (!Number.isNaN(rooms) && rooms > 0 && rooms <= 4)
        await interpreter.send({
          type: 'ON_MESSAGE',
          noOfRooms: rooms,
        });
      else await interpreter.send({ type: 'INVALID' });
    }
  } else if (state === State.budget) {
    // check here if the budget is ok or not;

    if (message !== 'any' && message.split('-').length < 2) {
      await interpreter.send({ type: 'INVALID' });
      return;
    }

    const faltDetails = await getFlatDetails({
      ...interpreter.state.context,
      budget: message,
    });
    if (!faltDetails.length) await interpreter.send({ type: 'NO_FLATS' });
    const videoLinkMap: any = {};
    faltDetails.forEach((f: any) => {
      videoLinkMap[f.videoAssetId] = f.originalDownlaodUrl;
    });

    await sendFlatDetails(faltDetails, userMetaData);
    await interpreter.send({
      type: 'SEND_FLAT_DETAILS',
      budget: message,
      currentPage: interpreter.state.context.currentPage + 1,
      flatList: faltDetails,
      videoLinkMap,
    });
  } else if (state === State.allflats) {
    let event = STATE_ACTION_EVENT_MAP[state][userActionId] || 'INVALID';

    if (userActionId.split(':')[0] === 'get video') {
      const videoId = userActionId.split(':')[1] ?? '';

      if (interpreter.state.context.videoLinkMap[videoId]) {
        event = 'GET_VIDEO';
      } else event = 'INVALID_STOP';
      await interpreter.send({
        type: event,
        videoId,
      });
    } else if (userActionId.split(':')[0] === 'get contact') {
      if (
        !userMetaData.subscribed &&
        userMetaData.getContactAttempts &&
        userMetaData.getContactAttempts >= 3
      ) {
        await interpreter.send({ type: 'THRESHOLD_REACHED' });
        return;
      }
      const contact = userActionId.split(':')[1] ?? '';
      if (contact) {
        await interpreter.send({
          type: 'GET_CONTACT',
          contact,
        });
      }
    } else if (event === 'MORE') {
      // check here if the budget is ok or not;
      const faltDetails = await getFlatDetails({
        ...interpreter.state.context,
      });
      if (!faltDetails.length) await interpreter.send({ type: 'NO_FLATS' });
      const videoLinkMap: any = {};
      faltDetails.forEach((f: any) => {
        videoLinkMap[f.videoAssetId] = f.originalDownlaodUrl;
      });
      await sendFlatDetails(faltDetails, userMetaData);
      await interpreter.send({
        type: event,
        currentPage: interpreter.state.context.currentPage + 1,
        flatList: faltDetails,
        videoLinkMap,
      });
    } else
      await interpreter.send({
        type: event,
      });
  }
};
