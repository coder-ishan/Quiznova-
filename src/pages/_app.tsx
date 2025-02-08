
import type { AppProps } from 'next/app';
import { StudentProvider } from './StudentContext';
import useDisableEscKey from './disableEscKey';

function MyApp({ Component, pageProps }: AppProps) {
    useDisableEscKey();

    return (
        <StudentProvider>
            <Component {...pageProps} />
        </StudentProvider>
    );
}

export default MyApp;