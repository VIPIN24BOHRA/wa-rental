export interface MachineContext {
  budget: string;
  noOfRooms: number;
  currentPage: number;
  longitude: number;
  latitude: number;
  videoLinkMap: VideoLinkMap;
  location: string;
}

export interface VideoLinkMap {
  [input: string]: string;
}

export interface UserMetaData {
  state?: string;
  phonenumber: string;
  name?: string;
  totalAttempts?: number;
  getContactAttempts?: number;
  subscribed?: boolean;
}

export interface MachineConfig {
  userMetaData: UserMetaData;
  whatsappInstance: WhatsappInstance;
}

export interface WhatsappInstance {
  lock: boolean;
  send: (payload: any) => Promise<void>;
}
