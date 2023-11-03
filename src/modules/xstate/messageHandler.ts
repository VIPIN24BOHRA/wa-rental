/* eslint-disable no-nested-ternary */

import type { UserMetaData } from './machine.types';

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
      cancel: 'CANCEL',
      more: 'MORE',
    },
  };
  const state = interpreter.state.value;
  if (!STATE_ACTION_EVENT_MAP[state]) {
    await interpreter.send({
      type: 'UNKNOWN_ISSUE',
    });
  } else if (state === State.idle) {
    if (userMetaData.state) await interpreter.send({ type: 'ON_MESSAGE' });
    else await interpreter.send({ type: 'ON_BOARDING' });
  } else if (state === State.onboarding) {
    const event = STATE_ACTION_EVENT_MAP[state][userActionId] || 'INVALID';
    await interpreter.send({
      type: event,
    });
  } else if (state === State.default) {
    await interpreter.send({ type: 'ON_MESSAGE', location: message });
  } else if (state === State.rooms) {
    if (message) {
      const rooms = Number(message);
      if (!Number.isNaN(rooms) && rooms > 0 && rooms <= 4)
        await interpreter.send({ type: 'ON_MESSAGE', noOfRooms: rooms });
      else await interpreter.send({ type: 'INVALID' });
    }
  } else if (state === State.budget) {
    // check here if the budget is ok or not;
    await interpreter.send({ type: 'ON_MESSAGE', budget: message });
  } else if (state === State.allflats) {
    const event = STATE_ACTION_EVENT_MAP[state][userActionId] || 'ON_MESSAGE';
    await interpreter.send({
      type: event,
    });
  }
};
