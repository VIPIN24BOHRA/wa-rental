export interface MachineContext {
  budget: string;
  noOfRooms: number;
  currentPage: number;
  longitude: number;
  latitude: number;
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
