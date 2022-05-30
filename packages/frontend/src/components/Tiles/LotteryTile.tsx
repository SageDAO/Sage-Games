import NftTile from '@/components/Tiles/NftTile';
import type { Lottery_include_Nft } from '@/prisma/types';
import { basePathLotteries } from '@/constants/paths';
import GetTicketModal from '@/components/Modals/Games/GetTicketModal';
import useModal from '@/hooks/useModal';
import type { User } from '@prisma/client';

type Props = {
  lottery: Lottery_include_Nft;
  artist: User;
  dropName: string;
};

export default function LotteryTile({ lottery, artist, dropName }: Props) {
  const { openModal, isOpen: isModalOpen, closeModal } = useModal(false);
  const isActive = false;
  return (
    <NftTile
      button={
        isActive ? (
          <button className='nft-tile__interact-btn' onClick={openModal}>
            Get Tickets
          </button>
        ) : (
          <button disabled className='nft-tile__interact-btn' onClick={openModal}>
            Inactive
          </button>
        )
      }
      name={lottery.Nfts[0].name}
      subtitle={`${String(lottery.Nfts.length)} NFTs`}
      imgSrc={lottery.Nfts[0].s3Path}
      imgLink={`${basePathLotteries}/${lottery.id}`}
    >
      <GetTicketModal
        isOpen={isModalOpen}
        closeModal={closeModal}
        lottery={lottery}
        artist={artist}
				nft={lottery.Nfts[0]}
        dropName={dropName}
      />
    </NftTile>
  );
}
