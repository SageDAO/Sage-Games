import NftTile from '@/components/Tiles/NftTile';
import type { Auction_include_Nft } from '@/prisma/types';
import type { User } from '@prisma/client';
import { basePathAuctions } from '@/constants/paths';
import PlaceBidModal from '@/components/Modals/Games/PlaceBidModal';
import useModal from '@/hooks/useModal';
import { useGetAuctionStateQuery } from '@/store/services/auctionsReducer';

type Props = {
  auction: Auction_include_Nft;
  artist: User;
};


// styles/components/_nft-tile.scss
export default function AuctionTile({ auction, artist }: Props) {
  const { openModal, isOpen: isModalOpen, closeModal } = useModal(true);
  const { data: auctionState } = useGetAuctionStateQuery(auction.id);
  const isActive = auctionState?.settled || false;
  return (
    <NftTile
      name={auction.Nft.name}
      button={
        isActive ? (
          <button className='nft-tile__interact-btn' onClick={openModal}>
            Place bid
          </button>
        ) : (
          <button disabled className='nft-tile__interact-btn' onClick={openModal}>
            Inactive 
          </button>
        )
      }
      subtitle={`Auction - ${auction.Nft.numberOfEditions} editions`}
      imgSrc={auction.Nft.s3Path}
      imgLink={`${basePathAuctions}/${auction.id}`}
    >
      <PlaceBidModal
        isOpen={isModalOpen}
        closeModal={closeModal}
        auction={auction}
        artist={artist}
      />
    </NftTile>
  );
}
