/* eslint-disable no-param-reassign */
import axios from 'axios';
import process from 'process';

export const getLatLongFromAddress = async (address: string) => {
  if (!address.includes('Gurugram')) address += ', Gurugram';
  if (!address.includes('India')) address += ', India';
  // console.log(address);
  try {
    const response = await axios.get(
      'https://maps.googleapis.com/maps/api/geocode/json',
      {
        params: {
          address,
          key: process.env.GOOGLE_MAP_API_KEY, // Replace with your Google Maps API key
        },
      }
    );

    const { location } = response.data.results[0].geometry;
    const latitude = location.lat;
    const longitude = location.lng;

    console.log(`Latitude: ${latitude}, Longitude: ${longitude}`);
    return { latitude, longitude };
  } catch (error) {
    console.error('Error getting latitude and longitude:', error);
  }
  return null;
};
