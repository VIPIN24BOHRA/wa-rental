import * as admin from 'firebase-admin';

import { removeNullKeys, sanitizePath } from './firebase';
import type { UserDetails, UserState } from './firebase.types';

export const getUserDetails = async (phoneNumber: string) => {
  const db = admin.database();
  const ref = db.ref(sanitizePath(`/app/user/${phoneNumber}`));
  try {
    const snap = await ref.once('value');
    if (snap.exists()) {
      return snap.val() as UserDetails;
    }
  } catch (err) {
    console.log('error while getUserDetails', err);
  }
  return {} as UserDetails;
};

export const getAllUserDetails = async () => {
  const db = admin.database();
  const ref = db.ref(sanitizePath(`/app/user/`));
  try {
    const snap = await ref.once('value');
    if (snap.exists()) {
      return Object.values(snap.val()) as UserDetails[];
    }
  } catch (err) {
    console.log('error while getUserDetails', err);
  }
  return [] as UserDetails[];
};

export const setUserDetails = async (user: UserDetails) => {
  const db = admin.database();
  const ref = db.ref(sanitizePath(`/app/user/${user.phoneNumber}`));
  try {
    await ref.set(removeNullKeys(user));
    console.log('successfully saved user details ', user.phoneNumber);
  } catch (err) {
    console.log('error while getUserDetails', err);
  }
};

export const getUserSavedState = async (phoneNumber: string) => {
  const db = admin.database();
  const ref = db.ref(sanitizePath(`/app/user/${phoneNumber}/state`));
  try {
    const snap = await ref.once('value');
    if (snap.exists()) {
      return snap.val() as UserState;
    }
  } catch (err) {
    console.log('error while getUserDetails', err);
  }
  return {} as UserState;
};

export const saveUserState = async (phoneNumber: string, state: UserState) => {
  const db = admin.database();
  const ref = db.ref(sanitizePath(`/app/user/${phoneNumber}/state`));
  try {
    await ref.set(removeNullKeys(state));
    console.log('successfully saved user details ', phoneNumber);
  } catch (err) {
    console.log('error while getUserDetails', err);
  }
};
