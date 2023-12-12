/* eslint-disable import/extensions */
// import '@/modules/firebase/firebase';

import type { NextApiRequest, NextApiResponse } from 'next';

import { setUserSubscribed } from '@/modules/firebase/database';

async function handlePostRequest(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { apiKey, phoneNumber, subscribe } = req.body;

    if (!apiKey || apiKey !== process.env.WEB_API_KEY) {
      res.status(401).send({ success: false, error: 'Invalid Api key' });
      return;
    }

    if (!phoneNumber || subscribe === undefined) {
      res.status(400).send({ success: false, error: 'Invalid Payload' });
    }

    const user = await setUserSubscribed(phoneNumber, subscribe);
    res.status(200).send({ user, success: true });
    return;
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error(e);
    res.status(200).send('unable to save response');
  }
}

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === 'POST') await handlePostRequest(req, res);
  else res.status(400).send('Invalid request method');
};
export default handler;
