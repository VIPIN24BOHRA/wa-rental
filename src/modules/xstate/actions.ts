import { assign } from 'xstate';

import type { CreateMessagePayload } from '../whatsapp/whatsapp';
import type { MachineConfig, WhatsappInstance } from './machine.types';

// const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

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
      longitude: () => 0,
      latitude: () => 0,
      budget: () => '',
      noOfRooms: () => 0,
      currentPage: () => 1,
      videoLinkMap: () => ({}),
    }),
    assignLocationFromEvent: assign({
      longitude: (_, event: any) => event.longitude,
      latitude: (_, event: any) => event.latitude,
    }),
    assignBudgetFromEvent: assign({
      budget: (_, event: any) => event.budget,
      videoLinkMap: (_, event: any) => event.videoLinkMap,
      currentPage: (_, event: any) => event.currentPage,
    }),
    assignFlatsListFromEvent: assign({
      videoLinkMap: (_, event: any) => event.videoLinkMap,
      currentPage: (_, event: any) => event.currentPage,
    }),
    assignNoOfRoomsFromEvent: assign({
      noOfRooms: (_, event: any) => event.noOfRooms,
    }),
    sendOnBoardingMsg: async () => {
      const message = ` *Welcome to Flat Dekho Bot!* 🏡\n\nLooking for Flat? Look no further! 🌟\n\nWith Flat Dekho , finding the perfect flat is just a chat away! Here's how it works:\n1️⃣ *Select Your Location:* Tell me where you want to live.\n 2️⃣ *Set Your Preferences:* Choose your requirements.\n 3️⃣ *Refine Your Search:* Specify the number of rooms and your price range.\n\nThat's it! 🚀 Flat Dekho Bot will then show you a curated list of flats that match your preferences. Easy, right?\n\nReady to find your ideal flat? Let's get started! Just type 'Start' to begin your search. 🌟✨🔍 `;
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
      const message = `👋Hi,\n\n please provide the specific location you're interested in. Make sure to include the sector name for accurate results. \n\n For example, *_Sector 22, CityName_*\n*_Sector 43, Gurugram_*\n\nLet's find you the perfect flat nearby! 🌟🏡✨`;
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
        listTitle4: '80k - above',
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
    sendFlatDetails1: async (_context: any, event: any) => {
      if (event.flatList && event.flatList[0]) {
        const flatdetails = event.flatList[0];
        const message = `*Rooms* - ${flatdetails.tagLine} \n*Rent* - ${
          flatdetails.price
        }\n*Address* - ${flatdetails.address}\n*Floor* - ${
          flatdetails.floorNo
        }\n*For* - ${flatdetails.for}\n*Avalilable from* -  ${new Date(
          flatdetails.availableFrom
        ).toLocaleDateString()}\n*Owner* - ${
          flatdetails.agentContact
        }\n*Property Code* - ${flatdetails.propertyCode}`;
        const payload: CreateMessagePayload = {
          phoneNumber: config.userMetaData.phonenumber,
          type: 'quick_reply',
          button1Title: 'Get Video',
          quickContentType: 'text',
          quickContentText: message,
          quickContentHeader: '',
          quickContentCaption: '',
          Button1PostBackText: flatdetails.videoAssetId,
        };
        await config.whatsappInstance.send(payload);
      }
    },
    sendFlatDetails2: async (_context: any, event: any) => {
      if (event.flatList && event.flatList[1]) {
        const flatdetails = event.flatList[1];
        const message = `*Rooms* - ${flatdetails.tagLine} \n*Rent* - ${
          flatdetails.price
        }\n*Address* - ${flatdetails.address}\n*Floor* - ${
          flatdetails.floorNo
        }\n*For* - ${flatdetails.for}\n*Avalilable from* -  ${new Date(
          flatdetails.availableFrom
        ).toLocaleDateString()}\n*Owner* - ${
          flatdetails.agentContact
        }\n*Property Code* - ${flatdetails.propertyCode}`;

        const payload: CreateMessagePayload = {
          phoneNumber: config.userMetaData.phonenumber,
          type: 'quick_reply',
          button1Title: 'Get Video',
          quickContentType: 'text',
          quickContentText: message,
          quickContentHeader: '',
          quickContentCaption: '',
          Button1PostBackText: flatdetails.videoAssetId,
        };
        await config.whatsappInstance.send(payload);
      }
    },
    sendFlatDetails3: async (_context: any, event: any) => {
      if (event.flatList && event.flatList[2]) {
        const flatdetails = event.flatList[2];
        const message = `*Rooms* - ${flatdetails.tagLine} \n*Rent* - ${
          flatdetails.price
        }\n*Address* - ${flatdetails.address}\n*Floor* - ${
          flatdetails.floorNo
        }\n*For* - ${flatdetails.for}\n*Avalilable from* -  ${new Date(
          flatdetails.availableFrom
        ).toLocaleDateString()}\n*Owner* - ${
          flatdetails.agentContact
        }\n*Property Code* - ${flatdetails.propertyCode}`;

        const payload: CreateMessagePayload = {
          phoneNumber: config.userMetaData.phonenumber,
          type: 'quick_reply',
          button1Title: 'Get Video',
          quickContentType: 'text',
          quickContentText: message,
          quickContentHeader: '',
          quickContentCaption: '',
          Button1PostBackText: flatdetails.videoAssetId,
        };
        await config.whatsappInstance.send(payload);
      }
    },
    sendFlatDetails4: async (_context: any, event: any) => {
      if (event.flatList && event.flatList[3]) {
        const flatdetails = event.flatList[3];
        const message = `*Rooms* - ${flatdetails.tagLine} \n*Rent* - ${
          flatdetails.price
        }\n*Address* - ${flatdetails.address}\n*Floor* - ${
          flatdetails.floorNo
        }\n*For* - ${flatdetails.for}\n*Avalilable from* -  ${new Date(
          flatdetails.availableFrom
        ).toLocaleDateString()}\n*Owner* - ${
          flatdetails.agentContact
        }\n*Property Code* - ${flatdetails.propertyCode}`;

        const payload: CreateMessagePayload = {
          phoneNumber: config.userMetaData.phonenumber,
          type: 'quick_reply',
          button1Title: 'Get Video',
          quickContentType: 'text',
          quickContentText: message,
          quickContentHeader: '',
          quickContentCaption: '',
          Button1PostBackText: flatdetails.videoAssetId,
        };
        await config.whatsappInstance.send(payload);
      }
    },
    sendFlatDetails5: async (_context: any, event: any) => {
      if (event.flatList && event.flatList[4]) {
        const flatdetails = event.flatList[4];
        const message = `*Rooms* - ${flatdetails.tagLine} \n*Rent* - ${
          flatdetails.price
        }\n*Address* - ${flatdetails.address}\n*Floor* - ${
          flatdetails.floorNo
        }\n*For* - ${flatdetails.for}\n*Avalilable from* -  ${new Date(
          flatdetails.availableFrom
        ).toLocaleDateString()}\n*Owner* - ${
          flatdetails.agentContact
        }\n*Property Code* - ${flatdetails.propertyCode}`;

        const payload: CreateMessagePayload = {
          phoneNumber: config.userMetaData.phonenumber,
          type: 'quick_reply',
          button1Title: 'Get Video',
          quickContentType: 'text',
          quickContentText: message,
          quickContentHeader: '',
          quickContentCaption: '',
          Button1PostBackText: flatdetails.videoAssetId,
        };
        await config.whatsappInstance.send(payload);
      }
    },
    sendVideoFromEvent: async (context: any, event: any) => {
      console.log('this is event in send video', event);
      if (context.videoLinkMap[event.videoId]) {
        const payload: CreateMessagePayload = {
          phoneNumber: config.userMetaData.phonenumber,
          type: 'video',
          url: context.videoLinkMap[event.videoId],
        };
        await config.whatsappInstance.send(payload);
      } else {
        const message = `Sorry video is not available,\n\n please proceed from start.`;
        const payload: CreateMessagePayload = {
          phoneNumber: config.userMetaData.phonenumber,
          type: 'quick_reply',
          button1Title: 'Cancel',
          quickContentType: 'text',
          quickContentText: message,
          quickContentHeader: '',
          quickContentCaption: '',
        };
        await config.whatsappInstance.send(payload);
      }
    },
    sendNoFlatDetails: async () => {
      const message = `Apologies, but we cannot find the flats. 🚫\n\n*_Terminating, you can start from the beginning._* 🔄`;
      await sendTextMessage(
        config.whatsappInstance,
        message,
        config.userMetaData.phonenumber
      );
    },
    sendInvalidTerminationMsg: async () => {
      const message = `Apologies, but we cannot find the video. 🚫\n\n*_Terminating, you can start from the beginning._* 🔄`;
      await sendTextMessage(
        config.whatsappInstance,
        message,
        config.userMetaData.phonenumber
      );
    },
    sendThanksMsg: async () => {
      const message =
        'Certainly! 🏡 You can start from the beginning and search for a flat again.\n\n Thanks for using our service! 🙌';
      await sendTextMessage(
        config.whatsappInstance,
        message,
        config.userMetaData.phonenumber
      );
    },
    sendOptionForMoreAndCancel: async () => {
      const message = `👋 Hello!\n\nTo continue and explore more results, click on *"More"* If you want to start from the beginning, simply click on *"Cancel"*\n\n🔍 More - For additional results.\n🔄 Cancel - To start afresh.`;
      const payload: CreateMessagePayload = {
        phoneNumber: config.userMetaData.phonenumber,
        type: 'quick_reply',
        button1Title: 'More',
        button2Title: 'Cancel',
        quickContentType: 'text',
        quickContentText: message,
        quickContentHeader: '',
        quickContentCaption: '',
      };
      await config.whatsappInstance.send(payload);
    },
    sendMoreFlatLocations: async () => {},
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
