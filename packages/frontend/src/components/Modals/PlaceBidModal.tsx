import { toast } from 'react-toastify';
import { bid } from '@/store/services/auctionsReducer';
import Modal, { Props as ModalProps } from '@/components/Modals';
import { Auction_include_Nft } from '@/prisma/types';
import type { User } from '@prisma/client';

interface Props extends ModalProps {
  auction: Auction_include_Nft;
  artist: User;
}

//TODO: auction should be fetched inside this modal,
//rather than passed as a prop from a layer above
function PlaceBidModal({ isOpen, closeModal, auction, artist }: Props) {
  const handlePlaceBidClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
    const bidVal = (document.getElementById('bid') as HTMLInputElement).value;
    if (bidVal && !isNaN(+bidVal)) {
      bid(auction.id, +bidVal * 10 ** 18);
    } else {
      toast.error('Invalid bid amount');
    }
  };

  return (
    <Modal title='Place a Bid' isOpen={isOpen} closeModal={closeModal}>
      <div className='place-bid-modal'>
        <input type='text' id='bid' name='bid' />
        <button onClick={handlePlaceBidClick}>Place a Bid</button>
      </div>
    </Modal>
  );
}

export default PlaceBidModal;
