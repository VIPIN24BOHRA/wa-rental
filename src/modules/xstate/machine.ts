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
        longitude: 0,
        latitude: 0,
        budget: '',
        noOfRooms: 0,
        currentPage: 1,
      } as MachineContext,
      predictableActionArguments: true,
      states: {
        idle: {
          on: {
            ON_MESSAGE: {
              target: 'default',
              actions: 'assignDefaultValue',
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
            INVALID: {
              target: 'default',
              actions: ['sendInvalidLocationMsg'],
            },
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
              actions: [
                'assignBudgetFromEvent',
                'sendFlatDetails1',
                'sendFlatDetails2',
                'sendFlatDetails3',
                'sendFlatDetails4',
                'sendFlatDetails5',
              ],
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

                actions: [
                  'sendFlatDetails',
                  'sendFlatDetails',
                  'sendFlatDetails',
                  'sendFlatDetails',
                  'sendFlatDetails',
                ],
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