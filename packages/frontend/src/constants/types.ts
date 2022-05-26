export interface Parameters {
  CHAIN_ID: string;
  NETWORK_NAME: string;
  DOMAIN: string;
  LOTTERY_ADDRESS: string;
  NFT_ADDRESS: string;
  RANDOMNESS_ADDRESS: string;
  REWARDS_ADDRESS: string;
  AUCTION_ADDRESS: string;
}

export interface Configuration {
  [environment: string]: Parameters;
}
