export interface UserDetails {
  phoneNumber: string;
  state: UserState;
  subscribed?: boolean;
  attempts: number;
  createdAt: number;
  updatedAt: number;
}

export interface UserState {
  totalAttempts: number;
  getContactAttempts: number;
  state: string;
  lastSeenAt: number;
}

export interface LocationDetails {
  lat: any;
  lng: any;
  name?: string;
}

export interface UserSearchedFilters {
  lat: any;
  lng: any;
  location: string;
  room: string;
  createdAt: number;
  phoneNumber: string;
}
