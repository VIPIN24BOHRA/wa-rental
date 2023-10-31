/* eslint-disable consistent-return */
import { interpret } from 'xstate';

import type { ICreateMessagePayload } from '@/modules/whatsapp/whatsapp';
import { sendMessageToWhatsapp } from '@/modules/whatsapp/whatsapp';

import { machineFactory } from './machine';
import { handleMessage } from './messageHandler';
import type { IStoreInstance, IUserMetaData, IWhatsappInstance } from './types';
// eslint-disable-next-line no-promise-executor-return
const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));
// Function to convert the current interpreter state to a string
function interpreterToString(interpreter: any) {
  const { value, context } = interpreter.state;

  console.log(Date.now(), 'interpreterToString', value, context);
  const state = {
    value,
    context,
  };
  return JSON.stringify(state);
}

// Function to create an interpreter instance from a string representing the last state
function getInterpreterFromString(
  stateString: string,
  whatsappStateMachine: any
) {
  const state = JSON.parse(stateString);
  const { value, context } = state;
  const interpreter: any = interpret(whatsappStateMachine).start(value);
  interpreter.state.context = context;
  return interpreter;
}

export const whatsappStateTransition = async (
  message: any,
  userMetaData: IUserMetaData
) => {
  if (!message || message.type !== 'text' || !message.text) return;

  const storeInstance: IStoreInstance = {};
  const whatsappInstance: IWhatsappInstance = {
    lock: false,
    send: async (payload: ICreateMessagePayload) => {
      if (whatsappInstance.lock) {
        return delay(50).then(() => whatsappInstance.send(payload));
      }
      whatsappInstance.lock = true;
      try {
        await sendMessageToWhatsapp(payload);
      } catch (e) {
        console.log(
          `${new Date().toString()}: Unable to send whatsapp message`,
          e
        );
      }
      whatsappInstance.lock = false;
    },
  };
  const whatsappStateMachine = machineFactory({
    userMetaData,
    storeInstance,
    whatsappInstance,
  });
  let interpreter: any;
  if (!userMetaData.state) {
    interpreter = interpret(whatsappStateMachine).start();
  } else {
    interpreter = getInterpreterFromString(
      userMetaData.state,
      whatsappStateMachine
    );
  }

  // @todo: Percolate id from whatsapp message to here, and handle actions inside handleMessage using id
  await handleMessage(
    interpreter,
    message.text,
    message.text.toLowerCase(),
    userMetaData
  );

  // giving machine grace period to run invoked actions
  const startTs = Date.now();
  const thresholdTs = 3000; // 3 seconds
  while (whatsappInstance.lock && Date.now() - startTs < thresholdTs) {
    // eslint-disable-next-line no-await-in-loop
    await delay(50);
  }
  interpreter.stop();
  const newState = interpreterToString(interpreter);
  return newState;
};
