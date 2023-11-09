/* eslint-disable no-console */
/* eslint-disable consistent-return */

import axios from 'axios';
import process from 'process';

async function makeRequestToWhatsapp(data: any) {
  const { to, payload } = data;
  const parsedData = new URLSearchParams();
  parsedData.append('channel', 'whatsapp');
  parsedData.append('source', process.env.PHONE_ID ?? '');
  parsedData.append('destination', to);
  parsedData.append('message', JSON.stringify(payload));
  parsedData.append('src.name', process.env.APP_NAME ?? '');

  const config = {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      apikey: process.env.API_KEY,
    },
  };
  try {
    const res = await axios
      .post('https://api.gupshup.io/wa/api/v1/msg', parsedData, config)
      .catch((e) => {
        console.log('Whatsapp service failed', e);
      });

    console.log(res?.status === 202 ? 'success' : 'failure');
    return res;
  } catch (err) {
    console.log(err);
  }
}

export interface CreateMessagePayload {
  phoneNumber: any;
  type: string;
  text?: string;
  caption?: string;
  originalUrl?: string;
  previewUrl?: string;
  url?: string;
  fileName?: string;
  title?: string;
  body?: string;
  listButtonTitle?: string;
  sectionTitle?: string;
  listTitle1?: string;
  listTitle2?: string;
  listTitle3?: string;
  listTitle4?: string;
  listTitle5?: string;
  listTitle6?: string;
  listTitle7?: string;
  listTitle8?: string;
  listTitle9?: string;
  listTitle10?: string;
  listDescription1?: string;
  listDescription2?: string;
  listDescription3?: string;
  listDescription4?: string;
  listDescription5?: string;
  listDescription6?: string;
  listDescription7?: string;
  listDescription8?: string;
  listDescription9?: string;
  listDescription10?: string;
  quickContentType?: string;
  quickContentText?: string;
  quickContentCaption?: string;
  quickContentHeader?: string;
  quickContentUrl?: string;
  quickContentFile?: string;
  button1Title?: string;
  button2Title?: string;
  button3Title?: string;
  Button1PostBackText?: string;
  longitude?: number;
  lattitude?: number;
  locationName?: string;
  locationAddress?: string;
}

function createMessagePayload(payload: CreateMessagePayload) {
  const {
    phoneNumber,
    type,
    text,
    caption,
    originalUrl,
    previewUrl,
    url,
    fileName,
    title,
    body,
    listButtonTitle,
    sectionTitle,
    listTitle1,
    listTitle2,
    listTitle3,
    listTitle4,
    listTitle5,
    listTitle6,
    listTitle7,
    listTitle8,
    listTitle9,
    listTitle10,
    listDescription1,
    listDescription2,
    listDescription3,
    listDescription4,
    listDescription5,
    listDescription6,
    listDescription7,
    listDescription8,
    listDescription9,
    listDescription10,
    quickContentType,
    quickContentText,
    quickContentCaption,
    quickContentHeader,
    quickContentUrl,
    quickContentFile,
    button1Title,
    button2Title,
    button3Title,
    Button1PostBackText,
    longitude,
    lattitude,
    locationName,
    locationAddress,
  } = payload;

  const data = {
    to: phoneNumber,
    payload: {
      type,
      ...(type === 'text' && {
        text,
      }),
      ...(type === 'image' && {
        originalUrl,
        previewUrl,
        caption,
      }),
      ...(type === 'file' && {
        url,
        fileName,
      }),
      ...(type === 'video' && {
        url,
        ...(caption && { caption }),
      }),
      ...(type === 'audio' && {
        url,
      }),
      ...(type === 'list' && {
        title,
        body,
        globalButtons: [
          {
            type: 'text',
            title: listButtonTitle,
          },
        ],
        items: [
          {
            title: sectionTitle ?? '',
            options: [
              ...(listTitle1
                ? [
                    {
                      type: 'text',
                      title: listTitle1,
                      ...(listDescription1 && {
                        description: listDescription1,
                      }),
                    },
                  ]
                : []),
              ...(listTitle2
                ? [
                    {
                      type: 'text',
                      title: listTitle2,
                      ...(listDescription2 && {
                        description: listDescription2,
                      }),
                    },
                  ]
                : []),
              ...(listTitle3
                ? [
                    {
                      type: 'text',
                      title: listTitle3,
                      ...(listDescription3 && {
                        description: listDescription3,
                      }),
                    },
                  ]
                : []),
              ...(listTitle4
                ? [
                    {
                      type: 'text',
                      title: listTitle4,
                      ...(listDescription4 && {
                        description: listDescription4,
                      }),
                    },
                  ]
                : []),
              ...(listTitle5
                ? [
                    {
                      type: 'text',
                      title: listTitle5,
                      ...(listDescription5 && {
                        description: listDescription5,
                      }),
                    },
                  ]
                : []),
              ...(listTitle6
                ? [
                    {
                      type: 'text',
                      title: listTitle6,
                      ...(listDescription6 && {
                        description: listDescription6,
                      }),
                    },
                  ]
                : []),
              ...(listTitle7
                ? [
                    {
                      type: 'text',
                      title: listTitle7,
                      ...(listDescription7 && {
                        description: listDescription7,
                      }),
                    },
                  ]
                : []),
              ...(listTitle8
                ? [
                    {
                      type: 'text',
                      title: listTitle8,
                      ...(listDescription8 && {
                        description: listDescription8,
                      }),
                    },
                  ]
                : []),
              ...(listTitle9
                ? [
                    {
                      type: 'text',
                      title: listTitle9,
                      ...(listDescription9 && {
                        description: listDescription9,
                      }),
                    },
                  ]
                : []),
              ...(listTitle10
                ? [
                    {
                      type: 'text',
                      title: listTitle10,
                      ...(listDescription10 && {
                        description: listDescription10,
                      }),
                    },
                  ]
                : []),
            ],
          },
        ],
      }),
      ...(type === 'quick_reply' && {
        content: {
          type: quickContentType,
          text: quickContentText,
          ...(quickContentCaption && { caption: quickContentCaption }),
          ...(quickContentHeader && { header: quickContentHeader }),
          ...(quickContentUrl && { url: quickContentUrl }),
          ...(quickContentFile && { fileName: quickContentFile }),
        },
        options: [
          ...(button1Title
            ? [
                {
                  type: 'text',
                  title: button1Title,
                  postbackText: Button1PostBackText ?? '',
                },
              ]
            : []),
          ...(button2Title
            ? [
                {
                  type: 'text',
                  title: button2Title,
                },
              ]
            : []),
          ...(button3Title
            ? [
                {
                  type: 'text',
                  title: button3Title,
                },
              ]
            : []),
        ],
      }),
      ...(type === 'location' && {
        longitude,
        lattitude,
        name: locationName,
        address: locationAddress,
      }),
    },
  };
  return data;
}

export async function sendMessageToWhatsapp(payload: CreateMessagePayload) {
  const data = createMessagePayload(payload);
  const res = await makeRequestToWhatsapp(data);
  // console.log(res);
  if (res?.data?.messages?.length) {
    // eslint-disable-next-line no-console
    console.log(
      `${data.payload?.type} outgoing ${
        res.status === 200 ? 'success' : 'fail'
      }`
    );
    return res && res.status === 200;
  }
  return false;
}
