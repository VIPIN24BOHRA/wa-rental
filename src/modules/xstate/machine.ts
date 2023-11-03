import { createMachine } from 'xstate';

import { actionsFactory } from './actions';
import { gaurdsFactory } from './guards';
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
            ON_BOARDING: {
              actions: 'sendOnBoardingMsg',
              target: 'onboarding',
            },
          },
        },
        onboarding: {
          on: {
            START: {
              target: 'default',
            },
            INVALID: {
              actions: 'sendInvalidOnBoardingMsg',
              target: 'onboarding',
            },
          },
        },
        default: {
          entry: 'sendLocationMessage',
          on: {
            ON_MESSAGE: [
              {
                target: 'default',
                cond: 'invalidLocationMsg',
                actions: ['sendInvalidLocationMsg'],
              },
              {
                target: 'rooms',
                actions: 'assignLocationFromEvent',
              },
            ],
          },
        },
        rooms: {
          entry: 'sendSelectNoOfRoomsMsg',
          on: {
            ON_MESSAGE: {
              target: 'budget',
              actions: 'assignNoOfRoomsFromEvent',
            },
            INVALID: {
              target: 'rooms',
              actions: 'sendInvalidRoomMsg',
            },
          },
        },
        budget: {
          entry: 'sendSelectBudgetMsg',
          on: {
            ON_MESSAGE: {
              target: 'allflats',
              actions: ['assignBudgetFromEvent', 'sendFlatDetailsList'],
            },
          },
        },
        allflats: {
          on: {
            ON_MESSAGE: [
              {
                target: 'allflats',
                cond: 'isInvalidFlatSelected',
                actions: 'sendInvalidSelectedLocationMsg',
              },
              {
                target: 'allflats',
                actions: ['sendFlatDetails'],
              },
            ],
            CANCEL: {
              target: 'idle',
              actions: 'sendThanksMsg',
            },
            MORE: {
              target: 'allflats',
              actions: 'sendMoreFlatLocations',
            },
          },
        },
      },
    },
    {
      actions: actionsFactory(config),
      guards: gaurdsFactory(config),
    }
  );
};
