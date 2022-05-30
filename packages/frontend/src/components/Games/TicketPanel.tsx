import { Lottery_include_Nft } from '@/prisma/types';
import { useGetUserDisplayInfoQuery } from '@/store/services/user';
useGetUserDisplayInfoQuery;
import Image from 'next/image';
import { useBalance, useAccount } from 'wagmi';
import GetTicketModal from '@/components/Modals/Games/GetTicketModal';
import useModal from '@/hooks/useModal';
import { User } from '@prisma/client';

interface Props {
  lottery: Lottery_include_Nft;
  artist: User;
  dropName: string;
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

export default function LotteryPanel({ lottery, artist, dropName }: Props) {
  const {
    isOpen: isTicketModalOpen,
    closeModal: closeTicketModal,
    openModal: openTicketModal,
  } = useModal();
  const { data: accountData } = useAccount();
  const { data: userBalance } = useBalance({ addressOrName: accountData?.address });
  return (
    <div className='auction-panel'>
      <GetTicketModal
        isOpen={isTicketModalOpen}
        closeModal={closeTicketModal}
        lottery={lottery}
        artist={artist}
        dropName={dropName}
      />
    </div>
  );
}
