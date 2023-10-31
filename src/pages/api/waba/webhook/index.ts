/* eslint-disable import/extensions */
import '@/modules/firebase/firebase';

import bodyParser from 'body-parser';
import crypto from 'crypto';
import { getFirestore } from 'firebase-admin/firestore';
import type { NextApiRequest, NextApiResponse } from 'next';

import { replyToUser } from '@/utils/ReplyHelper';
import { runMiddleware } from '@/utils/runMiddleware';

function parseMessagePayload(payload: any) {
  let timestamp = Date.now();
  if (payload.errors) timestamp = payload.errors[0].timestamp * 1e3;
  if (payload.messages) timestamp = payload.messages[0].timestamp * 1e3;
  if (payload.statuses) timestamp = payload.statuses[0].timestamp * 1e3;

  let type = 'error';
  if (payload.statuses) type = 'status';
  if (payload.messages) type = 'message';

  let clientid = null;
  if (payload.statuses) clientid = payload.statuses[0].recipient_id;
  if (payload.messages) clientid = payload.messages[0].from;

  return {
    timestamp,
    type,
    clientid,
    messaging_product: payload.messaging_product,
    metadata: payload.metadata,
    // status messages
    status_raw: payload.statuses ? payload.statuses[0] : null,
    pricing: payload.statuses ? payload.statuses[0].pricing || null : null,
    status: payload.statuses ? payload.statuses[0].status || null : null,
    origin: payload.statuses ? payload.statuses[0].origin?.type || null : null,
    // incoming message
    message: payload.messages ? payload.messages[0] : null,
    contact: payload.contacts ? payload.contacts[0] : null,
    // error
    error: payload.errors ? payload.errors[0] : null,
  };
}

async function handleGetRequest(req: NextApiRequest, res: NextApiResponse) {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];
  if (
    mode &&
    token &&
    mode === 'subscribe' &&
    token === process.env.WEBHOOK_VERIFY_TOKEN
  ) {
    res.status(200).send(challenge);
  } else {
    res.status(403).send('Invalid verify_token');
  }
}

async function handlePostRequest(req: NextApiRequest, res: NextApiResponse) {
  // get raw request body
  await runMiddleware(req, res, bodyParser.raw({ type: 'application/json' }));

  // verify whether payload has been sent by fb only
  const hmac: crypto.Hmac = crypto.createHmac(
    'sha1',
    process.env.FACEBOOK_APP_SECRET || 'N/A'
  );
  hmac.update(req.body || '', 'ascii');
  const expectedSignature: string = hmac.digest('hex');
  if (
    req.headers['x-hub-signature']?.toString() === `sha1=${expectedSignature}`
  ) {
    // save the messages
    try {
      const data = JSON.parse(req.body);
      const subscriptionObject = data.object;
      const wabaId = data.entry[0].id;
      const { field, value: payload } = data.entry[0].changes[0];
      if (
        subscriptionObject === 'whatsapp_business_account' &&
        field === 'messages' &&
        wabaId === process.env.WABA_ID
      ) {
        const messageObject = parseMessagePayload(payload);
        // Do not ignore status messages
        if (
          messageObject.clientid &&
          messageObject.timestamp &&
          (messageObject.type === 'message' || messageObject.type === 'status')
        ) {
          const clientDoc = getFirestore()
            .collection('apps')
            .doc(wabaId as string)
            .collection('clients')
            .doc(messageObject.clientid);
          await clientDoc.collection('messages').add(messageObject);

          // make updates to the profile
          const updates: any = { lastupdatedat: messageObject.timestamp };
          if (messageObject.type === 'message') {
            updates.lastseen = messageObject.timestamp;
            if (messageObject.contact?.profile?.name) {
              updates.name = messageObject.contact?.profile?.name;
            }
          }
          updates.lastupdatedat = messageObject.timestamp;
          await clientDoc.set(updates, { merge: true });

          // eslint-disable-next-line no-console
          console.log(
            'webhook triggered on: ',
            messageObject.type,
            messageObject.timestamp,
            messageObject.type === 'message' ? messageObject.message : ''
          );

          // send response if response is required and message is not older than 3 minutes
          if (messageObject.timestamp > Date.now() / 1000 - 180) {
            // eslint-disable-next-line no-console
            console.log('sending response');
            await replyToUser(messageObject);
          }
        }
      }
      res.status(200).send('success');
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e);
      res.status(200).send('unable to save response');
    }
  } else {
    res.status(401).send('Invalid signature');
  }
}

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === 'GET') await handleGetRequest(req, res);
  else if (req.method === 'POST') await handlePostRequest(req, res);
  else res.status(400).send('Invalid request method');
};

export const config = {
  api: {
    bodyParser: false,
  },
};
export default handler;
