/* eslint-disable no-nested-ternary */
export const parseMessage = (messageObj: any) => {
  return {
    type: messageObj.type,
    phonenumber: messageObj.sender.phone,
    name: messageObj.sender.name ?? '',
    message:
      messageObj.type === 'text' && messageObj.type === 'quick_reply'
        ? messageObj.payload.text
        : messageObj.type === 'button_reply' && messageObj.payload.postbackText
        ? `${messageObj.payload.title}:${messageObj.payload.postbackText}`
        : messageObj.payload.title,
  };
};
