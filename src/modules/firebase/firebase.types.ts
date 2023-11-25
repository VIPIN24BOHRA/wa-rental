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
