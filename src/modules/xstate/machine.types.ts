export interface MachineContext {
  message: string;
  location: string;
  budget: number;
  noOfRooms: number;
  listing: string;
  for: string;
}

export interface UserMetaData {
  state?: string;
  phonenumber: string;
  name?: string;
}

export interface MachineConfig {
  userMetaData: UserMetaData;
  whatsappInstance: WhatsappInstance;
}

export interface WhatsappInstance {
  lock: boolean;
  send: (payload: any) => Promise<void>;
}
