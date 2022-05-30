import { Configuration, Parameters } from './types';

var env = process.env.NEXT_PUBLIC_APP_MODE;

const configuration: Configuration = {
  rinkeby: {
    CHAIN_ID: '4',
    NETWORK_NAME: 'Rinkeby',
    DOMAIN: 'https://urn-dev.vercel.app/',
    LOTTERY_ADDRESS: '0xE492f01A366F34d80B984810534Bc9253F2CCBDB',
    NFT_ADDRESS: '0xfac126D9bf156703fB93FaBFab1c3dD17fd7C866',
    RANDOMNESS_ADDRESS: '0x28601963052668f60a0652B649D62f45c7Aa9304',
    REWARDS_ADDRESS: '0xe15E098CBF9f479Dba9cC7450b59E0e7bf1596B1',
    AUCTION_ADDRESS: '0x728dc0bD333e8c92E49f108e16382a403fd5880F',
  },
  dev: {
    CHAIN_ID: '4',
    NETWORK_NAME: 'Rinkeby',
    DOMAIN: 'https:/urn-dev.vercel.app/',
    LOTTERY_ADDRESS: '0xE492f01A366F34d80B984810534Bc9253F2CCBDB',
    NFT_ADDRESS: '0xfac126D9bf156703fB93FaBFab1c3dD17fd7C866',
    RANDOMNESS_ADDRESS: '0x28601963052668f60a0652B649D62f45c7Aa9304',
    REWARDS_ADDRESS: '0xe15E098CBF9f479Dba9cC7450b59E0e7bf1596B1',
    AUCTION_ADDRESS: '0x728dc0bD333e8c92E49f108e16382a403fd5880F',
  },
};

export const parameters: Parameters = configuration[env as string];
