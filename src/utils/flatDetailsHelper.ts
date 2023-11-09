import axios from 'axios';

import type { MachineContext } from '@/modules/xstate/machine.types';

export const getFlatDetails = async (userState: MachineContext) => {
  let minPrice = userState.budget.split('-')[0]?.replace('k', '000')?.trim();
  let maxPrice = userState.budget.split('-')[1]?.replace('k', '000')?.trim();
  if (Number.isNaN(Number(maxPrice))) {
    maxPrice = '0';
  }
  if (Number.isNaN(Number(minPrice))) {
    minPrice = '0';
  }
  // make sure the budget saving in user state is in format "20k - 40k" | "40k - 60k" | "60k - 80k" | "80k - above"
  const payload = {
    currentPage: userState.currentPage,
    pageSize: 5,
    longitude: userState.longitude,
    latitude: userState.latitude,
    rooms: [`${userState.noOfRooms}`],
    maxPrice: Number(maxPrice),
    minPrice: Number(minPrice),
    search: '',
    propertyType: [],
    listing: [],
    forType: [],
  };
  // console.log(payload);
  const res = await axios.post(
    'https://dnapi.flatdekho.co.in/api/v1/Video/get-videos',
    payload
  );
  if (res.data && res.data?.videoDetails?.length) return res.data?.videoDetails;
  return [];
};
