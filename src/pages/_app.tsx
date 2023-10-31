/* eslint-disable no-param-reassign */
/* eslint-disable simple-import-sort/imports */
import '../styles/global.css';


import type { AppProps } from 'next/app';


function MyApp({ Component, pageProps }: AppProps) {


  return (
    <>
      <main className="mb-auto">
        <Component {...pageProps} />
      </main>
    
    </>
  );
}

export default MyApp;
