/* eslint-disable no-param-reassign */
/* eslint-disable consistent-return */
import axios from 'axios';
import process from 'process';

export const getLatLongFromAddress = async (address: string) => {
  address = address.toLocaleLowerCase().replaceAll('sector', '');
  address = address.toLocaleLowerCase().replaceAll('sec', '');
  // if (!address.toLocaleLowerCase().includes('sector'))
  address = `Sector${address}`;

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

export const getAddressFromLatLng = async (lat: any, lng: any) => {
  try {
    const response = await axios.get(
      `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&location_type=ROOFTOP&result_type=street_address&key=${process.env.GOOGLE_MAP_API_KEY}`
    );

    console.log(response.data.results);
    return response.data.results[0]?.formatted_address;
  } catch (error) {
    console.error('Error getting latitude and longitude:', error);
  }
};
