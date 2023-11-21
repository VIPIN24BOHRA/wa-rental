export interface UserDetails {
  phoneNumber: string;
  state: UserState;
  isPremium: false;
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
