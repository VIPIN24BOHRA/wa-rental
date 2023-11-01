import { createMachine } from 'xstate';

import { actionsFactory } from './actions';
import type { MachineConfig, MachineContext } from './machine.types';

export const machineFactory = (config: MachineConfig) => {
  return createMachine(
    {
      id: 'flatDekhoWhatsappMachine',
      initial: 'idle',
      context: {
        message: '',
        location: '',
        budget: 0,
        noOfRooms: 0,
        propertyType: '',
        for: '',
        listing: '',
      } as MachineContext,
      predictableActionArguments: true,
      states: {
        idle: {
          on: {
            ON_MESSAGE: {
              target: 'default',
            },
          },
        },
        default: {
          entry: 'sendWelcomeMessage',
          on: {
            ON_MESSAGE: {
              target: 'idle',
            },
          },
        },
      },
    },
    {
      actions: actionsFactory(config),
    }
  );
};
