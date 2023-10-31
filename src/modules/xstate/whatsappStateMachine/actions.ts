import { assign } from 'xstate';

import {
  addNewConfessionToQueue,
  addNewInviteLinkToQueue,
} from '@/modules/firebase/database';
import type {
  QueuedConfession,
  QueuedInviteLink,
} from '@/modules/firebase/firebaseTypes';
import type { ICreateMessagePayload } from '@/modules/whatsapp/whatsapp';
import { hash } from '@/utils/helper';

import type {
  IGroup,
  IMachineConfig,
  IMachineContext,
  IWhatsappInstance,
} from './types';

async function sendMessage(
  whatsappInstance: IWhatsappInstance,
  message: string,
  phonenumber: string
) {
  const payload: ICreateMessagePayload = {
    phoneNumber: phonenumber,
    text: true,
    msgBody: message,
  };

  await whatsappInstance.send(payload);
}

export const actionsFactory = (config: IMachineConfig): any => {
  return {
    assignDefaultValues: assign({
      message: () => '',
      selectedGroup: () => '',
      groupList: () => [],
    }),
    assignDetailsFromEvent: assign({
      message: (_, event: any) => event.message,
      groupList: (_, event: any) => event.groupList,
    }),
    assignSelectedGroup: assign({
      selectedGroup: (context: IMachineContext, _) =>
        context?.groupList[0]?.groupid ?? '',
    }),
    assignSelectedGroupFromEvent: assign({
      selectedGroup: (_, event: any) => event.selectedGroup,
    }),
    // GENERIC MESSAGE ACTIONS
    sendInvalidInputMessage: async () => {
      const message =
        "⚠️ Oops!\n\nIt seems you've provided an invalid input.\n\nLet's give it another try.";
      await sendMessage(
        config.whatsappInstance,
        message,
        config.userMetaData.phonenumber
      );
    },
    sendCancelMessage: async () => {
      const message =
        "🚫 No problem!\n\nYour request has been canceled.\nLet's start over.";
      await sendMessage(
        config.whatsappInstance,
        message,
        config.userMetaData.phonenumber
      );
    },

    // SEND ONBOARDING MESSAGE
    sendOnBoardingMessage: async () => {
      const payload: ICreateMessagePayload = {
        phoneNumber: config.userMetaData.phonenumber,
        video: true,
        videoLink: 'https://secretapp.net/assets/videos/adminVideoCropped.mp4',
      };
      await config.whatsappInstance.send(payload);
    },
    // SEND ONBOARDING ADDING INSTRUCTION
    sendOnBoardingAddingInstruction: async () => {
      const message = `👋 Welcome to Secret App! \n\nFollow this to Enable Secret Message Sharing Manually 🔒\n\n 1. 📝 Save the provided contact as "Secret App" in your phone's contacts.\n 2. Tap 👥 "Add Participants" inside the group and choose "Secret App" from the contact list.\n 3. If not admin, please ask group admin to add "Secret App" contact.😊`;
      await sendMessage(
        config.whatsappInstance,
        message,
        config.userMetaData.phonenumber
      );
    },

    // INTRO OPTIONS RELATED ACTIONS
    sendIntroOptionsMessage: async () => {
      const message = `👋 Welcome to Secret App!\n\nShare secrets with your friends anonymously! 👫\n\nYour secret will be anonymously forwarded to a group of your choice without revealing your identity.\n\n1️⃣My Groups: See all the groups you can send secret messages to.\n 2️⃣Send Secret: Send a secret message 📝💬 in your groups.\n3️⃣Help: 🙋 Send help for more details.`;
      const payload: ICreateMessagePayload = {
        phoneNumber: config.userMetaData.phonenumber,
        quickReply: true,
        button1: 'My Groups',
        button2: 'Send Secret',
        button3: 'Help',
        msgBody: message,
      };
      await config.whatsappInstance.send(payload);
    },

    // HELP MESSAGE
    sendHelpMessage: async () => {
      const message = `🤔: What is Secret App?\n✅: 🤫 Secret App is an anonymous messaging service for WhatsApp.\n\n🤔: How does it work?\n👍: 📲 Send a message to the WhatsApp bot, 🙋‍♂️ add a number to your group, and start sharing secrets anonymously.🎥 Watch our tutorial videos for admins or members for more details.\n\n🤔: How much does it cost?\n💯: 💸 It's absolutely free! Upgrade to our premium plan for additional features and benefits.`;
      const payload: ICreateMessagePayload = {
        phoneNumber: config.userMetaData.phonenumber,
        quickReply: true,
        button1: 'Admin Video',
        button2: 'Member Video',
        button3: 'Cancel',
        msgBody: message,
      };
      await config.whatsappInstance.send(payload);
    },
    // SEND ADMIN VIDEO
    sendAdminVideo: async () => {
      const payload: ICreateMessagePayload = {
        phoneNumber: config.userMetaData.phonenumber,
        video: true,
        videoLink: 'https://secretapp.net/assets/videos/adminVideo.mp4',
      };
      await config.whatsappInstance.send(payload);
    },
    // SEND MEMBER VIDEO
    sendMemberVideo: async () => {
      const payload: ICreateMessagePayload = {
        phoneNumber: config.userMetaData.phonenumber,
        video: true,
        videoLink: 'https://secretapp.net/assets/videos/memberVideo.mp4',
      };
      await config.whatsappInstance.send(payload);
    },
    sendManageGroupsListMessage: async () => {
      const message = `
      Click the button below to manage your groups.\n\n😀 You can also *'add a new group'* by selecting that option.\nIf you wish to cancel, select *'Cancel'*. ❌`;
      const payload: ICreateMessagePayload = {
        phoneNumber: config.userMetaData.phonenumber,
        list: true,
        listButton: 'Manage Groups',
        msgBody: message,
      };
      const LIST_TITLE_LIMIT = 10;
      const CHARACTERS_LIMIT = 24;
      const groups = config.userMetaData.groupList.slice(
        0,
        LIST_TITLE_LIMIT - 2
      );
      groups.forEach((group: IGroup, idx: number) => {
        let item = `${group.groupname || '-'}:${group.groupid || '-'}`;
        if (item.length > CHARACTERS_LIMIT) {
          item = `:${group.groupid || '-'}`;
          item = `${`${group.groupname || '-'}`.slice(
            0,
            24 - item.length - 2
          )}..${item}`;
        }
        // @ts-ignore
        payload[`listTitle${idx + 1}`] = item;
      });
      // @ts-ignore
      payload[`listTitle${groups.length + 1}`] = 'Add New Group';
      // @ts-ignore
      payload[`listTitle${groups.length + 2}`] = 'Cancel';
      await config.whatsappInstance.send(payload);
    },

    sendManageGroupsOptionMessage: async (context: any, _event: any) => {
      const group = context?.groupList?.filter(
        (g: any) => g.groupid === context.selectedGroup
      )[0];
      const message = `You have selected ${group.groupname} ${
        group.isPremium ? '(Premium)' : ''
      } 😃.\n\n secret key is ${group.secret} 🔒💫`;
      let payload: ICreateMessagePayload = {
        phoneNumber: config.userMetaData.phonenumber,
        quickReply: true,
        button1: 'Send Secret',
        msgBody: message,
      };
      if (group?.isPremium) {
        payload = { ...payload, button2: 'Cancel' };
      } else {
        payload = { ...payload, button2: 'Buy Premium', button3: 'Cancel' };
      }
      await config.whatsappInstance.send(payload);
    },

    sendPremiumLinkWithGroupSecretFromManageGroups: async (
      context: any,
      _event: any
    ) => {
      const group = context?.groupList?.filter(
        (g: any) => g.groupid === context.selectedGroup
      )[0];

      const message = `🎉 Amazing! 🚀 We're just one step away from launching premium features in your group.\n\nplease visit our website at https://secretapp.net/buy/${group.secret} to complete the premium flow. ⭐️🔒`;
      await sendMessage(
        config.whatsappInstance,
        message,
        config.userMetaData.phonenumber
      );
    },

    sendUserGroupList: async () => {
      let groupList = '';
      const groups = config.userMetaData.groupList;
      groups.forEach((group: IGroup, idx: number) => {
        groupList += `${idx + 1}: ${group.groupname || '-'} ${
          group.isPremium ? '(Premium)' : ''
        } : ( Secret: ${group.secret || '-'} ) \n`;
      });
      const message = `📋 Here is the list of your groups:\n\n${groupList}\n\nYou are a part of these amazing groups! 🎉👥`;
      const payload: ICreateMessagePayload = {
        phoneNumber: config.userMetaData.phonenumber,
        quickReply: true,
        button1: 'Buy Premium',
        button2: 'Cancel',
        msgBody: message,
      };
      await config.whatsappInstance.send(payload);
    },

    // SEND MESSAGE OPTIONS RELATED ACTIONS
    sendSendMessageOptionsMessage: async () => {
      const message =
        "📝💬 Sure thing!\n\nPlease type your secret message and press send.\n\nIf you want to cancel, select *'Cancel'*";
      const payload: ICreateMessagePayload = {
        phoneNumber: config.userMetaData.phonenumber,
        quickReply: true,
        button1: 'Cancel',
        msgBody: message,
      };
      await config.whatsappInstance.send(payload);
    },
    sendInvalidMessageMessage: async () => {
      const message =
        '❌ Oops!\n\nThere seems to be an issue with your message. Make sure the message is not too short.\n\nPlease try again.';
      await sendMessage(
        config.whatsappInstance,
        message,
        config.userMetaData.phonenumber
      );
    },

    // NEW GROUP OPTIONS ACTIONS
    sendNewGroupOptionMessage: async () => {
      const message =
        "📨 Hey there!\n\nPlease send group invite link so that secret message sharing can be enabled in your group in no time! 🚀💫\n\n Or 🔒 Select Manual option if you don't have invite link.\n\n  🌐👥";

      const payload: ICreateMessagePayload = {
        phoneNumber: config.userMetaData.phonenumber,
        quickReply: true,
        button1: 'Manual',
        button2: 'Cancel',
        msgBody: message,
        imageHeader: true,
        imageLink: 'https://secretapp.net/assets/images/inviteImage.png',
      };

      await config.whatsappInstance.send(payload);
    },
    sendInviteSuccessMessage: async () => {
      const message =
        "🎉 Fantastic! You've chosen to enable secret message sharing in your group! 🌟👥\n\nYour request has been received.! 🚀💬 \n\nNow secret message sharing will be enabled in your group in no time! 🚀💫";
      await sendMessage(
        config.whatsappInstance,
        message,
        config.userMetaData.phonenumber
      );
    },

    // HAS NO NON-PREMIUM GROUP ACTIONS
    sendNoNonPremiumGroupMessage: async () => {
      const message = `⚠️ We regret to inform you that, there are no non-premium groups available.\n\nPlease visit our website at https://secretapp.net to know how to use our service.`;
      await sendMessage(
        config.whatsappInstance,
        message,
        config.userMetaData.phonenumber
      );
    },

    // HAS GROUPS PHANTOM OPTIONS ACTIONS
    sendNoGroupsMessage: async () => {
      const message = `⚠️ Sorry, but there are currently no groups available for posting secrets.\nPlease visit our website at https://secretapp.net to know how to use our service.`;
      await sendMessage(
        config.whatsappInstance,
        message,
        config.userMetaData.phonenumber
      );
    },

    // SELECT NON-PREMIUM GROUP OPTIONS ACTIONS
    sendSelectNonPremiumGroupOptionsMessage: async () => {
      const message =
        '👥 Sure thing!\n\nYou have non-premium groups available.\n\nPlease select a group from the list.';
      const payload: ICreateMessagePayload = {
        phoneNumber: config.userMetaData.phonenumber,
        list: true,
        listButton: 'Select Group',
        msgBody: message,
      };
      const CHARACTERS_LIMIT = 24;
      const groups = config.userMetaData.groupList.filter(
        (g: IGroup) => !g.isPremium
      );
      groups.forEach((group: IGroup, idx: number) => {
        let item = `${group.groupname || '-'}:${group.groupid || '-'}`;
        if (item.length > CHARACTERS_LIMIT) {
          item = `:${group.groupid || '-'}`;
          item = `${`${group.groupname || '-'}`.slice(
            0,
            24 - item.length - 2
          )}..${item}`;
        }
        // @ts-ignore
        payload[`listTitle${idx + 1}`] = item;
      });
      // @ts-ignore
      payload[`listTitle${groups.length + 1}`] = 'Cancel';
      await config.whatsappInstance.send(payload);
    },

    // SEND LINK TO COMPLETE PREMIUM WITH GROUP SECRET
    sendPremiumLinkWithGroupSecret: async (_context: any, event: any) => {
      const { selectedGroup, groupList } = event;
      const group = groupList?.filter(
        (g: any) => g.groupid === selectedGroup && !g.isPremium
      )[0];

      const message = `🎉 Amazing! 🚀 We're just one step away from launching premium features in your group.\n\nplease visit our website at https://secretapp.net/buy/${group.secret} to complete the premium flow. ⭐️🔒`;
      await sendMessage(
        config.whatsappInstance,
        message,
        config.userMetaData.phonenumber
      );
    },

    // SELECT GROUP OPTIONS ACTIONS
    sendSelectGroupOptionsMessage: async () => {
      const message =
        '👥 Sure thing!\n\nYou have multiple groups available for sharing.\n\nPlease select a group from the list.';
      const payload: ICreateMessagePayload = {
        phoneNumber: config.userMetaData.phonenumber,
        list: true,
        listButton: 'Select Group',
        msgBody: message,
      };
      const LIST_TITLE_LIMIT = 10;
      const CHARACTERS_LIMIT = 24;
      const groups = config.userMetaData.groupList.slice(
        0,
        LIST_TITLE_LIMIT - 1
      );
      groups.forEach((group: IGroup, idx: number) => {
        let item = `${group.groupname || '-'}:${group.groupid || '-'}`;
        if (item.length > CHARACTERS_LIMIT) {
          item = `:${group.groupid || '-'}`;
          item = `${`${group.groupname || '-'}`.slice(
            0,
            24 - item.length - 2
          )}..${item}`;
        }
        // @ts-ignore
        payload[`listTitle${idx + 1}`] = item;
      });
      // @ts-ignore
      payload[`listTitle${groups.length + 1}`] = 'Cancel';
      await config.whatsappInstance.send(payload);
    },

    // SEND CONFIRM MESSAGE OPTIONS ACTIONS
    sendConfirmMessageOptionsMessage: async (context: any) => {
      const groupname =
        context?.groupList?.filter(
          (g: IGroup) => g.groupid === context.selectedGroup
        )[0]?.groupname || '';
      const message = `📤 Your secret message is ready to be posted anonymously in Group ${groupname}!\n\nIf you're sure you want to share it, select *'Send'*.\nTo cancel, select *'Cancel'*.`;

      const payload: ICreateMessagePayload = {
        phoneNumber: config.userMetaData.phonenumber,
        quickReply: true,
        button1: 'Send',
        button2: 'Cancel',
        msgBody: message,
      };

      await config.whatsappInstance.send(payload);
    },
    sendMessageQueuedMessage: async () => {
      const message =
        '✅ Success!\n\nYour secret message has been queued for posting.\nStay tuned for the anonymous reveal in the group! 🤐';
      await sendMessage(
        config.whatsappInstance,
        message,
        config.userMetaData.phonenumber
      );
    },
    sendQueueCongestedMessage: async () => {
      const message = `Wow,\n\nIt seems your group is a chamber of secrets!\n\nWe've received so many secret messages that we're a bit backed up at the moment.\n\n⏳ Don't worry, though! Your words matter, so please try submitting your secret message again a little later.\n\nThank you for making our service a part of your group!`;
      await sendMessage(
        config.whatsappInstance,
        message,
        config.userMetaData.phonenumber
      );
    },

    // SEND QUEUE FAILED OPTIONS ACTIONS
    sendQueueFailedOptionsMessage: async () => {
      const message = `❌ Sorry, we encountered an unknown issue while processing your secret message.\n\nPlease select *'Retry'* to try again.\nTo cancel, select *'Cancel'*.🕒`;
      const payload: ICreateMessagePayload = {
        phoneNumber: config.userMetaData.phonenumber,
        quickReply: true,
        button1: 'Retry',
        button2: 'Cancel',
        msgBody: message,
      };
      await config.whatsappInstance.send(payload);
    },
    saveMessageToQueue: async (context: any) => {
      const { message, selectedGroup } = context;
      const confession: QueuedConfession = {
        createdat: Date.now(),
        source: 'phonenumber',
        text: message,
        groupid: selectedGroup,
        phonenumber: config.userMetaData.phonenumber,
      };
      await addNewConfessionToQueue(confession);
    },
    saveInviteLinkToQueue: async (_context: any, event: any) => {
      const { inviteurl } = event;
      const inviteLink: QueuedInviteLink = {
        createdat: Date.now(),
        inviteurl,
      };
      const probablity = hash(config.userMetaData.phonenumber) % 2;
      const BOT_ID = probablity ? '917464052062' : '918077911477';

      await addNewInviteLinkToQueue(BOT_ID, inviteLink);
    },
    sendSecretAppContactDetails: async () => {
      const probablity = hash(config.userMetaData.phonenumber) % 2;
      const BOT_NUMBER = probablity ? '917464052062' : '918077911477';

      const payload = {
        phoneNumber: config.userMetaData.phonenumber,
        contact: true,
        contactFirstName: 'Secret App',
        contactFullName: 'Secret App',
        contactPhoneNumber: BOT_NUMBER,
      };
      await config.whatsappInstance.send(payload);
    },
    sendManuallyAddingInstruction: async () => {
      const message = `👋 Enable Secret Message Sharing Manually 🔒\n\n 1. 📝 Save the provided contact as "Secret App" in your phone's contacts.\n 2. Tap 👥 "Add Participants" inside the group and choose "Secret App" from the contact list.\n 3. If not admin, please ask group admin to add "Secret App" contact.😊`;
      await sendMessage(
        config.whatsappInstance,
        message,
        config.userMetaData.phonenumber
      );
    },
  };
};
