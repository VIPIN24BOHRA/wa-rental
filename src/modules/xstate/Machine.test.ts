import { whatsappStateTransition } from './whatsappStateMachine';
import type { IUserMetaData } from './whatsappStateMachine/types';

require('dotenv').config({
  path: '.env.local',
});

jest.setTimeout(20000);
const TEST_PHONE_NUMBER = process.env.TEST_PHONE_NUMBER || '123';

jest.mock('../whatsapp/whatsapp', () => ({
  sendMessageToWhatsapp: async () => true,
}));

describe('WhatsApp State Machine', () => {
  const consoleErrorSpy: any = jest.spyOn(console, 'error');

  beforeEach(async () => {});

  afterEach(async () => {
    // eslint-disable-next-line no-promise-executor-return
    await new Promise((resolve) => setTimeout(resolve, 500));
  });

  describe('Transitions from idle state', () => {
    const userMetaData = {
      phonenumber: TEST_PHONE_NUMBER,
      groupList: [],
      state:
        '{"value": "idle","context": { "selectedGroup": "", "groupList": [] }}',
    } as IUserMetaData;

    it('should transition to "onBoarding" when any message is received and user has no groups in "idle" state', async () => {
      const newState = await whatsappStateTransition(
        { type: 'text', text: 'any Message' },
        userMetaData
      );
      const state = JSON.parse(newState || '{}');
      expect(state.value).toBe('onBoarding');
      expect(consoleErrorSpy).not.toHaveBeenCalled();
      consoleErrorSpy.mockReset();
    });

    it('should transition to "default" when any message is received in "idle" state and user has groups', async () => {
      const oneGroupUserMetaData = {
        phonenumber: TEST_PHONE_NUMBER,
        groupList: [
          { groupid: 'group1', groupname: 'group1', secret: 'group1' },
        ],
        state:
          '{"value": "idle","context": { "selectedGroup": "", "groupList": [{"groupid":"group1","groupname":"group1","secret":"group1"}] }}',
      } as IUserMetaData;

      const newState = await whatsappStateTransition(
        { type: 'text', text: 'any Message' },
        oneGroupUserMetaData
      );
      const state = JSON.parse(newState || '{}');
      expect(state.value).toBe('default');
      expect(consoleErrorSpy).not.toHaveBeenCalled();
      consoleErrorSpy.mockReset();
    });
  });

  describe('Transitions from onBoarding state', () => {
    const userMetaData = {
      phonenumber: TEST_PHONE_NUMBER,
      groupList: [{ groupid: 'group1', groupname: 'group1', secret: 'group1' }],
      state:
        '{"value": "onBoarding","context": { "selectedGroup": "", "groupList": [{"groupid":"group1","groupname":"group1","secret":"group1"}] }}',
    } as IUserMetaData;

    it('should transition to "default" when any message is received in "onBoarding" state', async () => {
      const newState = await whatsappStateTransition(
        { type: 'text', text: 'any Message' },
        userMetaData
      );
      const state = JSON.parse(newState || '{}');
      expect(state.value).toBe('default');
      expect(consoleErrorSpy).not.toHaveBeenCalled();
      consoleErrorSpy.mockReset();
    });
  });

  describe('Transitions from default state', () => {
    const userMetaData = {
      phonenumber: TEST_PHONE_NUMBER,
      groupList: [],
      state:
        '{"value": "default","context": { "selectedGroup": "", "groupList": [] }}',
    } as IUserMetaData;

    it('should transition to "idle" state when invalid message is provided', async () => {
      const newState = await whatsappStateTransition(
        { type: 'text', text: 'abcdrandom' },
        userMetaData
      );
      const state = JSON.parse(newState || '{}');
      expect(state.value).toBe('idle');
      expect(consoleErrorSpy).not.toHaveBeenCalled();
      consoleErrorSpy.mockReset();
    });

    it('should transition to "idle" when no group is present and send secret is provided', async () => {
      const newState = await whatsappStateTransition(
        { type: 'text', text: 'send secret' },
        userMetaData
      );
      const state = JSON.parse(newState || '{}');
      expect(state.value).toBe('idle');
      expect(consoleErrorSpy).not.toHaveBeenCalled();
      consoleErrorSpy.mockReset();
    });

    it('should transition to "send_message" state when one group is present and send secret is provided', async () => {
      const oneGroupUserMetaData = {
        phonenumber: TEST_PHONE_NUMBER,
        groupList: [{ groupid: 'group1', groupname: 'group1' }],
        state:
          '{"value": "default","context": { "selectedGroup": "", "groupList": [{"groupid":"group1","groupname":"group1"}] }}',
      } as IUserMetaData;
      const newState = await whatsappStateTransition(
        { type: 'text', text: 'Send Secret' },
        oneGroupUserMetaData
      );
      const state = JSON.parse(newState || '{}');
      expect(state.value).toBe('send_message');
      expect(consoleErrorSpy).not.toHaveBeenCalled();
      consoleErrorSpy.mockReset();
      expect(state.context.selectedGroup).toBe('group1');
    });

    it('should transition to "select_group" state when many groups are present and send secret is provided', async () => {
      const manyGroupsUserMeta = {
        phonenumber: TEST_PHONE_NUMBER,
        groupList: [
          { groupid: 'group1', groupname: 'group1' },
          { groupid: 'group2', groupname: 'group2' },
        ],
        state:
          '{"value": "default","context": { "selectedGroup": "", "groupList": [{"groupid":"group1","groupname":"group1"},{"groupid":"group2","groupname":"group2"}] }}',
      } as IUserMetaData;

      const newState = await whatsappStateTransition(
        { type: 'text', text: 'Send Secret' },
        manyGroupsUserMeta
      );
      const state = JSON.parse(newState || '{}');
      expect(state.value).toBe('select_group');
      expect(consoleErrorSpy).not.toHaveBeenCalled();
      consoleErrorSpy.mockReset();
    });

    it('should transition to "my_groups" state when my groups message is provided', async () => {
      const newState = await whatsappStateTransition(
        { type: 'text', text: 'my groups' },
        userMetaData
      );
      const state = JSON.parse(newState || '{}');
      expect(state.value).toBe('my_groups');
      expect(consoleErrorSpy).not.toHaveBeenCalled();
      consoleErrorSpy.mockReset();
    });

    it('should transition to "help" state when help message is provided', async () => {
      const newState = await whatsappStateTransition(
        { type: 'text', text: 'help' },
        userMetaData
      );
      const state = JSON.parse(newState || '{}');
      expect(state.value).toBe('help');
      expect(consoleErrorSpy).not.toHaveBeenCalled();
      consoleErrorSpy.mockReset();
    });
  });

  describe('Transitions from help state', () => {
    const userMetaData = {
      phonenumber: TEST_PHONE_NUMBER,
      groupList: [{ groupid: 'group1', groupname: 'group1', secret: 'group1' }],
      state:
        '{"value": "help","context": { "selectedGroup": "", "groupList": [{"groupid":"group1","groupname":"group1","secret":"group1"}] }}',
    } as IUserMetaData;

    it('should transition to "idle" state when Admin Video is provided', async () => {
      const newState = await whatsappStateTransition(
        { type: 'text', text: 'Admin Video' },
        userMetaData
      );
      const state = JSON.parse(newState || '{}');
      expect(state.value).toBe('idle');
      expect(consoleErrorSpy).not.toHaveBeenCalled();
      consoleErrorSpy.mockReset();
    });

    it('should transition to "idle" state when Member Video is provided', async () => {
      const newState = await whatsappStateTransition(
        { type: 'text', text: 'Member Video' },
        userMetaData
      );
      const state = JSON.parse(newState || '{}');
      expect(state.value).toBe('idle');
      expect(consoleErrorSpy).not.toHaveBeenCalled();
      consoleErrorSpy.mockReset();
    });

    it('should transition to "idle" state when cancel is provided', async () => {
      const newState = await whatsappStateTransition(
        { type: 'text', text: 'Cancel' },
        userMetaData
      );
      const state = JSON.parse(newState || '{}');
      expect(state.value).toBe('idle');
      expect(consoleErrorSpy).not.toHaveBeenCalled();
      consoleErrorSpy.mockReset();
    });

    it('should transition to "help" state when invalid input is provided', async () => {
      const newState = await whatsappStateTransition(
        { type: 'text', text: 'invalid' },
        userMetaData
      );
      const state = JSON.parse(newState || '{}');
      expect(state.value).toBe('help');
      expect(consoleErrorSpy).not.toHaveBeenCalled();
      consoleErrorSpy.mockReset();
    });
  });

  describe('Transitions from my_groups state', () => {
    const userMetaData = {
      phonenumber: TEST_PHONE_NUMBER,
      groupList: [
        {
          groupid: 'group1',
          groupname: 'group1',
          secret: 'group1',
          isPremium: true,
        },
        { groupid: 'group2', groupname: 'group2', secret: 'group2' },
        { groupid: 'group3', groupname: 'group3', secret: 'group3' },
      ],
      state:
        '{"value": "my_groups","context": { "selectedGroup": "", "groupList": [{"groupid":"group1","groupname":"group1","secret":"group1", "isPremium":true},{"groupid":"group2","groupname":"group2","secret":"group2"},{"groupid":"group3","groupname":"group3","secret":"group3"}] }}',
    } as IUserMetaData;

    // it('should transition to "idle" state when no non-premium group is available and buy premium is provided', async () => {
    //   const noNonPremiumGroupMetaData = {
    //     phonenumber: TEST_PHONE_NUMBER,
    //     groupList: [
    //       { groupid: 'group1', groupname: 'group1', isPremium: true },
    //       { groupid: 'group2', groupname: 'group2', isPremium: true },
    //     ],
    //     state:
    //       '{"value": "my_groups","context": { "selectedGroup": "", "groupList": [{"groupid":"group1","groupname":"group1","isPremium":true},{"groupid":"group2","groupname":"group2","isPremium":true}] }}',
    //   } as IUserMetaData;
    //   const newState = await whatsappStateTransition(
    //     { type: 'text', text: 'buy premium' },
    //     noNonPremiumGroupMetaData
    //   );
    //   const state = JSON.parse(newState || '{}');
    //   expect(state.value).toBe('idle');
    //   expect(consoleErrorSpy).not.toHaveBeenCalled();
    //   consoleErrorSpy.mockReset();
    // });

    // it('should transition to "select_non_premium_group" state when non-premium group is available and buy premium is provided', async () => {
    //   const nonPremiumGroupMetaData = {
    //     phonenumber: TEST_PHONE_NUMBER,
    //     groupList: [
    //       {
    //         groupid: 'group1',
    //         groupname: 'group1',
    //         secret: 'group1',
    //         isPremium: true,
    //       },
    //       { groupid: 'group2', groupname: 'group2', secret: 'group2' },
    //       { groupid: 'group3', groupname: 'group3', secret: 'group3' },
    //     ],
    //     state:
    //       '{"value": "my_groups","context": { "selectedGroup": "", "groupList": [{"groupid":"group1","groupname":"group1","secret":"group1","isPremium":true},{"groupid":"group2","groupname":"group2","secret":"group2"},{"groupid":"group3","groupname":"group3","secret":"group3"}] }}',
    //   } as IUserMetaData;
    //   const newState = await whatsappStateTransition(
    //     { type: 'text', text: 'buy premium' },
    //     nonPremiumGroupMetaData
    //   );
    //   const state = JSON.parse(newState || '{}');
    //   expect(state.value).toBe('select_non_premium_group');
    //   expect(consoleErrorSpy).not.toHaveBeenCalled();
    //   consoleErrorSpy.mockReset();
    // });

    it('should transition to "idle" state when CANCEL event is received in "my_groups" state', async () => {
      const newState = await whatsappStateTransition(
        { type: 'text', text: 'cancel' },
        userMetaData
      );
      const state = JSON.parse(newState || '{}');
      expect(state.value).toBe('idle');
      expect(consoleErrorSpy).not.toHaveBeenCalled();
      consoleErrorSpy.mockReset();
    });

    it('should transition to "new_group" state when new group is provided', async () => {
      const newState = await whatsappStateTransition(
        { type: 'text', text: 'add new group' },
        userMetaData
      );
      const state = JSON.parse(newState || '{}');
      expect(state.value).toBe('new_group');
      expect(consoleErrorSpy).not.toHaveBeenCalled();
      consoleErrorSpy.mockReset();
    });

    it('should transition to "manage_groups" state when valid group is selected', async () => {
      const newState = await whatsappStateTransition(
        { type: 'text', text: 'g:group1' },
        userMetaData
      );
      const state = JSON.parse(newState || '{}');
      expect(state.value).toBe('manage_groups');
      expect(consoleErrorSpy).not.toHaveBeenCalled();
      consoleErrorSpy.mockReset();
      expect(state.context.selectedGroup).toBe('group1');
    });

    it('should transition to "my_groups" state when invalid group is selected', async () => {
      const newState = await whatsappStateTransition(
        { type: 'text', text: 'g:group4' },
        userMetaData
      );
      const state = JSON.parse(newState || '{}');
      expect(state.value).toBe('my_groups');
      expect(consoleErrorSpy).not.toHaveBeenCalled();
      consoleErrorSpy.mockReset();
    });
  });

  describe('Transitions from manage_groups state', () => {
    const userMetaData = {
      phonenumber: TEST_PHONE_NUMBER,
      groupList: [
        {
          groupid: 'group1',
          groupname: 'group1',
          secret: 'group1',
          isPremium: true,
        },
        { groupid: 'group2', groupname: 'group2', secret: 'group2' },
      ],
      state:
        '{"value": "manage_groups","context": { "message": "", "selectedGroup": "group1", "groupList": [{"groupid":"group1","groupname":"group1","secret":"group1","isPremium":true},{"groupid":"group2","groupname":"group2","secret":"group2"}] }}',
    } as IUserMetaData;

    it('should transition back to "idle" when CANCEL event is received in "manage_groups" state', async () => {
      const newState = await whatsappStateTransition(
        { type: 'text', text: 'Cancel' },
        userMetaData
      );

      const state = JSON.parse(newState || '{}');
      expect(state.value).toBe('idle');
      expect(consoleErrorSpy).not.toHaveBeenCalled();
      consoleErrorSpy.mockReset();
    });

    it('should transition to "manage_group_send_message" when Send Secret event is received in "manage_groups" state', async () => {
      const newState = await whatsappStateTransition(
        { type: 'text', text: 'Send Secret' },
        userMetaData
      );

      const state = JSON.parse(newState || '{}');
      expect(state.value).toBe('manage_group_send_message');
      expect(consoleErrorSpy).not.toHaveBeenCalled();
      consoleErrorSpy.mockReset();
    });

    it('should transition to "idle" when Buy Premium event is received in "manage_groups" state', async () => {
      const buyPremiumUserMeta = {
        phonenumber: TEST_PHONE_NUMBER,
        groupList: [
          {
            groupid: 'group1',
            groupname: 'group1',
            secret: 'group1',
            isPremium: true,
          },
          { groupid: 'group2', groupname: 'group2', secret: 'group2' },
        ],
        state:
          '{"value": "manage_groups","context": { "message": "", "selectedGroup": "group2", "groupList": [{"groupid":"group1","groupname":"group1","secret":"group1","isPremium":true},{"groupid":"group2","groupname":"group2","secret":"group2"}] }}',
      } as IUserMetaData;
      const newState = await whatsappStateTransition(
        { type: 'text', text: 'Buy Premium' },
        buyPremiumUserMeta
      );

      const state = JSON.parse(newState || '{}');
      expect(state.value).toBe('idle');
      expect(consoleErrorSpy).not.toHaveBeenCalled();
      consoleErrorSpy.mockReset();
    });

    it('should transition back to "manage_groups" when Invalid event is received in "manage_groups" state', async () => {
      const newState = await whatsappStateTransition(
        { type: 'text', text: 'Invalid message' },
        userMetaData
      );

      const state = JSON.parse(newState || '{}');
      expect(state.value).toBe('manage_groups');
      expect(consoleErrorSpy).not.toHaveBeenCalled();
      consoleErrorSpy.mockReset();
    });
  });

  describe('Transitions from manage_group_send_message state', () => {
    const userMetaData = {
      phonenumber: TEST_PHONE_NUMBER,
      groupList: [
        { groupid: 'group1', groupname: 'group1' },
        { groupid: 'group2', groupname: 'group2' },
      ],
      state:
        '{"value": "manage_group_send_message","context": { "message": "", "selectedGroup": "group1", "groupList": [{"groupid":"group1","groupname":"group1"},{"groupid":"group2","groupname":"group2"}] }}',
    } as IUserMetaData;

    it('should transition back to "idle" when CANCEL event is received in "manage_group_send_message" state', async () => {
      const newState = await whatsappStateTransition(
        { type: 'text', text: 'Cancel' },
        userMetaData
      );

      const state = JSON.parse(newState || '{}');
      expect(state.value).toBe('idle');
      expect(consoleErrorSpy).not.toHaveBeenCalled();
      consoleErrorSpy.mockReset();
    });

    it('should transition back to "manage_group_send_message" state when invalid message is provided', async () => {
      const newState = await whatsappStateTransition(
        { type: 'text', text: 'smallmsg' },
        userMetaData
      );
      const state = JSON.parse(newState || '{}');
      expect(state.value).toBe('manage_group_send_message');
      expect(consoleErrorSpy).not.toHaveBeenCalled();
      consoleErrorSpy.mockReset();
    });

    it('should transition to "confirm_message" state when valid message is provided', async () => {
      const newState = await whatsappStateTransition(
        { type: 'text', text: 'hello, this msg is a valid msg.' },
        userMetaData
      );
      const state = JSON.parse(newState || '{}');
      expect(state.value).toBe('confirm_message');
      expect(consoleErrorSpy).not.toHaveBeenCalled();
      consoleErrorSpy.mockReset();
      expect(state.context.message).toBe('hello, this msg is a valid msg.');
      expect(state.context.selectedGroup).toBe('group1');
    });
  });

  describe('Transitions from send_message state', () => {
    const userMetaData = {
      phonenumber: TEST_PHONE_NUMBER,
      groupList: [{ groupid: 'group1' }, { groupid: 'group2' }],
      state: `{"value": "send_message","context": { "selectedGroup": "group1", "groupList": [{"groupid":"group1"},{"groupid":"group2"}] }}`,
    } as IUserMetaData;

    it('should transition to "idle" state when CANCEL event is received in "send_message" state', async () => {
      const newState = await whatsappStateTransition(
        { type: 'text', text: 'cancel' },
        userMetaData
      );
      const state = JSON.parse(newState || '{}');
      expect(state.value).toBe('idle');
      expect(consoleErrorSpy).not.toHaveBeenCalled();
      consoleErrorSpy.mockReset();
    });

    it('should transition to "send_message" state when invalid message is provided', async () => {
      const newState = await whatsappStateTransition(
        { type: 'text', text: 'smallmsg' },
        userMetaData
      );
      const state = JSON.parse(newState || '{}');
      expect(state.value).toBe('send_message');
      expect(consoleErrorSpy).not.toHaveBeenCalled();
      consoleErrorSpy.mockReset();
    });

    it('should transition to "confirm_message" state when valid message is provided', async () => {
      const newState = await whatsappStateTransition(
        { type: 'text', text: 'hello, this msg is a valid msg.' },
        userMetaData
      );
      const state = JSON.parse(newState || '{}');
      expect(state.value).toBe('confirm_message');
      expect(consoleErrorSpy).not.toHaveBeenCalled();
      consoleErrorSpy.mockReset();
      expect(state.context.selectedGroup).toBe('group1');
    });
  });

  describe('Transitions from new_group state', () => {
    const userMetaData = {
      phonenumber: TEST_PHONE_NUMBER,
      groupList: [{ groupid: 'group1' }, { groupid: 'group2' }],
      state:
        '{"value": "new_group","context": { "selectedGroup": "", "groupList": [{"groupid":"group1"},{"groupid":"group2"}] }}',
    } as IUserMetaData;

    it('should transition to "idle" state when CANCEL event is received in "new_group" state', async () => {
      const newState = await whatsappStateTransition(
        { type: 'text', text: 'Cancel' },
        userMetaData
      );
      const state = JSON.parse(newState || '{}');
      expect(state.value).toBe('idle');
      expect(consoleErrorSpy).not.toHaveBeenCalled();
      consoleErrorSpy.mockReset();
    });

    it('should transition to "new_group" state when invalid link is provided', async () => {
      const newState = await whatsappStateTransition(
        { type: 'text', text: 'invalidLink' },
        userMetaData
      );
      const state = JSON.parse(newState || '{}');
      expect(state.value).toBe('new_group');
      expect(consoleErrorSpy).not.toHaveBeenCalled();
      consoleErrorSpy.mockReset();
    });

    it('should transition to "idle" state when valid link is provided', async () => {
      const newState = await whatsappStateTransition(
        {
          type: 'text',
          text: 'https://chat.whatsapp.com/I8woYePiVmVLgvyHyiigT3',
        },
        userMetaData
      );
      const state = JSON.parse(newState || '{}');
      expect(state.value).toBe('idle');
      expect(consoleErrorSpy).not.toHaveBeenCalled();
      consoleErrorSpy.mockReset();
    });

    it('should transition to "idle" state when MANUAL event is received in "new_group" state', async () => {
      const newState = await whatsappStateTransition(
        {
          type: 'text',
          text: 'Manual',
        },
        userMetaData
      );
      const state = JSON.parse(newState || '{}');
      expect(state.value).toBe('idle');
      expect(consoleErrorSpy).not.toHaveBeenCalled();
      consoleErrorSpy.mockReset();
    });
  });

  describe('Transitions from select_non_premium_group state', () => {
    const userMetaData = {
      phonenumber: TEST_PHONE_NUMBER,
      groupList: [
        {
          groupid: 'group1',
          groupname: 'group1',
          secret: 'group1',
          isPremium: true,
        },
        { groupid: 'group2', groupname: 'group2', secret: 'group2' },
        { groupid: 'group3', groupname: 'group3', secret: 'group3' },
      ],
      state:
        '{"value": "select_non_premium_group","context": { "selectedGroup": "", "groupList": [{"groupid":"group1","groupname":"group1","secret":"group1","isPremium":true},{"groupid":"group2","groupname":"group2","secret":"group2"},{"groupid":"group3","groupname":"group3","secret":"group3"}] }}',
    } as IUserMetaData;

    it('should transition back to "idle" when CANCEL event is received in "select_non_premium_group" state', async () => {
      const newState = await whatsappStateTransition(
        { type: 'text', text: 'Cancel' },
        userMetaData
      );

      const state = JSON.parse(newState || '{}');
      expect(state.value).toBe('idle');
      expect(consoleErrorSpy).not.toHaveBeenCalled();
      consoleErrorSpy.mockReset();
    });

    it('should transition to "select_non_premium_group" when invalid group is selected in "select_non_premium_group" state', async () => {
      const newState = await whatsappStateTransition(
        { type: 'text', text: 'g:group4' },
        userMetaData
      );

      const state = JSON.parse(newState || '{}');
      expect(state.value).toBe('select_non_premium_group');
      expect(consoleErrorSpy).not.toHaveBeenCalled();
      consoleErrorSpy.mockReset();
    });

    it('should transition to "idle" when valid group is selected in "select_non_premium_group" state', async () => {
      const newState = await whatsappStateTransition(
        { type: 'text', text: 'g:group2' },
        userMetaData
      );

      const state = JSON.parse(newState || '{}');
      expect(state.value).toBe('idle');
      expect(consoleErrorSpy).not.toHaveBeenCalled();
      consoleErrorSpy.mockReset();
    });
  });

  describe('Transitions from select_group state', () => {
    const userMetaData = {
      phonenumber: TEST_PHONE_NUMBER,
      groupList: [
        { groupid: 'group1', groupname: 'group1' },
        { groupid: 'group2', groupname: 'group2' },
      ],
      state:
        '{"value": "select_group","context": { "selectedGroup": "", "groupList": [{"groupid":"group1","groupname":"group1"},{"groupid":"group2","groupname":"group2"}] }}',
    } as IUserMetaData;

    it('should transition back to "idle" when CANCEL event is received in "select_group" state', async () => {
      const newState = await whatsappStateTransition(
        { type: 'text', text: 'Cancel' },
        userMetaData
      );

      const state = JSON.parse(newState || '{}');
      expect(state.value).toBe('idle');
      expect(consoleErrorSpy).not.toHaveBeenCalled();
      consoleErrorSpy.mockReset();
    });

    it('should transition to "send_message" when valid group is selected in "select_group" state', async () => {
      const newState = await whatsappStateTransition(
        { type: 'text', text: 'g:group1' },
        userMetaData
      );

      const state = JSON.parse(newState || '{}');
      expect(state.value).toBe('send_message');
      expect(consoleErrorSpy).not.toHaveBeenCalled();
      consoleErrorSpy.mockReset();
      expect(state.context.selectedGroup).toBe('group1');
    });

    it('should transition to "select_group" when invalid group is selected in "select_group" state', async () => {
      const newState = await whatsappStateTransition(
        { type: 'text', text: 'g:group3' },
        userMetaData
      );

      const state = JSON.parse(newState || '{}');
      expect(state.value).toBe('select_group');
      expect(consoleErrorSpy).not.toHaveBeenCalled();
      consoleErrorSpy.mockReset();
    });
  });

  describe('Transitions from confirm_message state', () => {
    const userMetaData = {
      phonenumber: TEST_PHONE_NUMBER,
      groupList: [
        { groupid: 'group1', groupname: 'group1' },
        { groupid: 'group2', groupname: 'group2' },
      ],
      state:
        '{"value": "confirm_message","context": { "message": "....long test message....", "selectedGroup": "group1", "groupList": [{"groupid":"group1","groupname":"group1"},{"groupid":"group2","groupname":"group2"}] }}',
    } as IUserMetaData;

    it('should transition back to "idle" when CANCEL event is received in "confirm_message" state', async () => {
      const newState = await whatsappStateTransition(
        { type: 'text', text: 'Cancel' },
        userMetaData
      );

      const state = JSON.parse(newState || '{}');
      expect(state.value).toBe('idle');
      expect(consoleErrorSpy).not.toHaveBeenCalled();
      consoleErrorSpy.mockReset();
    });

    it('should transition back to "confirm_message" when INVALID_INPUT event is received in "confirm_message" state', async () => {
      const newState = await whatsappStateTransition(
        { type: 'text', text: 'fdsfdsfds' },
        userMetaData
      );
      const state = JSON.parse(newState || '{}');
      expect(state.value).toBe('confirm_message');
      expect(consoleErrorSpy).not.toHaveBeenCalled();
      consoleErrorSpy.mockReset();
    });

    it('should transition back to "idle" when QUEUE_MESSAGE event is received in "confirm_message" state', async () => {
      const newState = await whatsappStateTransition(
        { type: 'text', text: 'send' },
        userMetaData
      );
      const state = JSON.parse(newState || '{}');
      expect(state.value).toBe('idle');
      expect(consoleErrorSpy).not.toHaveBeenCalled();
      consoleErrorSpy.mockReset();
    });

    it('should transition to "queue_failed" when UNKNOWN_ISSUE event is received in "confirm_message" state', async () => {
      const emptyGroupListUserMetaData = {
        phonenumber: TEST_PHONE_NUMBER,
        groupList: [],
        state:
          '{"value": "confirm_message","context": { "selectedGroup": "group1", "groupList": [{"groupid":"group1","groupname":"group1"},{"groupid":"group2","groupname":"group2"}] }}',
      } as IUserMetaData;

      const newState = await whatsappStateTransition(
        { type: 'text', text: 'send' },
        emptyGroupListUserMetaData
      );

      const state = JSON.parse(newState || '{}');
      expect(state.value).toBe('queue_failed');
      expect(consoleErrorSpy).not.toHaveBeenCalled();
      consoleErrorSpy.mockReset();
    });
  });

  describe('Transitions from queue_failed state', () => {
    const userMetaData = {
      phonenumber: TEST_PHONE_NUMBER,
      groupList: [],
      state:
        '{"value": "queue_failed","context": { "selectedGroup": "group1", "groupList": [{"groupid":"group1","groupname":"group1"},{"groupid":"group2","groupname":"group2"}] }}',
    } as IUserMetaData;

    it('should transition back to "confirm_message" when RETRY event is received in "queue_failed" state', async () => {
      const newState = await whatsappStateTransition(
        { type: 'text', text: 'Retry' },
        userMetaData
      );

      const state = JSON.parse(newState || '{}');
      expect(state.value).toBe('confirm_message');
      expect(consoleErrorSpy).not.toHaveBeenCalled();
      consoleErrorSpy.mockReset();
    });

    it('should transition back to "idle" when CANCEL event is received in "queue_failed" state', async () => {
      const newState = await whatsappStateTransition(
        { type: 'text', text: 'Cancel' },
        userMetaData
      );

      const state = JSON.parse(newState || '{}');
      expect(state.value).toBe('idle');
      expect(consoleErrorSpy).not.toHaveBeenCalled();
      consoleErrorSpy.mockReset();
    });

    it('should transition back to "queue_failed" when INVALID_INPUT event is received in "queue_failed" state', async () => {
      const newState = await whatsappStateTransition(
        { type: 'text', text: 'sdfsdfdsf' },
        userMetaData
      );

      const state = JSON.parse(newState || '{}');
      expect(state.value).toBe('queue_failed');
      expect(consoleErrorSpy).not.toHaveBeenCalled();
      consoleErrorSpy.mockReset();
    });
  });
});
