import { assign } from 'xstate';

import type { CreateMessagePayload } from '../whatsapp/whatsapp';
import type { MachineConfig, WhatsappInstance } from './machine.types';

async function sendTextMessage(
  whatsappInstance: WhatsappInstance,
  message: string,
  phonenumber: string
) {
  const payload: CreateMessagePayload = {
    phoneNumber: phonenumber,
    type: 'text',
    text: message,
  };

  await whatsappInstance.send(payload);
}

export const actionsFactory = (config: MachineConfig): any => {
  return {
    assignDefaultValue: assign({
      message: () => '',
      location: () => '',
      budget: () => 0,
      noOfRooms: () => 0,
      propertyType: () => '',
      for: () => '',
      listing: () => '',
    }),
    assignLocationFromEvent: assign({
      location: (_, event: any) => event.location,
    }),
    assignBudgetFromEvent: assign({
      budget: (_, event: any) => event.budget,
    }),
    assignNoOfRoomsFromEvent: assign({
      noOfRooms: (_, event: any) => event.noOfRooms,
    }),
    sendOnBoardingMsg: async () => {
      const message = ` *Welcome to Flat Dekho Bot!* 🏡\n\nLooking for Flat? Look no further! 🌟\n\nWith Flat Dekho , finding the perfect flat is just a chat away! Here's how it works:\n1️⃣ *Select Your Location:* Tell me where you want to live.\n 2️⃣ *Set Your Preferences:* Choose your requirements.\n 3️⃣ *Refine Your Search:* Specify the number of rooms and your price range.\n\n I'll narrow down the options to match your criteria perfectly.\nThat's it! 🚀 Flat Dekho Bot will then show you a curated list of flats that match your preferences. Easy, right?\n\nReady to find your ideal flat? Let's get started! Just type 'Start' to begin your search. 🌟✨🔍 `;
      const payload: CreateMessagePayload = {
        phoneNumber: config.userMetaData.phonenumber,
        type: 'quick_reply',
        button1Title: 'Start',
        quickContentType: 'text',
        quickContentText: message,
        quickContentHeader: '',
        quickContentCaption: '',
      };

      await config.whatsappInstance.send(payload);
    },
    sendInvalidOnBoardingMsg: async () => {
      const message =
        "⚠️ Oops!\n\nIt seems you've provided an invalid input.\n\nLet's give it another try.\n\n click on *Start* button below.";
      const payload: CreateMessagePayload = {
        phoneNumber: config.userMetaData.phonenumber,
        type: 'quick_reply',
        button1Title: 'Start',
        quickContentType: 'text',
        quickContentText: message,
        quickContentHeader: '',
        quickContentCaption: 'invalid input',
      };

      await config.whatsappInstance.send(payload);
    },
    sendLocationMessage: async () => {
      const message = `👋Hi,\n\n please provide the specific location you're interested in. Make sure to include the sector name for accurate results. \n\n For example, *_Sector 22, CityName_*\n\nLet's find you the perfect home! 🌟🏡✨`;
      await sendTextMessage(
        config.whatsappInstance,
        message,
        config.userMetaData.phonenumber
      );
    },
    sendInvalidLocationMsg: async () => {
      const message =
        "⚠️ Oops!\n\nIt seems you've provided an invalid input.\n\nLet's give it another try.";
      await sendTextMessage(
        config.whatsappInstance,
        message,
        config.userMetaData.phonenumber
      );
    },
    sendSelectNoOfRoomsMsg: async () => {
      const message =
        "please choose the number of rooms you prefer from the menu list below.\n\n Let's make sure you find the perfect home! 🌟🏡✨";
      const payload: CreateMessagePayload = {
        phoneNumber: config.userMetaData.phonenumber,
        type: 'list',
        sectionTitle: '',
        title: 'Select no. of room',
        body: message,
        listButtonTitle: 'Room list',
        listDescription1: 'only 1 room',
        listTitle1: '1',
        listDescription2: 'only 2 room',
        listTitle2: '2',
        listDescription3: 'only 3 room',
        listTitle3: '3',
        listDescription4: 'only 4 room',
        listTitle4: '4',
      };

      await config.whatsappInstance.send(payload);
    },
    sendInvalidRoomMsg: async () => {
      const message =
        "⚠️ Oops!\n\nIt seems you've provided an invalid input.\n\nLet's give it another try.\n\n please select correct room";
      await sendTextMessage(
        config.whatsappInstance,
        message,
        config.userMetaData.phonenumber
      );
    },
    sendSelectBudgetMsg: async () => {
      const message =
        'Great! 🌟\n\nPlease select a price range from the menu list.🏡✨';
      const payload: CreateMessagePayload = {
        phoneNumber: config.userMetaData.phonenumber,
        type: 'list',
        sectionTitle: '',
        title: 'Select budget',
        body: message,
        listButtonTitle: 'price range',
        listDescription1: 'Budget-friendly',
        listTitle1: '20k - 40k',
        listDescription2: 'Moderate',
        listTitle2: '40k - 60k',
        listDescription3: 'Comfortable',
        listTitle3: '60k - 80k',
        listDescription4: 'Luxurious',
        listTitle4: '80k +',
      };
      await config.whatsappInstance.send(payload);
    },

    sendFlatDetailsList: async () => {
      const flatArr = [
        'location 1',
        'location 2',
        'location 3',
        'location 4',
        'location 5',
        'location 6',
        'location 7',
        'location 8',
      ];

      const message = 'Great! 🌟\n\nPlease select Flat from the flat list.🏡✨';
      let payload: CreateMessagePayload = {
        phoneNumber: config.userMetaData.phonenumber,
        type: 'list',
        sectionTitle: '',
        title: 'Select Flat',
        body: message,
        listButtonTitle: 'flat list',
      };
      const temp: any = {};

      flatArr.forEach((a, index) => {
        temp[`listDescription${index + 1}`] = 'some description';
        temp[`listTitle${index + 1}`] = a;
      });
      payload = {
        ...payload,
        ...temp,
        listDescription9: 'cancel search flat',
        listTitle9: 'Cancel',
        listDescription10: 'get more flats',
        listTitle10: 'More',
      };

      await config.whatsappInstance.send(payload);
    },
    isInvalidLocationSelected: async () => {
      const message =
        "⚠️ Oops!\n\nIt seems you've provided an invalid input.\n\nLet's give it another try.\n\n please select correct Flat from list.";
      const payload: CreateMessagePayload = {
        phoneNumber: config.userMetaData.phonenumber,
        type: 'quick_reply',
        button1Title: 'Cancel',
        quickContentType: 'text',
        quickContentText: message,
        quickContentHeader: '',
        quickContentCaption: 'invalid input',
      };
      await config.whatsappInstance.send(payload);
    },
    sendFlatDetails: async () => {
      const message = `*Agent Name*: 👤 Vipin Bohra\n*Address*: 🏠 Sector 55, Gurugram, P.No.- 30.A\n*Agent Contact*: ☎️ "9711021188"\n*Price*: 💰 27000\n*Bedrooms*: 🛏️ 3\n*Property Type*: 🏢 "Builder Floor"\n*Location URL*: 📍 https://www.google.com/maps?q=Sector+48,+Gurugram,+Haryana+122001,+India&ftid=0x390d2298ef675275:0x73f8c0834b30d90b`;

      const payload: CreateMessagePayload = {
        phoneNumber: config.userMetaData.phonenumber,
        type: 'quick_reply',
        quickContentText: message,
        quickContentType: 'video',
        quickContentUrl:
          'https://www.shutterstock.com/shutterstock/videos/1099171545/preview/stock-footage--d-render-of-monochrome-black-and-white-abstract-art-video-animation-with-surreal-ball-or-sphere.webm',
        quickContentCaption: '',
      };

      await config.whatsappInstance.send(payload);
    },
    sendThanksMsg: async () => {
      const message =
        'Sure, You can start from the beginning and search flat again, \n\n Thanks for using our service';
      await sendTextMessage(
        config.whatsappInstance,
        message,
        config.userMetaData.phonenumber
      );
    },
    sendWelcomeMessage: async () => {
      const message = ` Welcome to flat dekho! \n\nSave this Account to get the best flat at your door 🔒\n\n 1. 📝 Search flat by location.\n 2. filter by budget\n 3. If your are a Bachelor or Family Person, do filter here easily and get flat in just one click.😊`;
      await sendTextMessage(
        config.whatsappInstance,
        message,
        config.userMetaData.phonenumber
      );
    },
    sendStillInConstructionMessage: async () => {
      const message = `👋 hey We are still building this application will ping you soon 🔒\n\n  Till then don't forget to share our service with your friend in need.😊`;
      await sendTextMessage(
        config.whatsappInstance,
        message,
        config.userMetaData.phonenumber
      );
    },
  };
};
