/* eslint-disable no-plusplus */
/* eslint-disable @typescript-eslint/no-shadow */

'use client';

import { useEffect, useState } from 'react';

import type { UserDetails } from '@/modules/firebase/firebase.types';

export default function Users() {
  const [pages, setPages] = useState<number[]>([]);
  const [allUsers, setAllUsers] = useState<any>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [currentUsers, setCurrentUsers] = useState([]);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [recentSearch, setRecentSearch] = useState('');
  const [key, setKey] = useState('');
  const [actionLoaderFor, setActionsLoader] = useState('');

  useEffect(() => {
    const val = localStorage.getItem('FLAT_DEKHO_API_KEY');
    setKey(val ?? '');

    (async () => {
      const res = await fetch('api/userDetails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ apiKey: val }),
      });
      const result = await res.json();

      if (result.success) {
        const users = result.users.map((x: UserDetails) => ({
          phoneNumber: x.phoneNumber,
          lastSeenAt: x.state.lastSeenAt,
          getContactAttempts: x.state.getContactAttempts,
          detailsAttempts: x.state.totalAttempts,
          createdAt: x.createdAt,
          subscribed: x.subscribed,
        }));
        users.sort(
          (a: any, b: any) =>
            (b.lastSeenAt ? b.lastSeenAt : 0) -
            (a.lastSeenAt ? a.lastSeenAt : 0)
        );
        setAllUsers(users);
        const totalPage = [];
        for (let i = 0; i <= Math.floor(result.users.length / 10); i++) {
          totalPage.push(i + 1);
        }

        setPages(totalPage);
        setCurrentUsers(users.slice(0, 10));
      }
    })();
  }, []);

  const handleSaveApiKey = () => {
    localStorage.setItem('FLAT_DEKHO_API_KEY', key);
  };

  const handlePrevPage = () => {
    if (currentPage === 1) return;
    setCurrentUsers(
      allUsers.slice((currentPage - 2) * 10, (currentPage - 1) * 10)
    );
    setCurrentPage(currentPage - 1);
  };

  const handleNextPage = () => {
    if (currentPage === Math.floor(allUsers.length / 10) + 1) return;
    setCurrentUsers(allUsers.slice(currentPage * 10, (currentPage + 1) * 10));
    setCurrentPage(currentPage + 1);
  };
  const handleChangePage = (x: number) => {
    if (currentPage === x) return;
    setCurrentPage(x);
    setCurrentUsers(allUsers.slice((x - 1) * 10, x * 10));
  };

  const handleSortPage = (key: string) => {
    allUsers.sort(
      (a: any, b: any) => (b[key] ? b[key] : 0) - (a[key] ? a[key] : 0)
    );
    console.log(allUsers);
    setAllUsers([...allUsers]);
    setCurrentUsers(allUsers.slice((currentPage - 1) * 10, currentPage * 10));
  };

  const handleSubscribe = async (phoneNumber: string, subscribe: boolean) => {
    const val = localStorage.getItem('FLAT_DEKHO_API_KEY');
    setActionsLoader(phoneNumber);
    const res = await fetch('api/subscribe', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ apiKey: val, phoneNumber, subscribe }),
    });
    const result = await res.json();

    if (result && result.user) {
      allUsers.forEach((e: any) => {
        if (e.phoneNumber === phoneNumber) {
          e.subscribed = result?.user?.subscribed ?? e.subscribe;
        }
      });
      setAllUsers([...allUsers]);
      setCurrentUsers(allUsers.slice((currentPage - 1) * 10, currentPage * 10));
    }
    setActionsLoader('');
  };

  const handleSeachNumber = () => {
    const filteredUsers = allUsers.filter(
      (u: any) => u.phoneNumber === phoneNumber
    );

    if (filteredUsers.length) {
      const newUsers = allUsers.filter(
        (u: any) => u.phoneNumber !== phoneNumber
      );

      newUsers.unshift(filteredUsers[0]);
      setAllUsers([...newUsers]);
      setCurrentPage(1);
      setCurrentUsers(newUsers.slice(0, 10));
    }
    setRecentSearch(phoneNumber);
    setPhoneNumber('');
  };

  return (
    <div className="flex h-screen w-full flex-col items-center">
      <nav className="flex w-full items-center border-b-[1px] px-8 py-4">
        <h3 className="text-lg font-bold"> Flat Dekho</h3>
        <p className="grow"></p>
        <input
          value={key}
          onChange={(e) => {
            setKey(e.target.value);
          }}
          type="text"
          placeholder="Enter Api Key..."
          className="w-[300px] rounded-lg border-2 border-[#bbb] py-1 pl-4 font-bold outline-none placeholder:text-[#000]"
        />
        <button
          onClick={handleSaveApiKey}
          className="ml-2 rounded-lg bg-[#000] px-4 py-1 text-sm text-white"
        >
          Save Key
        </button>
      </nav>
      <div className="flex h-[60px] w-full items-center px-6">
        <input
          value={phoneNumber}
          onChange={(e) => {
            setPhoneNumber(e.target.value);
          }}
          type="text"
          placeholder="Search by phone number"
          className="w-[300px] rounded-lg border-[1px] border-[#000] py-1 pl-4 font-semibold outline-none placeholder:text-[#bbb]"
        />

        <button
          className="ml-2 rounded-lg bg-[#000] px-4 py-1 text-sm text-white"
          onClick={handleSeachNumber}
          style={{ opacity: phoneNumber.match(/^[9][1]\d{10}$/gm) ? 1 : 0.3 }}
          disabled={!phoneNumber.match(/^[9][1]\d{10}$/gm)}
        >
          Search
        </button>
      </div>
      <div className="relative w-full overflow-x-auto shadow-md sm:rounded-lg">
        <table className="w-full text-left text-sm text-gray-500 rtl:text-right dark:text-gray-400">
          <thead className="sticky top-0 bg-gray-50 text-sm uppercase text-gray-700 dark:bg-gray-700 dark:text-gray-400">
            <tr>
              <th scope="col" className="px-6 py-3">
                contact Number
              </th>
              <th
                scope="col"
                className="cursor-pointer px-6 py-3"
                onClick={() => {
                  handleSortPage('lastSeenAt');
                }}
              >
                last Seen
              </th>
              <th scope="col" className="px-6 py-3">
                Created At
              </th>
              <th
                scope="col"
                className="cursor-pointer px-6 py-3"
                onClick={() => {
                  handleSortPage('detailsAttempts');
                }}
              >
                Details Attempts
              </th>
              <th scope="col" className="px-6 py-3">
                Contact Attempts
              </th>
              <th scope="col" className="px-6 py-3">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {currentUsers.map((u: any) => (
              <tr
                key={u.phoneNumber}
                className="border-b bg-white hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-600"
                style={
                  u.phoneNumber === recentSearch
                    ? { backgroundColor: '#ddd' }
                    : {}
                }
              >
                <th
                  scope="row"
                  className="whitespace-nowrap px-6 py-3 font-medium text-gray-900 dark:text-white"
                >
                  {u.phoneNumber}
                </th>
                <td className="px-6 py-3">
                  {`${new Date(u.lastSeenAt)
                    .toDateString()
                    .slice(3)} , ${new Date(
                    u.lastSeenAt
                  ).toLocaleTimeString()}`}
                </td>
                <td className="px-6 py-3">
                  {`${new Date(u.createdAt)
                    .toDateString()
                    .slice(3)} , ${new Date(u.createdAt).toLocaleTimeString()}`}
                </td>
                <td className="px-6 py-3">{u.detailsAttempts}</td>
                <td className="px-6 py-3">{u.getContactAttempts}</td>
                <td className="px-6 py-2">
                  {u.subscribed ? (
                    <button
                      onClick={() => {
                        handleSubscribe(u.phoneNumber, false);
                      }}
                      className="w-[100px] rounded-lg bg-[#ff0000] px-4 py-1 text-white opacity-80 shadow-md hover:opacity-100"
                    >
                      {actionLoaderFor === u.phoneNumber ? (
                        <svg
                          className=" me-2 ml-6 h-4 w-4 animate-spin fill-[#ff0000] text-gray-200 dark:text-gray-600"
                          viewBox="0 0 100 101"
                          fill="none"
                        >
                          <path
                            d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                            fill="currentColor"
                          />
                          <path
                            d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                            fill="currentFill"
                          />
                        </svg>
                      ) : (
                        'Remove'
                      )}
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        handleSubscribe(u.phoneNumber, true);
                      }}
                      className="w-[100px] rounded-lg bg-[#03c04a] px-4 py-1 text-white opacity-80 shadow-md hover:opacity-100"
                    >
                      {actionLoaderFor === u.phoneNumber ? (
                        <svg
                          className="me-2 ml-6 h-4 w-4 animate-spin fill-[#03c04a] text-gray-200 dark:text-gray-600"
                          viewBox="0 0 100 101"
                          fill="none"
                        >
                          <path
                            d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                            fill="currentColor"
                          />
                          <path
                            d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                            fill="currentFill"
                          />
                        </svg>
                      ) : (
                        'Subscribe'
                      )}
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <nav
          className="flex-column flex flex-wrap items-center justify-between px-8 py-4 md:flex-row"
          aria-label="Table navigation"
        >
          <span className="mb-4 block w-full text-sm font-normal text-gray-500 dark:text-gray-400 md:mb-0 md:inline md:w-auto">
            Showing{' '}
            <span className="font-semibold text-gray-900 dark:text-white">
              {(currentPage - 1) * 10 + 1} -{' '}
              {currentPage * 10 > allUsers.length
                ? allUsers.length
                : currentPage * 10}
            </span>{' '}
            of{' '}
            <span className="font-semibold text-gray-900 dark:text-white">
              {allUsers.length}
            </span>
          </span>
          <ul className="inline-flex h-8 -space-x-px rounded-lg text-sm rtl:space-x-reverse">
            <li
              onClick={handlePrevPage}
              className="ms-0 rounded-s-lg flex h-8 cursor-pointer items-center justify-center border border-gray-300 bg-white px-3 leading-tight text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
            >
              Previous
            </li>
            {pages.map((x) => (
              <li
                key={x}
                style={currentPage === x ? { backgroundColor: '#aaa' } : {}}
                className="rounded-e-lg flex h-8 cursor-pointer items-center justify-center border border-gray-300 bg-white px-3 leading-tight text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
                onClick={() => {
                  handleChangePage(x);
                }}
              >
                {x}
              </li>
            ))}
            <li
              onClick={handleNextPage}
              className="ms-0 rounded-s-lg flex h-8 cursor-pointer items-center justify-center border border-gray-300 bg-white px-3 leading-tight text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
            >
              Next
            </li>
          </ul>
        </nav>
      </div>
    </div>
  );
}
