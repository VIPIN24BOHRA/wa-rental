/* eslint-disable no-nested-ternary */

import { getConfessionQueue } from '@/modules/firebase/database';
import type { QueuedConfession } from '@/modules/firebase/firebaseTypes';

import type { IUserMetaData } from './types';

export const handleMessage = async (
  interpreter: any,
  message: string,
  userActionId: string, // @todo: make use of this, pass id from whatsapp to here and take actions based on id instead of message
  userMetaData: IUserMetaData
) => {
  const State = Object.freeze({
    idle: 'idle',
    onBoarding: 'onBoarding',
    default: 'default',
    help: 'help',
    my_groups: 'my_groups',
    manage_groups: 'manage_groups',
    manage_group_send_message: 'manage_group_send_message',
    new_group: 'new_group',
    has_non_premium_groups: 'has_non_premium_groups',
    has_groups: 'has_groups',
    select_non_premium_group: 'select_non_premium_group',
    select_group: 'select_group',
    send_message: 'send_message',
    confirm_message: 'confirm_message',
    queue_failed: 'queue_failed',
  });

  const STATE_ACTION_EVENT_MAP: any = {
    [State.idle]: {},
    [State.onBoarding]: {},
    [State.default]: {
      'my groups': 'MY_GROUPS',
      'send secret': 'SEND_SECRET',
      help: 'HELP',
    },
    [State.help]: {
      'admin video': 'ADMIN_VIDEO',
      'member video': 'MEMBER_VIDEO',
      cancel: 'CANCEL',
    },
    [State.my_groups]: {
      // 'buy premium': 'BUY_PREMIUM',
      'add new group': 'ADD_NEW_GROUP',
      cancel: 'CANCEL',
    },
    [State.manage_groups]: {
      cancel: 'CANCEL',
      'buy premium': 'BUY_PREMIUM',
      'send secret': 'SEND_SECRET',
    },
    [State.manage_group_send_message]: {
      cancel: 'CANCEL',
    },
    [State.new_group]: {
      cancel: 'CANCEL',
      manual: 'MANUAL',
    },
    [State.select_non_premium_group]: {
      cancel: 'CANCEL',
    },
    [State.select_group]: {
      cancel: 'CANCEL',
    },
    [State.send_message]: {
      cancel: 'CANCEL',
    },
    [State.confirm_message]: {
      cancel: 'CANCEL',
      send: 'SEND',
    },
    [State.queue_failed]: {
      cancel: 'CANCEL',
      retry: 'RETRY',
    },
  };
  const state = interpreter.state.value;
  if (!STATE_ACTION_EVENT_MAP[state]) {
    await interpreter.send({
      type: 'UNKNOWN_ISSUE',
    });
  } else if (state === State.idle) {
    const hasGroup = userMetaData.groupList.length;
    if (hasGroup) {
      await interpreter.send({ type: 'ON_MESSAGE' });
    } else {
      await interpreter.send({ type: 'ON_BOARDING' });
    }
  } else if (state === State.onBoarding) {
    await interpreter.send({ type: 'ON_MESSAGE' });
  } else if (state === State.default) {
    const event =
      STATE_ACTION_EVENT_MAP[state][userActionId] || 'INVALID_INPUT';
    await interpreter.send({
      type: event,
      message,
      groupList: userMetaData.groupList,
    });
  } else if (state === State.help) {
    const event =
      STATE_ACTION_EVENT_MAP[state][userActionId] || 'INVALID_INPUT';
    await interpreter.send({
      type: event,
      message,
      groupList: userMetaData.groupList,
    });
  } else if (state === State.my_groups) {
    const event = STATE_ACTION_EVENT_MAP[state][userActionId] || 'ON_MESSAGE';
    const selectedGroup = message.split(':').pop();
    await interpreter.send({
      type: event,
      selectedGroup,
      groupList: userMetaData.groupList,
    });
  } else if (state === State.manage_groups) {
    const event =
      STATE_ACTION_EVENT_MAP[state][userActionId] || 'INVALID_INPUT';
    await interpreter.send({
      type: event,
      message,
      groupList: userMetaData.groupList,
    });
  } else if (state === State.manage_group_send_message) {
    const event = STATE_ACTION_EVENT_MAP[state][userActionId] || 'ON_MESSAGE';

    await interpreter.send({
      type: event,
      message,
      groupList: userMetaData.groupList,
    });
  } else if (state === State.new_group) {
    const event = STATE_ACTION_EVENT_MAP[state][userActionId] || 'ON_MESSAGE';
    await interpreter.send({
      type: event,
      inviteurl: message,
      groupList: userMetaData.groupList,
    });
  } else if (state === State.select_non_premium_group) {
    const event = STATE_ACTION_EVENT_MAP[state][userActionId] || 'ON_MESSAGE';
    const selectedGroup = message.split(':').pop();
    await interpreter.send({
      type: event,
      selectedGroup,
      groupList: userMetaData.groupList,
    });
  } else if (state === State.select_group) {
    const event = STATE_ACTION_EVENT_MAP[state][userActionId] || 'ON_MESSAGE';

    const selectedGroup = message.split(':').pop();

    await interpreter.send({
      type: event,
      selectedGroup,
      groupList: userMetaData.groupList,
    });
  } else if (state === State.send_message) {
    const event = STATE_ACTION_EVENT_MAP[state][userActionId] || 'ON_MESSAGE';

    await interpreter.send({
      type: event,
      message,
      groupList: userMetaData.groupList,
    });
  } else if (state === State.confirm_message) {
    // confirm_message required additional logic and hence handled separately
    const event =
      STATE_ACTION_EVENT_MAP[state][userActionId] || 'INVALID_INPUT';
    // handle send event to check congestion, premium group etc

    const stillValidGroup =
      userMetaData.groupList.filter(
        (g: any) => g.groupid === interpreter.state.context.selectedGroup
      ).length > 0;

    if (event === 'CANCEL' || event === 'INVALID_INPUT') {
      await interpreter.send({ type: event });
    } else if (event === 'SEND' && stillValidGroup) {
      const CONGESTION_THRESHOLD = 5;
      // @todo: check if conditions can be async inside xstate, if so then special handling will not be required
      const queuedConfessions: QueuedConfession[] = await getConfessionQueue(
        interpreter.state.context.selectedGroup ?? ''
      );
      if (queuedConfessions.length > CONGESTION_THRESHOLD) {
        await interpreter.send({ type: 'CONGESTED_QUEUE' });
      } else {
        await interpreter.send({ type: 'QUEUE_MESSAGE' });
      }
    } else {
      await interpreter.send({ type: 'UNKNOWN_ISSUE' });
    }
  } else if (state === State.queue_failed) {
    // queue_failed
    const event =
      STATE_ACTION_EVENT_MAP[state][userActionId] || 'INVALID_INPUT';
    await interpreter.send({ type: event });
  }
};
