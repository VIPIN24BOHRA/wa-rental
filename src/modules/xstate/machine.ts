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
        videoLinkMap: {},
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
            SEND_FLAT_DETAILS: {
              target: 'allflats',
              actions: ['sendOptionForMoreAndCancel', 'assignBudgetFromEvent'],
            },
            NO_FLATS: {
              target: 'default',
              actions: ['sendNoFlatDetails', 'assignDefaultValue'],
            },
            INVALID: {
              target: 'budget',
              actions: 'sendInvalidBudgetMsg',
            },
          },
        },
        allflats: {
          on: {
            GET_VIDEO: {
              target: 'allflats',
              actions: ['sendVideoFromEvent'],
            },
            GET_CONTACT: {
              target: 'allflats',
              actions: ['sendContactFromEvent'],
            },
            REFRESH: {
              target: 'default',
              actions: 'assignDefaultValue',
            },
            INVALID: {
              target: 'allflats',
              actions: [
                'sendInvalidMsgInAllFlats',
                'sendOptionForMoreAndCancel',
              ],
            },
            MORE: {
              target: 'allflats',
              actions: [
                'sendOptionForMoreAndCancel',
                'assignFlatsListFromEvent',
              ],
            },
            NO_FLATS: {
              target: 'idle',
              actions: 'sendNoFlatDetails',
            },
            INVALID_STOP: {
              target: 'idle',
              actions: 'sendInvalidTerminationMsg',
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
