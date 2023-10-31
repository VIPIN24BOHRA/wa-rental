import type { ICreateMessagePayload } from '@/modules/whatsapp/whatsapp';

// MachineConfig Type Definition
export interface IMachineConfig {
  userMetaData: IUserMetaData;
  storeInstance: IStoreInstance;
  whatsappInstance: IWhatsappInstance;
}

export interface IStoreInstance {}

export interface IWhatsappInstance {
  lock: boolean;
  send: (payload: ICreateMessagePayload) => Promise<void>;
}

export interface IMachineContext {
  message?: string;
  selectedGroup?: string;
  groupList: IGroup[];
}

export interface IGroup {
  groupid: string;
  groupname: string;
  secret: string;
  isPremium?: boolean;
}

export interface IUserMetaData {
  state?: string;
  phonenumber: string;
  name?: string;
  groupList: IGroup[];
}
