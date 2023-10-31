import { getFirestore } from 'firebase-admin/firestore';

import { getGroupListForUser } from '@/modules/firebase/database';
import type { GroupMeta } from '@/modules/firebase/firebaseTypes';
import { whatsappStateTransition } from '@/modules/xstate/whatsappStateMachine';
import type {
  IGroup,
  IUserMetaData,
} from '@/modules/xstate/whatsappStateMachine/types';

import { isMessageValid } from './MessageCheckers';
import { extractText } from './MessageParsers';

async function setUserState(state: string, clientid: string) {
  const wabaId = process.env.WABA_ID;
  const clientDoc = getFirestore()
    .collection('apps')
    .doc(wabaId as string)
    .collection('clients')
    .doc(clientid);
  const updates: any = { state };
  await clientDoc.set(updates, { merge: true });
}

async function getUserDetails(clientid: string) {
  const wabaId = process.env.WABA_ID;
  const clientDoc = getFirestore()
    .collection('apps')
    .doc(wabaId as string)
    .collection('clients')
    .doc(clientid);
  const clientData = await clientDoc.get();
  const { state, name, lastupdatedat } = clientData.data() || {};
  return {
    state: state || '',
    name,
    phonenumber: clientid,
    lastupdatedat,
  };
}

// eslint-disable-next-line consistent-return
export async function replyToUser(messageObject: any) {
  // Check msg validity
  const msgValid = await isMessageValid(messageObject);
  if (msgValid) {
    const message = extractText(messageObject);
    const { clientid } = messageObject;

    const userDetails = await getUserDetails(clientid);
    const { state, name, phonenumber } = userDetails;
    const groupList: IGroup[] = (await getGroupListForUser(clientid)).map(
      (group: GroupMeta) =>
        ({
          groupid: group.groupid,
          groupname: group.groupname,
          secret: group.secret.secret,
          isPremium: group.isPremium,
        } as IGroup)
    );
    const newState = await whatsappStateTransition(
      { type: 'text', text: message },
      { state, groupList, name, phonenumber } as IUserMetaData
    );
    if (newState && newState !== state) {
      await setUserState(newState, clientid);
    }
  }
}
