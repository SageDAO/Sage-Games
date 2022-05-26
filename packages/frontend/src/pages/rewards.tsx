import PrizeCard from '@/components/PrizeCard';
import { GamePrize } from '@/prisma/types';
import { useGetUnclaimedAuctionNftsPerUserQuery } from '@/store/services/auctionsReducer';
import { useSession } from 'next-auth/react';
import Loader from 'react-loader-spinner';
import { useGetUnclaimedPrizesByUserQuery } from '../store/services/prizesReducer';

export default function rewards() {
  const { data: sessionData } = useSession();
  const { data: lotteryPrizes, isFetching: isFetchingFromLotteries } =
    useGetUnclaimedPrizesByUserQuery(sessionData?.address as string, {
      skip: !sessionData?.address,
    });
  const { data: auctionPrizes, isFetching: isFetchingFromAuctions } =
    useGetUnclaimedAuctionNftsPerUserQuery(undefined, {
      skip: !sessionData?.address,
    });

  if (!sessionData) return <div>Please Login</div>;

  if (isFetchingFromLotteries || isFetchingFromAuctions) {
    return (
      <div className='profile-page'>
        <br />
        <Loader type='ThreeDots' color='white' height={10} width={50} timeout={0} />
      </div>
    );
  }
  const prizes = new Array().concat(lotteryPrizes, auctionPrizes);
  return (
    <div id='rewards-page'>
      <div
        className='games__grid'
        style={{
          display: 'flex',
          flexDirection: 'row',
          gap: '10px',
          textAlign: 'center',
          margin: '25px',
        }}
      >
        {false && prizes?.length == 0 && (
          <div style={{ marginTop: '50px', marginLeft: '50px' }}>
            No unclaimed prizes to display (yet)!
          </div>
        )}
        {prizes?.map((p: GamePrize, i: number) => (
          <PrizeCard prize={p} key={i} />
        ))}
      </div>
    </div>
  );
}
