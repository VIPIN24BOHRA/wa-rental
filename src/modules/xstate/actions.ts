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
      const message = `👋 Welcome to flat dekho! \n\nFollow this to Enable Secret Message Sharing Manually 🔒\n\n 1. 📝 Save the provided contact as "Secret App" in your phone's contacts.\n 2. Tap 👥 "Add Participants" inside the group and choose "Secret App" from the contact list.\n 3. If not admin, please ask group admin to add "Secret App" contact.😊`;
      await sendTextMessage(
        config.whatsappInstance,
        message,
        config.userMetaData.phonenumber
      );
    },
  };
};
