'use client';

/* eslint-disable array-callback-return */
/* eslint-disable @typescript-eslint/no-shadow */
import {
  GoogleMap,
  InfoWindow,
  Marker,
  useLoadScript,
} from '@react-google-maps/api';
import { useEffect, useState } from 'react';

import type { LocationDetails } from '@/modules/firebase/firebase.types';

const App = () => {
  const [url, setUrl] = useState('');
  const [markers, setMarkers] = useState<LocationDetails[] | null>(null);
  const [map, setMap] = useState<any>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [infoWindowData, setInfoWindowData] = useState<any>(null);
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: process.env.GOOGLE_MAP_API_KEY ?? '',
  });

  useEffect(() => {
    const val = localStorage.getItem('FLAT_DEKHO_API_KEY');

    (async () => {
      const res = await fetch('api/pingLocation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ apiKey: val }),
      });
      const result = await res.json();
      // console.log(result);
      if (result.success) {
        setMarkers(result.locations);
      }
    })();
  }, []);

  useEffect(() => {
    if (map) {
      const bounds = new window.google.maps.LatLngBounds();
      markers?.map((marker) => {
        bounds.extend({
          lat: Number(marker.lat),
          lng: Number(marker.lng),
        });
      });
      map.fitBounds(bounds);
    }
  }, [map, markers]);

  const onLoad = (map: any) => {
    console.log('on load is called');
    setMap(map);
  };

  const handleMarkerClick = (
    id: any,
    lat: number,
    lng: number,
    address: string
  ) => {
    map?.panTo({ lat, lng });
    setInfoWindowData({ id, address });
    setIsOpen(true);
  };

  const handleAddUrl = async () => {
    console.log(url);
    const val = localStorage.getItem('FLAT_DEKHO_API_KEY');

    const res = await fetch('api/parseLink', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ apiKey: val, link: url }),
    });
    const result = await res.json();
    // console.log(result);
    if (result.success) {
      setMarkers([...(markers ?? []), { ...result.location }]);
      setUrl('');
    }
  };

  return (
    <div className="h-screen w-full">
      {!isLoaded && !markers ? (
        <h1>Loading...</h1>
      ) : (
        <GoogleMap
          mapContainerClassName="h-full w-full"
          zoom={20}
          onLoad={onLoad}
        >
          {markers?.map(({ lat, lng, name }, ind) => (
            <Marker
              position={{ lat: Number(lat), lng: Number(lng) }}
              key={`${lat},${lng},${ind}`}
              onClick={() => {
                console.log(ind, lat, lng);
                handleMarkerClick(ind, Number(lat), Number(lng), name ?? '');
              }}
            >
              {isOpen && infoWindowData?.id === ind && (
                <InfoWindow
                  onCloseClick={() => {
                    setIsOpen(false);
                  }}
                >
                  <div className="mt-2">
                    <h3 className="text-sm font-bold">
                      {infoWindowData.address}
                    </h3>
                    <p className="mt-4 flex flex-col">
                      <span>
                        <span className="font-semibold">lat :</span> {lat}
                      </span>
                      <span>
                        <span className="font-semibold">lng :</span> {lng}
                      </span>
                    </p>
                  </div>
                </InfoWindow>
              )}
            </Marker>
          ))}
        </GoogleMap>
      )}
      <div className="fixed top-[100px] left-[10px] flex w-[300px] flex-col items-center rounded-md bg-white py-4">
        <h3 className="py-2 text-center font-semibold">All Pinned Location</h3>
        <div className="flex w-[95%] flex-col ">
          <input
            value={url}
            onChange={(e) => {
              setUrl(e.target.value);
            }}
            className="mb-2 h-[40px] w-full rounded-lg border-[1px] border-[#000] px-4 shadow-sm outline-none placeholder:text-[#222]"
            placeholder="Enter url"
          />
          <button
            onClick={handleAddUrl}
            className="rounded-lg bg-[#000] px-4 py-1 text-sm text-white opacity-70 hover:opacity-100"
          >
            Add
          </button>
        </div>
        <ul className="container my-4 max-h-[200px] w-[98%] self-start overflow-auto pl-2">
          {markers?.map((marker, idx) => (
            <li
              className="p-2 text-xs font-semibold"
              style={idx % 2 ? { backgroundColor: '#eee' } : {}}
              key={`${marker.lat},${marker.lng},${idx}`}
            >
              {idx + 1}. 🎯 {marker?.name ?? `${marker.lat},${marker.lng}`}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default App;
