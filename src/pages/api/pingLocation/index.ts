/* eslint-disable import/extensions */
import type { NextApiRequest, NextApiResponse } from 'next';

import { getAllPingLocation } from '@/modules/firebase/database';

async function handlePostRequest(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { apiKey } = req.body;

    if (!apiKey || apiKey !== process.env.WEB_API_KEY) {
      res.status(401).send({ success: false, error: 'Invalid Api key' });
      return;
    }

    const locations = await getAllPingLocation();

    res.status(200).send({ locations, success: true });
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
