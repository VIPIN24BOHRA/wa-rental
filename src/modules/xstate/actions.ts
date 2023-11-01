import { assign } from 'xstate';

import type { CreateMessagePayload } from '../whatsapp/whatsapp';
import type { MachineConfig, WhatsappInstance } from './machine.types';

async function sendTextMessage(
  whatsappInstance: WhatsappInstance,
  message: string,
  phonenumber: string
) {
  const payload: CreateMessagePayload = {
    phoneNumber: phonenumber,
    type: 'text',
    text: message,
  };

  await whatsappInstance.send(payload);
}

export const actionsFactory = (config: MachineConfig): any => {
  return {
    assignDefaultValue: assign({
      message: () => '',
      location: () => '',
      budget: () => 0,
      noOfRooms: () => 0,
      propertyType: () => '',
      for: () => '',
      listing: () => '',
    }),
    sendWelcomeMessage: async () => {
      const message = `👋 Welcome to flat dekho! \n\nSave this Account to get the best flat at your door 🔒\n\n 1. 📝 Search flat by location.\n 2. filter by budget\n 3. If your are a Bachelor or Family Person, do filter here easily and get flat in just one click.😊`;
      await sendTextMessage(
        config.whatsappInstance,
        message,
        config.userMetaData.phonenumber
      );
    },
  };
};
