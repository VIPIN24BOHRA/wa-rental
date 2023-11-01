/* eslint-disable no-nested-ternary */

import type { UserMetaData } from './machine.types';

export const handleMessage = async (
  interpreter: any,
  _message: string,
  _userActionId: string,
  _userMetaData: UserMetaData
) => {
  const State = Object.freeze({
    idle: 'idle',
    default: 'default',
  });

  const STATE_ACTION_EVENT_MAP: any = {
    [State.idle]: {},
    [State.default]: {},
  };
  const state = interpreter.state.value;
  if (!STATE_ACTION_EVENT_MAP[state]) {
    await interpreter.send({
      type: 'UNKNOWN_ISSUE',
    });
  } else if (state === State.idle) {
    await interpreter.send({ type: 'ON_MESSAGE' });
  } else if (state === State.default) {
    await interpreter.send({ type: 'ON_MESSAGE' });
  }
};
