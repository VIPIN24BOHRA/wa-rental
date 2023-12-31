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
        location: '',
      } as MachineContext,
      predictableActionArguments: true,
      states: {
        idle: {
          on: {
            ON_MESSAGE: {
              target: 'default',
              actions: 'assignDefaultValue',
            },
            ON_LOCATION: {
              target: 'rooms',
              actions: 'assignLocationFromEvent',
            },
            /* basic flow */
            // SEND_FLAT_DETAILS: {
            //   target: 'allflats',
            //   actions: [
            //     'sendOptionForMoreAndCancel',
            //     'assignLocationFromEvent',
            //   ],
            // },
            // NO_FLATS: {
            //   actions: ['sendNoFlatDetails', 'assignDefaultValue'],
            //   target: 'default',
            // },
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
              /* basic flow */
              // {
              //   target: 'allflats',
              //   actions: [
              //     'sendOptionForMoreAndCancel',
              //     'assignLocationFromEvent',
              //   ],
              // },
            ],
            NO_FLATS: {
              target: 'default',
              actions: ['sendNoFlatDetails', 'assignDefaultValue'],
            },
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
            API_NOT_WORKING: {
              target: 'default',
              actions: ['sendApiNotWorking', 'assignDefaultValue'],
            },
          },
        },
        allflats: {
          on: {
            GET_VIDEO: {
              target: 'allflats',
              actions: ['sendVideoFromEvent', 'sendOptionForMoreAndCancel'],
            },
            GET_CONTACT: {
              target: 'allflats',
              actions: ['sendContactFromEvent', 'sendOptionForMoreAndCancel'],
            },
            RESTART: {
              target: 'default',
              actions: 'assignDefaultValue',
            },
            THRESHOLD_REACHED: {
              target: 'allflats',
              actions: [
                'sendThresholdReachedMsg',
                'sendOptionForMoreAndCancel',
              ],
            },
            INVALID: {
              target: 'default',
              actions: 'assignDefaultValue',
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
