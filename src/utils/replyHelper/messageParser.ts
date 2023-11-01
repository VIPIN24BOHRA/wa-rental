export const parseMessage = (messageObj: any) => {
  return {
    type: messageObj.type,
    phonenumber: messageObj.sender.phone,
    name: messageObj.sender.name ?? '',
    message:
      messageObj.type === 'text'
        ? messageObj.payload.text
        : messageObj.payload.reply,
  };
};
