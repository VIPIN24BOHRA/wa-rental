/* eslint-disable no-promise-executor-return */
/* eslint-disable consistent-return */
import { interpret } from 'xstate';

import { sendMessageToWhatsapp } from '../whatsapp/whatsapp';
import { machineFactory } from './machine';
import type { UserMetaData, WhatsappInstance } from './machine.types';
import { handleMessage } from './messageHandler';

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

const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

export const whatsappStateTransition = async (
  message: any,
  userMetaData: UserMetaData
) => {
  // process only the text message.
  if (!message || message.type !== 'text' || !message.text) return;

  const whatsappInstance: WhatsappInstance = {
    lock: false,
    send: async (payload: any) => {
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

  await handleMessage(
    interpreter,
    message.text,
    message.text.toLowerCase(),
    userMetaData
  );
};
