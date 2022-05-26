import NftTile from '@/components/Tiles/NftTile';
import type { Lottery_include_Nft } from '@/prisma/types';
import { basePathLotteries } from '@/constants/paths';
import GetTicketModal from '@/components/Modals/GetTicketModal';
import useModal from '@/hooks/useModal';
import { User } from '@prisma/client';

type Props = {
  drawing: Lottery_include_Nft;
  artist: User;
};

export default function DrawingTile({ drawing, artist }: Props) {
  const { openModal, isOpen: isModalOpen, closeModal } = useModal();

  return (
    <NftTile
      buttonText='Get Tickets'
      buttonAction={openModal}
      name={drawing.Nfts[0].name}
      subtitle={`${drawing.Nfts[0].numberOfEditions} editions`}
      imgSrc={drawing.Nfts[0].s3Path}
      imgLink={`${basePathLotteries}/${drawing.id}`}
    >
      <GetTicketModal isOpen={isModalOpen} closeModal={closeModal} lottery={drawing} artist={artist} />
    </NftTile>
  );
}
