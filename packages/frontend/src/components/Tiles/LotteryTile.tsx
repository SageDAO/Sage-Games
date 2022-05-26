import NftTile from '@/components/Tiles/NftTile';
import type { Lottery_include_Nft } from '@/prisma/types';
import { basePathLotteries } from '@/constants/paths';
import GetTicketModal from '@/components/Modals/GetTicketModal';
import useModal from '@/hooks/useModal';
import type { User } from '@prisma/client';

type Props = {
  lottery: Lottery_include_Nft;
  artist: User;
};

export default function LotteryTile({ lottery, artist }: Props) {
  const { openModal, isOpen: isModalOpen, closeModal } = useModal();

  return (
    <NftTile
      buttonText='Enter Lottery'
      buttonAction={openModal}
      name={lottery.Nfts[0].name}
      subtitle={`${String(lottery.Nfts.length)} NFTs`}
      imgSrc={lottery.Nfts[0].s3Path}
      imgLink={`${basePathLotteries}/${lottery.id}`}
    >
      <GetTicketModal isOpen={isModalOpen} closeModal={closeModal} lottery={lottery} artist={artist} />
    </NftTile>
  );
}
