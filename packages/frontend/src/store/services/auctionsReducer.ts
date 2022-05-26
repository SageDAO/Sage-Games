import { GamePrize, AuctionNftWithArtist } from '@/prisma/types';
import { extractErrorMessage, getAuctionContract } from '@/utilities/contracts';
import { playErrorSound, playPrizeClaimedSound, playTxSuccessSound } from '@/utilities/sounds';
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { toast } from 'react-toastify';
import { Auction_include_Nft } from '@/prisma/types';

export interface AuctionState {
  highestBidder: string; // wallet address
  highestBid: number;
  settled: boolean;
  endTime: number; // timestamp
}

export const auctionsApi = createApi({
  reducerPath: 'auctionsApi',
  baseQuery: fetchBaseQuery({ baseUrl: '/api' }),
  refetchOnMountOrArgChange: 60,
  tagTypes: ['Auction', 'AuctionState'],
  endpoints: (builder) => ({
    getAuction: builder.query<Auction_include_Nft, number>({
      query: (auctionId: number) => `auctions?action=GetAuction&auctionId=${auctionId}`,
      providesTags: ['Auction'],
    }),
    getAuctionState: builder.query<AuctionState, number>({
      queryFn: async (auctionId: number, { dispatch }) => {
        console.log('getAuctionState()');
        const newHighestBidEventCallback = () =>
          dispatch(auctionsApi.util.invalidateTags(['AuctionState']));
        const state = await getAuctionContractState(auctionId, newHighestBidEventCallback);
        return { data: state };
      },
      providesTags: ['AuctionState'],
    }),
    getUnclaimedAuctionNftsPerUser: builder.query<GamePrize[], void>({
      query: () => `auctions?action=GetUnclaimedAuctionNftsPerUser`,
      providesTags: ['Auction'],
    }),
    claimAuctionNft: builder.mutation<Date, number>({
      queryFn: async (auctionId, {}, _extraOptions, _fetchWithBQ) => {
        try {
          const contract = await getAuctionContract();
          var tx = await contract.settleAuction(auctionId);
          toast.promise(tx.wait(), {
            pending: 'Request submitted to the blockchain, awaiting confirmation...',
            success: 'Success! NFT claimed!',
            error: 'Failure! Unable to complete request.',
          });
          await tx.wait();
          var claimedAt = await updateDbPrizeClaimedDate(_fetchWithBQ, auctionId);
        } catch (e) {
          console.log(e);
          const errMsg = extractErrorMessage(e);
          toast.error(`Failure! ${errMsg}`);
          playErrorSound();
          return { error: { status: 500, data: null } };
        }
        playPrizeClaimedSound();
        return { data: claimedAt };
      },
      invalidatesTags: ['Auction', 'AuctionState'],
    }),
  }),
});

export async function getAuctionContractState(
  auctionId: number,
  stateUpdateCallback?: () => void
): Promise<AuctionState> {
  console.log(`getAuctionContractState(${auctionId})`);
  const auctionContract = await getAuctionContract();
  const auctionStruct = await auctionContract.getAuction(auctionId);
  if (stateUpdateCallback) {
    setupBidListener(auctionId, stateUpdateCallback);
  }
  return {
    highestBid: +auctionStruct.highestBid,
    highestBidder: auctionStruct.highestBidder,
    settled: auctionStruct['5'],
    endTime: auctionStruct.endTime,
  } as AuctionState;
}

/*
from MemeXAuction.sol:
event BidPlaced(
  uint256 indexed auctionId,
  address indexed bidder,
  uint256 bidAmount,
  uint256 newEndTime
);
*/
async function setupBidListener(auctionId: number, stateUpdateCallback: () => void) {
  console.log(`setupBidListener(${auctionId})`);
  const contract = await getAuctionContract();
  if (!contract.listenerCount()) {
    contract.on('BidPlaced', (auctionId, bidder, bidAmount, newEndTime) => {
      console.log(
        `Contract Event: BidPlaced(${auctionId}, ${bidder}, ${bidAmount}, ${newEndTime})`
      );
      toast.info(
        `Auction ${auctionId} has a new higher bidder with a bid of ${bidAmount / 10 ** 18}`
      );
      stateUpdateCallback();
    });
  }
}

export async function bid(auctionId: number, amount: number) {
  console.log(`bid(${auctionId}, ${amount})`);
  try {
    const tx = await (
      await getAuctionContract()
    ).bid(auctionId, amount.toString(), { value: amount.toString() });
    toast.promise(tx.wait(), {
      pending: 'Request submitted to the blockchain, awaiting confirmation...',
      success: `Success! You are now the highest bidder!`,
      error: 'Failure! Unable to complete request.',
    });
    await tx.wait();
    playTxSuccessSound();
  } catch (e) {
    const errMsg = extractErrorMessage(e);
    toast.error(`Failure! ${errMsg}`);
    playErrorSound();
  }
}

async function updateDbPrizeClaimedDate(fetchWithBQ: any, auctionId: number): Promise<Date> {
  const { data } = await fetchWithBQ({
    url: `auctions?action=UpdateNftClaimedDate&auctionId=${auctionId}`,
    method: 'POST',
  });
  return (data as any).claimedAt as Date;
}

export const {
  useGetAuctionQuery,
  useGetAuctionStateQuery,
  useClaimAuctionNftMutation,
  useGetUnclaimedAuctionNftsPerUserQuery,
} = auctionsApi;
