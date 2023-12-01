import axios from 'axios';

export const parseMapLink = async (link: string) => {
  try {
    const response = await axios.get(link);
    const expression =
      /window.APP_INITIALIZATION_STATE=\[\[\[\d+.\d+,(\d+.\d+),(\d+.\d+)/;

    const [, lng, lat] = response.data
      .match(expression)[0]
      .split('[[[')[1]
      .split(',');
    const name = response.data
      .split('preview/place/')[1]
      ?.split('/@')[0]
      ?.replaceAll('+', ' ');
    return { lat, lng, name };
  } catch (err) {
    console.log(err, 'error while parsing link');
    return null;
  }
};
