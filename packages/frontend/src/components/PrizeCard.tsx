import { GamePrize } from '@/prisma/types';
import { useClaimAuctionNftMutation } from '@/store/services/auctionsReducer';
import { ClaimPrizeRequest, useClaimLotteryPrizeMutation } from '@/store/services/prizesReducer';
import { useSession } from 'next-auth/react';

interface Props {
  prize: GamePrize;
}

export default function PrizeCard({ prize }: Props) {
  const [claimLotteryPrize] = useClaimLotteryPrizeMutation();
  const [claimAuctionNft] = useClaimAuctionNftMutation();
  const { data: sessionData } = useSession();

  const handleClaimPrizeClick = async () => {
    if (prize.auctionId) {
      await claimAuctionNft(prize.auctionId);
    } else {
      await claimLotteryPrize({
        lotteryId: prize.lotteryId,
        nftId: prize.nftId,
        ticketNumber: prize.lotteryTicketNumber,
        proof: prize.lotteryProof,
        walletAddress: sessionData?.address,
      } as ClaimPrizeRequest);
    }
  };

  return (
    <div>
      <img src={prize.s3Path} alt='0' width='200' height='200' />
      <br />
      {prize.nftName}
      <br />
      by @{prize.artistUsername}
      <br />
      <button style={{ margin: '15px' }} onClick={handleClaimPrizeClick}>
        Claim NFT
      </button>
    </div>
  );
}
