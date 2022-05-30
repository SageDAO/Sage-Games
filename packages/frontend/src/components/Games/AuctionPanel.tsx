import { Auction_include_Nft } from '@/prisma/types';
import { useGetAuctionStateQuery } from '@/store/services/auctionsReducer';
import { useGetUserDisplayInfoQuery } from '@/store/services/user';
useGetUserDisplayInfoQuery;
import Image from 'next/image';
import { useBalance, useAccount } from 'wagmi';
import PlaceBidModal from '@/components/Modals/Games/PlaceBidModal';
import useModal from '@/hooks/useModal';
import { User } from '@prisma/client';

interface Props {
  auction: Auction_include_Nft;
  artist: User;
}

type GameStatus = 'Done' | 'Live' | 'Error';

function computeGameStatus(start: number, end: number, settled: boolean): GameStatus {
  if (settled) {
    return 'Done';
  }
  if (end < Date.now()) {
    return 'Done';
  }
  if (start < Date.now()) {
    return 'Live';
  }
  return 'Error';
}

export default function AuctionPanel({ auction, artist }: Props) {
  const {
    isOpen: isPlaceBidModalOpen,
    closeModal: closePlaceBidModal,
    openModal: openCloseBidModal,
  } = useModal();
  const { data: accountData } = useAccount();
  const { data: userBalance } = useBalance({ addressOrName: accountData?.address });
  const { data: auctionState } = useGetAuctionStateQuery(auction.id);
  const { data: highestBidder } = useGetUserDisplayInfoQuery(auctionState?.highestBidder!, {
    skip: !(
      auctionState?.highestBidder &&
      auctionState?.highestBidder != '0x0000000000000000000000000000000000000000'
    ),
  });
  const status: GameStatus = auctionState
    ? computeGameStatus(
        auction.startTime.getTime(),
        auctionState!.endTime,
        auctionState!.settled
      )
    : 'Error';
  return (
    <div className='auction-panel'>
      <PlaceBidModal
        isOpen={isPlaceBidModalOpen}
        closeModal={closePlaceBidModal}
        auction={auction}
        artist={artist}
      />
      <div className='auction-panel__header'>
        <h1 className='auction-panel__header-title'>Auction</h1>
        <div className='auction-panel__balance-label'>
          Balance
          <div className='auction-panel__balance'>
            {userBalance?.formatted} {userBalance?.symbol}
          </div>
        </div>
      </div>
      <div className='auction-panel__pricing'>
        <div className='auction-panel__pricing-item'>
          <h1 className='auction-panel__pricing-label'>Current Bid</h1>
          <div className='auction-panel__price'>
            {auctionState?.highestBid || 0}
            <div className='auction-panel__price-unit'>ETH</div>
          </div>
        </div>
        {highestBidder && (
          <div className='auction-panel__pricing-item'>
            <h1 className='auction-panel__pricing-label'>Highest Bidder</h1>
            <div className='auction-panel__highest-bidder'>
              <div className='auction-panel__highest-bidder-pfp'>
                <Image src={highestBidder?.profilePicture || '/sample/pfp.svg'} layout='fill' />
              </div>
              <div className='auction-panel__highest-bidder-name'>
                {highestBidder?.displayName}
                <div className='auction-panel__highest-bidder-username'>
                  @{highestBidder?.username}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      <div className='auction-panel__actions'>
        <button className='auction-panel__place-bid-btn' onClick={openCloseBidModal}>
          Place A Bid
        </button>
        {status == 'Done' && (
          <div className='auction-panel__status-dot auction-panel__status-dot--inactive' />
        )}
        {status === 'Live' && (
          <div className='auction-panel__status-dot auction-panel__status-dot--active' />
        )}
        {status === 'Error' && (
          <div className='auction-panel__status-dot auction-panel__status-dot--error' />
        )}
        <div className='auction-panel__status-text'>{status}</div>
        {status === 'Live' && <div className='auction-panel__countdown'>00h 03m 12s</div>}
        <h1 className='auction-panel__rules'>Auction Rules</h1>
      </div>
    </div>
  );
}
