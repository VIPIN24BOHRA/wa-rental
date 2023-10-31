/* eslint-disable import/extensions */
// import '@/modules/firebase/firebase';

import bodyParser from 'body-parser';
import type { NextApiRequest, NextApiResponse } from 'next';

import { runMiddleware } from '@/utils/runMiddleware';

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

  // save the messages
  try {
    res.status(200).send('success');
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
