/* eslint-disable consistent-return */
import * as admin from 'firebase-admin';

import { removeNullKeys, sanitizePath } from './firebase';
import type { UserDetails } from './firebase.types';

export const getWaUserDetails = async (phoneNumber: string) => {
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

export const setWaUserDetails = async (userDetails: any) => {
  if (!userDetails || !userDetails.phoneNumber) return;
  const db = admin.database();
  const ref = db.ref(sanitizePath(`/app/user/${userDetails.phoneNumber}`));
  try {
    await ref.set(userDetails);
  } catch (err) {
    console.log('error while setUserDetails', err);
  }
};

export const createWaNewLoginObj = async (newUserDetails: any) => {
  if (!newUserDetails || !newUserDetails.phoneNumber) return;
  const db = admin.database();
  const ref = db.ref(sanitizePath(`/app/waLoginKey`));
  try {
    const newLoginKey = ref.push();
    await newLoginKey.set(removeNullKeys(newUserDetails));
    return { key: newLoginKey.key };
  } catch (err) {
    console.log('error while createNewLoginObj', err);
    return null;
  }
};

export const getWANewLoginObj = async (key: string) => {
  const db = admin.database();
  const ref = db.ref(sanitizePath(`/app/waLoginKey/${key}`));
  try {
    const snap = await ref.once('value');
    if (snap.exists()) {
      const value = snap.val() as any;
      await ref.set(null);
      return value;
    }
    return null;
  } catch (err) {
    console.log('error while getNewLoginObj', err);
    return null;
  }
};
