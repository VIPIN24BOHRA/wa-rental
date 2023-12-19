/* eslint-disable import/extensions */
// import '@/modules/firebase/firebase';

import type { NextApiRequest, NextApiResponse } from 'next';

import { replyToUser } from '@/utils/replyHelper';

async function handleGetRequest(_req: NextApiRequest, res: NextApiResponse) {
  res
    .status(200)
    .send(
      `this is phone number ${
        process.env.PHONE_ID
      } this is app name ${process.env.APP_NAME?.slice(
        0,
        3
      )} this is database url ${
        process.env.FIREBASE_DATABASE_URL
      }, these are account basic details`
    );
}

async function handlePostRequest(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { app, type, payload } = req.body;
    console.log(req.body);

    if (
      app === process.env.APP_NAME &&
      type === 'message' &&
      (payload?.type === 'text' ||
        payload?.type === 'button_reply' ||
        payload?.type === 'list_reply' ||
        payload?.type === 'quick_reply')
    ) {
      // process only the message that comes from user.
      // reply to user
      console.log('reply to user from here');
      console.log(req.body);
      await replyToUser(payload);
    }
    res.status(200).send('');
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error(e);
    res.status(200).send('unable to save response');
  }
}

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === 'GET') await handleGetRequest(req, res);
  else if (req.method === 'POST') await handlePostRequest(req, res);
  else res.status(400).send('Invalid request method');
};
export default handler;
