import type { IGroup, IMachineConfig, IMachineContext } from './types';

const MESSAGE_LENGTH_THRESHOLD = 10;
export const gaurdsFactory = (_machineConfig: IMachineConfig): any => {
  return {
    noGroups: (context: IMachineContext) => !context.groupList?.length,
    oneGroup: (context: IMachineContext) => context.groupList?.length === 1,
    manyGroups: (context: IMachineContext) => context.groupList?.length > 1,
    hasNonPremiumGroup: (context: IMachineContext) =>
      context.groupList.filter((g: IGroup) => !g.isPremium)?.length,
    noNonPremiumGroup: (context: IMachineContext) =>
      !context.groupList.filter((g: IGroup) => !g.isPremium)?.length,

    invalidMessageEvent: (_context: IMachineContext, event: any) =>
      (event.message || '').length < MESSAGE_LENGTH_THRESHOLD,
    invalidInviteLink: (_context: IMachineContext, event: any) =>
      !event.inviteurl ||
      !/^(https?:\/\/)?chat(?:.whatsapp\.com\/)([a-zA-Z0-9_-]*)$/.test(
        event.inviteurl
      ),
    invalidSelectedGroup: (_context: IMachineContext, event: any) =>
      !event.selectedGroup ||
      !event.groupList?.filter((g: any) => g.groupid === event.selectedGroup)
        .length,
    invalidSelectedNonPremiumGroup: (_context: IMachineContext, event: any) =>
      !event.selectedGroup ||
      !event.groupList?.filter(
        (g: any) => g.groupid === event.selectedGroup && !g.isPremium
      ).length,
  };
};
