/* eslint-disable no-plusplus */

'use client';

import { useEffect, useState } from 'react';

import type { UserDetails } from '@/modules/firebase/firebase.types';

export default function Users() {
  const [pages, setPages] = useState<number[]>([]);
  const [allUsers, setAllUsers] = useState<any>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [currentUsers, setCurrentUsers] = useState([]);
  const [key, setKey] = useState('');

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
        }));
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

      <div className="relative mt-8 w-[90%] overflow-x-auto shadow-md sm:rounded-lg">
        <table className="w-full text-left text-sm text-gray-500 rtl:text-right dark:text-gray-400">
          <thead className="bg-gray-50 text-sm uppercase text-gray-700 dark:bg-gray-700 dark:text-gray-400">
            <tr>
              <th scope="col" className="px-6 py-3">
                contact Number
              </th>
              <th scope="col" className="px-6 py-3">
                last Seen
              </th>
              <th scope="col" className="px-6 py-3">
                Details Attempts
              </th>
              <th scope="col" className="px-6 py-3">
                Contact Attempts
              </th>
            </tr>
          </thead>
          <tbody>
            {currentUsers.map((u: any) => (
              <tr
                key={u.phoneNumber}
                className="border-b bg-white hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-600"
              >
                <th
                  scope="row"
                  className="whitespace-nowrap px-6 py-4 font-medium text-gray-900 dark:text-white"
                >
                  {u.phoneNumber}
                </th>
                <td className="px-6 py-4">
                  {`${new Date(u.lastSeenAt)
                    .toDateString()
                    .slice(3)} , ${new Date(
                    u.lastSeenAt
                  ).toLocaleTimeString()}`}
                </td>
                <td className="px-6 py-4">{u.detailsAttempts}</td>
                <td className="px-6 py-4">{u.getContactAttempts}</td>
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
