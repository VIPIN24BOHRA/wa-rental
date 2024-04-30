/* eslint-disable import/extensions */
// import '@/modules/firebase/firebase';

import type { NextApiRequest, NextApiResponse } from 'next';

import { decryptData } from '@/utils/authenticateHelper/helper';

async function handlePostRequest(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { apiKey, token } = req.body;

    if (!apiKey || apiKey !== process.env.WEB_API_KEY) {
      res.status(401).send({ success: false, error: 'Invalid Api key' });
      return;
    }
    if (!token) {
      res.status(400).send({ success: false, error: 'Token is missing' });
      return;
    }

    const userData = JSON.parse(decryptData(token) ?? '');

    if (userData && userData?.expireAt < Date.now()) {
      res.status(400).send({ msg: 'expired token', success: false });

      return;
    }

    res.status(200).send({ success: true, user: userData });
    return;
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error(e);
    res.status(200).send('unable to save response');
  }
}

async function handleGetRequest(_req: NextApiRequest, res: NextApiResponse) {
  try {
    res.status(200).send('verifyUser api is up and running');
    return;
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error(e);
    res.status(200).send('some error');
  }
}

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === 'POST') await handlePostRequest(req, res);
  else if (req.method === 'GET') await handleGetRequest(req, res);
  else res.status(400).send('Invalid request method');
};
export default handler;
