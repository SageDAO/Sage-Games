import { extractErrorMessage, getLotteryContract } from '@/utilities/contracts';
import { playErrorSound, playTxSuccessSound } from '@/utilities/sounds';
import { Prisma } from '@prisma/client';
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { ContractTransaction } from 'ethers';
import { toast } from 'react-toastify';
import { pointsApi } from './pointsReducer';

export type LotteryWithNftsAndArtist = Prisma.LotteryGetPayload<{
  include: {
    Nfts: true;
    Drop: {
      include: {
        Artist: true;
      };
    };
  };
}>;

export enum TicketPriceTier {
  VIP = 0,
  Member = 1,
  NonMember = 2,
}

export interface BuyTicketRequest {
  walletAddress: string;
  lotteryId: number;
  numberOfTickets: number;
  ticketCostCoins: bigint;
  ticketCostPoints: bigint;
  tier: TicketPriceTier;
  totalPointsEarned?: bigint;
  proof?: string;
}

export type LotteryTickets = {
  userTickets: number;
  totalTickets: number;
};

export const lotteriesApi = createApi({
  reducerPath: 'lotteriesApi',
  baseQuery: fetchBaseQuery({ baseUrl: '/api' }),
  refetchOnMountOrArgChange: 60,
  tagTypes: ['TicketCount'],
  endpoints: (builder) => ({
    getLottery: builder.query<LotteryWithNftsAndArtist, number>({
      query: (lotteryId: number) => `lotteries?action=GetLottery&lotteryId=${lotteryId}`,
    }),
    getTicketCounts: builder.query<LotteryTickets, { lotteryId: number; walletAddress: string }>({
      queryFn: async ({ lotteryId, walletAddress }, { dispatch }) => {
        console.log(`getTicketCounts(${lotteryId}, ${walletAddress})`);
        const totalTickets = await getTicketCount(lotteryId);
        const userTickets = walletAddress
          ? await getTicketCountPerUser(lotteryId, walletAddress)
          : 0;
        const ticketSoldEventCallback = () =>
          dispatch(lotteriesApi.util.invalidateTags(['TicketCount']));
        setupTicketSoldListener(lotteryId, ticketSoldEventCallback);
        return { data: { userTickets, totalTickets } };
      },
      providesTags: ['TicketCount'],
    }),
    buyTickets: builder.mutation<boolean, BuyTicketRequest>({
      queryFn: async (buyRequest, { dispatch }) => {
        const usePoints =
          buyRequest.tier != TicketPriceTier.NonMember && buyRequest.ticketCostPoints > 0;
        try {
          if (usePoints) {
            const escrowPoints =
              Number(buyRequest.numberOfTickets) * Number(buyRequest.ticketCostPoints);
            dispatch(pointsApi.endpoints.withholdEscrowPoints.initiate(escrowPoints));
            var tx = await buyTicketsUsingPoints(buyRequest);
          } else {
            var tx = await buyTicketsWithoutPoints(buyRequest);
          }
          toast.promise(tx.wait(), {
            pending: 'Request submitted to the blockchain, awaiting confirmation...',
            success: `Success! You obtained ${buyRequest.numberOfTickets} ticket${
              buyRequest.numberOfTickets > 1 ? 's' : ''
            }!`,
            error: 'Failure! Unable to complete request.',
          });
          await tx.wait();
          playTxSuccessSound();
          if (usePoints) {
            // TODO make subscribed UI components refetch points from db and contract
            dispatch(pointsApi.util.invalidateTags(['UserPoints']));
          }
          return { data: true };
        } catch (e: any) {
          console.log(e);
          if (usePoints) {
            dispatch(pointsApi.endpoints.releaseEscrowPoints.initiate());
          }
          const errMsg = extractErrorMessage(e);
          toast.error(`Failure! ${errMsg}`);
          playErrorSound();
          return { data: false };
        }
      },
    }),
  }),
});

async function buyTicketsWithoutPoints(buyRequest: BuyTicketRequest): Promise<ContractTransaction> {
  const value = BigInt(buyRequest.numberOfTickets) * buyRequest.ticketCostCoins;
  const contract = await getLotteryContract();
  return contract.buyTickets(buyRequest.lotteryId, buyRequest.numberOfTickets, buyRequest.tier, {
    value,
  });
}

async function buyTicketsUsingPoints(buyRequest: BuyTicketRequest): Promise<ContractTransaction> {
  console.log(
    `buyTicketsUsingPoints(${buyRequest.totalPointsEarned}, ${buyRequest.proof?.substring(
      0,
      12
    )}...)`
  );
  const proofArray =
    buyRequest.proof && buyRequest.proof.length > 0 ? buyRequest.proof.split(',') : [];
  var tx: ContractTransaction;
  try {
    const value = BigInt(buyRequest.numberOfTickets) * buyRequest.ticketCostCoins;
    const contract = await getLotteryContract();
    tx = await contract.claimPointsAndBuyTickets(
      buyRequest.lotteryId,
      buyRequest.numberOfTickets,
      BigInt(buyRequest.totalPointsEarned || 0),
      proofArray,
      buyRequest.tier,
      { value }
    );
    return tx;
  } catch (e) {
    console.log(e);
    throw e;
  }
}

export async function getTicketCount(lotteryId: number): Promise<number> {
  console.log(`getTicketCount(${lotteryId})`);
  const contract = await getLotteryContract();
  const result = await contract.getLotteryTicketCount(lotteryId);
  console.log(`getTicketCount() :: ${result}`);
  return result.toNumber();
}

export async function getTicketCountPerUser(lotteryId: number, address: string): Promise<number> {
  console.log(`getTicketCountPerUser(${lotteryId}, ${address})`);
  try {
    const contract = await getLotteryContract();
    const result = await contract.getTicketCountPerUser(lotteryId, address);
    console.log(`getTicketCountPerUser() :: ${result}`);
    return result.toNumber();
  } catch (e) {
    console.log(e);
    return 0;
  }
}

/*
from MemeXLottery.sol:
event TicketSold(
        uint256 indexed lotteryId,
        uint256 ticketNumber,
        address indexed participantAddress,
        PriceTier tier
    );
*/
export async function setupTicketSoldListener(lotteryId: number, countUpdateCallback: () => void) {
  console.log(`setupTicketSoldListener(${lotteryId})`);
  const contract = await getLotteryContract();
  if (!contract.listenerCount()) {
    console.log('Adding contract listener for TicketSold event');
    contract.on('TicketSold', (lotteryId, ticketNumber, participantAddress, tier) => {
      console.log(
        `Contract Event: TicketSold(${lotteryId}, ${ticketNumber}, ${participantAddress}, ${tier})`
      );
      countUpdateCallback();
    });
  }
}

export const { useGetLotteryQuery, useGetTicketCountsQuery, useBuyTicketsMutation } = lotteriesApi;
