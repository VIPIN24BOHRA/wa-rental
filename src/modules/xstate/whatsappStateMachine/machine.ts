import { createMachine } from 'xstate';

import { actionsFactory } from './actions';
import { gaurdsFactory } from './gaurds';
import type { IMachineConfig, IMachineContext } from './types';
// Define the state machine configuration
export const machineFactory = (config: IMachineConfig) => {
  return createMachine(
    {
      id: 'whatsappStateMachine',
      initial: 'idle',
      context: {
        message: '',
        selectedGroup: '',
        groupList: [],
      } as IMachineContext,
      predictableActionArguments: true,
      on: {
        UNKNOWN_ISSUE: {
          target: 'default',
        },
      },
      states: {
        idle: {
          on: {
            ON_BOARDING: {
              target: 'onBoarding',
            },
            ON_MESSAGE: {
              target: 'default',
            },
          },
        },

        onBoarding: {
          entry: [
            'sendOnBoardingAddingInstruction',
            'sendSecretAppContactDetails',
            'sendOnBoardingMessage',
          ],
          on: {
            ON_MESSAGE: {
              target: 'default',
            },
          },
        },

        default: {
          entry: ['sendIntroOptionsMessage', 'assignDefaultValues'],
          on: {
            HELP: {
              target: 'help',
              actions: ['assignDetailsFromEvent'],
            },
            MY_GROUPS: {
              target: 'my_groups',
              actions: ['assignDetailsFromEvent'],
            },
            SEND_SECRET: {
              target: 'has_groups',
              actions: ['assignDetailsFromEvent'],
            },
            INVALID_INPUT: {
              target: 'idle',
              actions: [],
            },
          },
        },

        help: {
          entry: ['sendHelpMessage'],
          on: {
            ADMIN_VIDEO: {
              target: 'idle',
              actions: ['sendAdminVideo'],
            },
            MEMBER_VIDEO: {
              target: 'idle',
              actions: ['sendMemberVideo'],
            },
            CANCEL: {
              target: 'idle',
              actions: ['sendCancelMessage'],
            },
            INVALID_INPUT: {
              target: 'help',
              actions: ['sendInvalidInputMessage'],
            },
          },
        },

        my_groups: {
          entry: ['sendManageGroupsListMessage'],
          on: {
            CANCEL: {
              target: 'idle',
              actions: ['sendCancelMessage'],
            },
            ADD_NEW_GROUP: {
              target: 'new_group',
              actions: ['assignDetailsFromEvent'],
            },
            ON_MESSAGE: [
              {
                target: 'my_groups',
                cond: 'invalidSelectedGroup',
                actions: ['sendInvalidInputMessage'],
              },
              {
                target: 'manage_groups',
                actions: ['assignSelectedGroupFromEvent'],
              },
            ],
          },
        },

        manage_groups: {
          entry: ['sendManageGroupsOptionMessage'],
          on: {
            CANCEL: {
              target: 'idle',
              actions: ['sendCancelMessage'],
            },
            BUY_PREMIUM: {
              target: 'idle',
              actions: ['sendPremiumLinkWithGroupSecretFromManageGroups'],
            },
            SEND_SECRET: {
              target: 'manage_group_send_message',
            },
            INVALID_INPUT: {
              target: 'manage_groups',
              actions: ['sendInvalidInputMessage'],
            },
          },
        },

        manage_group_send_message: {
          entry: ['sendSendMessageOptionsMessage'],
          on: {
            CANCEL: {
              target: 'idle',
              actions: ['sendCancelMessage'],
            },
            ON_MESSAGE: [
              {
                target: 'manage_group_send_message',
                cond: 'invalidMessageEvent',
                actions: ['sendInvalidMessageMessage'],
              },
              {
                target: 'confirm_message',
                actions: ['assignDetailsFromEvent'],
              },
            ],
          },
        },

        new_group: {
          entry: ['sendNewGroupOptionMessage'],
          on: {
            CANCEL: {
              target: 'idle',
            },
            MANUAL: {
              target: 'idle',
              actions: [
                'sendManuallyAddingInstruction',
                'sendSecretAppContactDetails',
              ],
            },
            ON_MESSAGE: [
              {
                target: 'new_group',
                cond: 'invalidInviteLink',
                actions: ['sendInvalidInputMessage'],
              },
              {
                target: 'idle',
                actions: ['sendInviteSuccessMessage', 'saveInviteLinkToQueue'],
              },
            ],
          },
        },

        has_non_premium_groups: {
          always: [
            { target: 'select_non_premium_group', cond: 'hasNonPremiumGroup' },
            {
              target: 'idle',
              cond: 'noNonPremiumGroup',
              actions: ['sendNoNonPremiumGroupMessage'],
            },
          ],
        },

        has_groups: {
          always: [
            {
              target: 'send_message',
              cond: 'oneGroup',
              actions: ['assignSelectedGroup'],
            },
            {
              target: 'select_group',
              cond: 'manyGroups',
              actions: [],
            },
            {
              target: 'idle',
              cond: 'noGroups',
              actions: ['sendNoGroupsMessage'],
            },
          ],
        },

        select_non_premium_group: {
          entry: ['sendSelectNonPremiumGroupOptionsMessage'],
          on: {
            CANCEL: {
              target: 'idle',
              actions: ['sendCancelMessage'],
            },
            ON_MESSAGE: [
              {
                target: 'select_non_premium_group',
                cond: 'invalidSelectedNonPremiumGroup',
                actions: ['sendInvalidInputMessage'],
              },
              {
                target: 'idle',
                actions: ['sendPremiumLinkWithGroupSecret'],
              },
            ],
          },
        },

        select_group: {
          entry: ['sendSelectGroupOptionsMessage'],
          on: {
            CANCEL: {
              target: 'idle',
              actions: ['sendCancelMessage'],
            },
            ON_MESSAGE: [
              {
                target: 'select_group',
                cond: 'invalidSelectedGroup',
                actions: ['sendInvalidInputMessage'],
              },
              {
                target: 'send_message',
                actions: ['assignSelectedGroupFromEvent'],
              },
            ],
          },
        },

        send_message: {
          entry: ['sendSendMessageOptionsMessage'],
          on: {
            ON_MESSAGE: [
              {
                target: 'send_message',
                cond: 'invalidMessageEvent',
                actions: ['sendInvalidMessageMessage'],
              },
              {
                target: 'confirm_message',
                actions: ['assignDetailsFromEvent'],
              },
            ],
            CANCEL: {
              target: 'idle',
              actions: ['sendCancelMessage'],
            },
          },
        },

        confirm_message: {
          entry: ['sendConfirmMessageOptionsMessage'],
          on: {
            CANCEL: {
              target: 'idle',
              actions: ['sendCancelMessage'],
            },
            QUEUE_MESSAGE: {
              target: 'idle',
              actions: ['sendMessageQueuedMessage', 'saveMessageToQueue'],
            },
            CONGESTED_QUEUE: {
              target: 'queue_failed',
              actions: ['sendQueueCongestedMessage'],
            },
            UNKNOWN_ISSUE: {
              target: 'queue_failed',
              actions: [],
            },
            INVALID_INPUT: {
              target: 'confirm_message',
              actions: ['sendInvalidInputMessage'],
            },
          },
        },

        queue_failed: {
          entry: ['sendQueueFailedOptionsMessage'],
          on: {
            INVALID_INPUT: {
              target: 'queue_failed',
              actions: ['sendInvalidInputMessage'],
            },
            RETRY: {
              target: 'confirm_message',
              actions: [],
            },
            CANCEL: {
              target: 'idle',
              actions: ['sendCancelMessage'],
            },
          },
        },

        'new state 1': {},
      },
    },
    {
      guards: gaurdsFactory(config),
      actions: actionsFactory(config),
    }
  );
};
