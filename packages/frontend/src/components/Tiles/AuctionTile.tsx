import NftTile from '@/components/Tiles/NftTile';
import type { Auction_include_Nft } from '@/prisma/types';
import type { User } from '@prisma/client';
import { basePathAuctions } from '@/constants/paths';
import PlaceBidModal from '@/components/Modals/PlaceBidModal';
import useModal from '@/hooks/useModal';

type Props = {
  auction: Auction_include_Nft;
  artist: User;
};

export default function AuctionTile({ auction, artist }: Props) {
  const { openModal, isOpen: isModalOpen, closeModal } = useModal();

  return (
    <NftTile
      buttonText={'Place Bid'}
      buttonAction={openModal}
      name={auction.Nft.name}
      subtitle={`Auction - ${auction.Nft.numberOfEditions} editions`}
      imgSrc={auction.Nft.s3Path}
      imgLink={`${basePathAuctions}/${auction.id}`}
    >
      <PlaceBidModal isOpen={isModalOpen} closeModal={closeModal} auction={auction} artist={artist} />
    </NftTile>
  );
}
