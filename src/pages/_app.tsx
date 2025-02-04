import { AppProps } from 'next/app';
import { StudentProvider } from './StudentContext';

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <StudentProvider>
      <Component {...pageProps} />
    </StudentProvider>
  );
}

export default MyApp;
