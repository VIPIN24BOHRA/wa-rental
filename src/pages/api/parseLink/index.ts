/* eslint-disable import/extensions */
import type { NextApiRequest, NextApiResponse } from 'next';

import { setLocationDetails } from '@/modules/firebase/database';
import { parseMapLink } from '@/utils/mapLinkParser';

async function handlePostRequest(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { apiKey, link } = req.body;

    if (!apiKey || apiKey !== process.env.WEB_API_KEY) {
      res.status(401).send({ success: false, error: 'Invalid Api key' });
      return;
    }
    if (!link) {
      res.status(400).send({ success: false, error: 'No link' });
      return;
    }
    const location = await parseMapLink(link);
    if (location?.lat && location?.lng) {
      await setLocationDetails(location);
    }
    res.status(200).send({ location, success: true });
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
