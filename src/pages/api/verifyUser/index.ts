/* eslint-disable import/extensions */
// import '@/modules/firebase/firebase';

import type { NextApiRequest, NextApiResponse } from 'next';
import NextCors from 'nextjs-cors';

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
  } catch (e: any) {
    // eslint-disable-next-line no-console
    console.error(e);
    res.status(400).send({ success: false, error: e.message });
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
  const origin = req.headers.origin ?? '';
  let allowedOrigin = '';

  if (!origin) {
    allowedOrigin = 'http://localhost:4200';
  } else if (
    origin === 'http://localhost:4200' ||
    origin === 'https://flatdekho.co.in' ||
    origin === 'https://dev.flatdekho.co.in' ||
    origin === 'https://flatdekho.app' ||
    origin === 'https://dev.flatdekho.app'
  ) {
    allowedOrigin = origin;
  }

  await NextCors(req, res, {
    // Options
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE'],
    origin: allowedOrigin,
    optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
  });
  if (req.method === 'POST') await handlePostRequest(req, res);
  else if (req.method === 'GET') await handleGetRequest(req, res);
  else res.status(400).send('Invalid request method');
};
export default handler;
