export interface UserDetails {
  phoneNumber: string;
  state: UserState;
  isPremium: false;
  attempts: number;
  createdAt: number;
  updatedAt: number;
}

export interface UserState {
  state: string;
  lastSeenAt: number;
}
