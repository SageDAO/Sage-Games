import { toast } from 'react-toastify';
import { bid, useGetAuctionStateQuery } from '@/store/services/auctionsReducer';
import Modal, { Props as ModalProps } from '@/components/Modals';
import { Auction_include_Nft } from '@/prisma/types';
import type { User } from '@prisma/client';
import GamesModalHeader from './GamesModalHeader';
import Status from '@/components/Status';
import { useState } from 'react';
import useAsync from '@/hooks/useAsync';
import Loader from 'react-loader-spinner';
import { useAccount, useBalance } from 'wagmi';

interface Props extends ModalProps {
  auction: Auction_include_Nft;
  artist: User;
}

//@scss : '@/styles/components/_games-modal.scss'
function PlaceBidModal({ isOpen, closeModal, auction, artist }: Props) {
  const [desiredBidValue, setDesiredBidValue] = useState<number>(+auction.minimumPrice! || 0);
  const { data: accountData } = useAccount();
  const { data: balance } = useBalance({ addressOrName: accountData?.address });
  const { call } = useAsync<{ auctionId: number; amount: number }, void>(bid);
  // const handlePlaceBidClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
  //   const bidVal = (document.getElementById('bid') as HTMLInputElement).value;
  //   if (bidVal && !isNaN(+bidVal)) {
  //     bid(auction.id, +bidVal * 10 ** 18);
  //   } else {
  //     toast.error('Invalid bid amount');
  //   }
  // };

  function handlePlaceBidClick(e: React.MouseEvent<HTMLButtonElement>) {
    // ? is it better not to handle checks here and let errors be handled by wallet?
    if (+balance?.formatted! < desiredBidValue) {
      toast.error('Insufficient funds');
      return;
    }
    if (+auction.minimumPrice! > desiredBidValue) {
      toast.error('Bid too low');
      return;
    }
    call({ auctionId: auction.id, amount: desiredBidValue });
  }

  function handleMaxButtonClick() {
    setDesiredBidValue(+auction.buyNowPrice! || +balance?.formatted! || 1000);
  }

  function handleMinButtonClick() {
    setDesiredBidValue(+auction.minimumPrice!);
  }

  function handleBidInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    setDesiredBidValue(e.currentTarget.valueAsNumber);
  }

  let pending = false;

  const { data: auctionState } = useGetAuctionStateQuery(auction.id);
  return (
    <Modal title='Place a Bid' isOpen={isOpen} closeModal={closeModal}>
      <div className='games-modal'>
        <GamesModalHeader
          imgSrc={auction.Nft.s3Path}
          nftName={auction.Nft.name}
          nftEditions={auction.Nft.numberOfEditions}
          artist={artist}
        ></GamesModalHeader>
        <div className='games-modal__rules'>
          <div className='games-modal__rules-item'>
            <div className='games-modal__rules-label'>Current Bid</div>
            <div className='games-modal__rules-value'>{auctionState?.highestBid}</div>
          </div>
          <div className='games-modal__rules-item'>
            <div className='games-modal__rules-label'>Bid extension</div>
            <div className='games-modal__rules-value'>time</div>
          </div>
          <div className='games-modal__rules-item'>
            <div className='games-modal__rules-label'>Bid increment</div>
            <div className='games-modal__rules-value'>value</div>
          </div>
          <div className='games-modal__rules-divider-container'>
            <div className='games-modal__rules-divider-rectangle'></div>
          </div>
          <div className='games-modal__rules-item'>
            <div className='games-modal__rules-label'>Minimum Bid</div>
            <div className='games-modal__rules-value'>value</div>
          </div>
        </div>
        <div className='games-modal__header'>
          <h1 className='games-modal__header-label'>Amount</h1>
          <div className='games-modal__header-value games-modal__header-value--blue'>
            {auction.buyNowPrice || auction.minimumPrice}
          </div>
        </div>
        <div className='games-modal__bid-controls'>
          <input
            type='number'
            className='games-modal__bid-input'
            value={desiredBidValue}
            onChange={handleBidInputChange}
            min={+auction.minimumPrice! || 0}
            max={+auction.buyNowPrice! || undefined}
            disabled={pending}
          ></input>
          <span className='games-modal__bid-unit'>ETH</span>
          <button
            className='games-modal__bid-min-max-btn'
            disabled={pending}
            onClick={handleMinButtonClick}
          >
            min
          </button>
          <button
            className='games-modal__bid-min-max-btn'
            disabled={pending}
            onClick={handleMaxButtonClick}
          >
            max
          </button>
        </div>
        <button
          className='games-modal__place-bid-btn'
          disabled={pending}
          onClick={handlePlaceBidClick}
        >
          {pending ? (
            <>
              <Loader type='TailSpin' color='white' height='20px' width='20px' /> Bidding...
            </>
          ) : (
            'Place bid'
          )}
        </button>
        <div className='games-modal__status-container'></div>
      </div>
    </Modal>
  );
}

export default PlaceBidModal;
