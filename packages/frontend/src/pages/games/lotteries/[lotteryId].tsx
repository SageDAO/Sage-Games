import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import {
  TicketPriceTier,
  useGetLotteryQuery,
  useGetTicketCountsQuery,
} from '@/store/services/lotteriesReducer';
import GetTicketModal from '@/components/Modals/GetTicketModal';
import { useSession } from 'next-auth/react';
import {
  ClaimPrizeRequest,
  useClaimLotteryPrizeMutation,
  useGetPrizesByUserAndLotteryQuery,
} from '@/store/services/prizesReducer';
import { useGetPointsBalanceQuery, useGetEscrowPointsQuery } from '@/store/services/pointsReducer';
import useModal from '@/hooks/useModal';
import { getBlockchainTimestamp, getCoinBalance } from '@/utilities/contracts';


function lottery() {
  const {
    isOpen: isGetTicketModalOpen,
    openModal: openGetTicketModal,
    closeModal: closeGetTicketModal,
  } = useModal();
  const [blockchainTimestamp, setBlockchainTimestamp] = useState<number>(0);
  const [userBalanceCoins, setUserBalanceCoins] = useState<string>('');
  const { data: sessionData } = useSession();
  const walletAddress = sessionData?.address;
  const { lotteryId } = useRouter().query;
  const { data: lottery, isFetching } = useGetLotteryQuery(+lotteryId!, {
    skip: isNaN(+lotteryId!),
  });
  const { data: ticketCount } = useGetTicketCountsQuery(
    { lotteryId: +lotteryId!, walletAddress: walletAddress as string },
    { skip: isNaN(+lotteryId!) }
  );
  const { data: prizes } = useGetPrizesByUserAndLotteryQuery(
    { lotteryId: +lotteryId!, walletAddress: walletAddress as string },
    { skip: isNaN(+lotteryId!) || !walletAddress }
  );
  const [claimLotteryPrize] = useClaimLotteryPrizeMutation();
  const { data: userPoints } = useGetPointsBalanceQuery(undefined, { skip: !walletAddress });
  const { data: escrowPoints } = useGetEscrowPointsQuery(undefined, { skip: !walletAddress });
  const userBalancePoints = userPoints! - escrowPoints!;
  const userTier = TicketPriceTier.Member; // TODO calculate user tier based on tbd criteria
  useEffect(() => {
    const fetchTimestamp = async () => {
      setBlockchainTimestamp(await getBlockchainTimestamp());
      setUserBalanceCoins((await getCoinBalance()).toString());
    };
    fetchTimestamp();
  }, []);
  const toTimestamp = (aDate: any) => Date.parse(aDate) / 1000;
  const hasStarted =
    lottery && lottery.blockchainCreatedAt && blockchainTimestamp > toTimestamp(lottery.startTime);
  const hasEnded =
    lottery && lottery.blockchainCreatedAt && blockchainTimestamp > toTimestamp(lottery.endTime);
  const displayBuyTicketButton = hasStarted && !hasEnded;

  const handleClaimLotteryPrizeClick = async (index: number) => {
    await claimLotteryPrize({
      lotteryId: prizes![index].lotteryId,
      nftId: prizes![index].nftId,
      ticketNumber: prizes![index].lotteryTicketNumber,
      proof: prizes![index].lotteryProof,
      walletAddress,
    } as ClaimPrizeRequest);
  };

  return (
    <div id='drop-details' style={{ alignSelf: 'center' }}>
      <img src={lottery?.Nfts[0].s3Path} alt='' width='100' style={{ marginTop: '20px' }} />
      <br />
      {isFetching && (
        <>
          loading ...
          <br />
        </>
      )}
      {lottery && (
        <>
          <button onClick={openGetTicketModal}> ** Get a Ticket ** </button>
          <br />
          <pre style={{ fontFamily: 'monospace', whiteSpace: 'pre-wrap' }}>
            {JSON.stringify(
              {
                dropId: lottery.Drop.id,
                dropName: lottery.Drop.name,
                dropDescription: lottery.Drop.description,
                nftName: lottery.Nfts[0].name,
                nftDescription: lottery.Nfts[0].description,
                editions: lottery.Nfts[0].numberOfEditions,
                artistUsername: lottery.Drop.Artist.username,
                artistDisplayName: lottery.Drop.Artist.displayName,
                artistProfilePicture: lottery.Drop.Artist.profilePicture ? 'BLOB' : null,
                startTime: lottery.startTime,
                endTime: lottery.endTime,
                blockchainCreatedAt: lottery.blockchainCreatedAt,
                vipPriceCoins: lottery.vipCostPerTicketCoins,
                vipPricePoints: lottery.vipCostPerTicketPoints,
                memberPriceCoins: lottery.memberCostPerTicketCoins,
                memberPricePoints: lottery.memberCostPerTicketPoints,
                generalPriceCoins: lottery.nonMemberCostPerTicketCoins,
                userBalanceCoins,
                userBalancePoints,
                userTier,
                userTickets: ticketCount?.userTickets,
                maxTicketsPerUser: lottery.maxTicketsPerUser,
                maxTickets: lottery.maxTickets,
                ticketsSold: ticketCount?.totalTickets,
                isRefundable: lottery.isRefundable,
                status: 'Created' || 'Canceled' || 'Closed' || 'Completed', // TODO
                isUserRefundAvailable: false, // TODO
                userPrizes: prizes?.length,
              },
              null,
              2
            )}
            {prizes?.map((prize, index) => {
              if (prize.claimedAt) {
                return (
                  <div key={index}>
                    NFT '{prize.nftName}' claimed at {prize.claimedAt}
                  </div>
                );
              } else {
                return (
                  <button key={index} onClick={() => handleClaimLotteryPrizeClick(index)}>
                    Claim NFT '{prize.nftName}'
                  </button>
                );
              }
            })}
          </pre>
          <GetTicketModal
            isOpen={isGetTicketModalOpen}
            closeModal={closeGetTicketModal}
            lottery={lottery}
            artist={lottery.Drop.Artist}
          />
        </>
      )}
    </div>
  );
}

export default lottery;
