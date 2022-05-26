import '../styles/index.scss';
import 'react-loader-spinner/dist/loader/css/react-spinner-loader.css';
import { Provider as ReduxProvider } from 'react-redux';
import { SessionProvider } from 'next-auth/react';
import store from '../store/store';
import type { AppProps } from 'next/app';
import MaintenancePage from '@/components/MaintenancePage';
import { AnimatePresence } from 'framer-motion';
import Layout from '@/components/Layout';

import { createClient, Provider as WagmiProvider, chain } from 'wagmi';
import { MetaMaskConnector } from 'wagmi/connectors/metaMask';
import { WalletConnectConnector } from 'wagmi/connectors/walletConnect';
import { CoinbaseWalletConnector } from 'wagmi/connectors/coinbaseWallet';

//ftm testnet


// set up connectors
const connectors = [
  new MetaMaskConnector({
    chains: [chain.mainnet, chain.rinkeby],
  }),
  new WalletConnectConnector({
    options: {
      qrcode: true,
    },
  }),
  new CoinbaseWalletConnector({
    options: {
      appName: 'wagmi.sh',
    },
  }),
];

//create wagmi client with configs
const client = createClient({
  connectors,
  autoConnect: true,
});

function App({ Component, pageProps, router }: AppProps) {
  if (process.env.NEXT_PUBLIC_MAINTENANCE_ON === 'true') return <MaintenancePage />;

  return (
    <ReduxProvider store={store}>
      <WagmiProvider client={client}>
        <SessionProvider session={pageProps.session} refetchInterval={0}>
          <AnimatePresence>
            <Layout router={router}>
              <Component {...pageProps} />
            </Layout>
          </AnimatePresence>
        </SessionProvider>
      </WagmiProvider>
    </ReduxProvider>
  );
}

export default App;
