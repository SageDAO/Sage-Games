import {
  BuyTicketRequest,
  TicketPriceTier,
  useBuyTicketsMutation,
} from '@/store/services/lotteriesReducer';
import Modal, { Props as ModalProps } from '@/components/Modals';
import { useSession } from 'next-auth/react';
import { Lottery_include_Nft, User } from '@/prisma/types';

interface Props extends ModalProps {
  lottery: Lottery_include_Nft;
  artist: User;
}

function GetTicketModal({ isOpen, closeModal, lottery, artist }: Props) {
  const { data: sessionData } = useSession();
  const [buyTickets] = useBuyTicketsMutation();

  const getPriceCoins = (tier: TicketPriceTier): bigint => {
    if (tier == TicketPriceTier.VIP) {
      var price = lottery.vipCostPerTicketCoins;
    } else if (tier == TicketPriceTier.Member) {
      var price = lottery.memberCostPerTicketCoins;
    } else {
      var price = lottery.nonMemberCostPerTicketCoins;
    }
    return BigInt(price * 1000) * BigInt(10 ** 15);
  };

  const getPricePoints = (tier: TicketPriceTier): bigint => {
    if (tier == TicketPriceTier.VIP) {
      return BigInt(lottery.vipCostPerTicketPoints);
    } else if (tier == TicketPriceTier.Member) {
      return BigInt(lottery.memberCostPerTicketPoints);
    }
    return BigInt(0);
  };

  const fetchUserPointsAndProof = async (): Promise<{
    totalPointsEarned: bigint;
    proof: string;
  }> => {
    const response = await fetch('/api/points');
    const data = await response.json();
    return {
      totalPointsEarned: BigInt(data.totalPointsEarned),
      proof: data.proof,
    };
  };

  const handleBuyTicketClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
    const tier = Number(e.currentTarget.name); // button name represents price tier
    const pricePoints = getPricePoints(tier);
    if (pricePoints > 0) {
      var { totalPointsEarned, proof } = await fetchUserPointsAndProof();
    } else {
      var totalPointsEarned = BigInt(0),
        proof = '';
    }

    const request = {
      walletAddress: sessionData?.address,
      lotteryId: lottery.id,
      numberOfTickets: 1,
      ticketCostPoints: pricePoints,
      ticketCostCoins: getPriceCoins(tier),
      tier,
      totalPointsEarned,
      proof,
    } as BuyTicketRequest;
    await buyTickets(request);
  };

  return (
    <Modal title='Get a Ticket' isOpen={isOpen} closeModal={closeModal}>
      <div className='accountmodal'>
        Buy Tickets
        <br />
        <img src={lottery.Nfts[0].s3Path} alt='' width='100' />
        <br />
        <pre style={{ fontFamily: 'monospace', whiteSpace: 'pre-wrap' }}>
          {JSON.stringify(
            {
              nftName: lottery.Nfts[0].name,
              editions: lottery.Nfts[0].numberOfEditions,
              artist: artist.username || 'anon',
              drawingFor: lottery.Nfts.length > 1 ? 'Multiple NFTs' : 'Individual NFT',
              isRefundable: lottery.isRefundable,
              // pointsBalance: userBalance.points,
              // coinsBalance: userBalance.coins,
            },
            null,
            2
          )}
        </pre>
        <button name={TicketPriceTier.VIP.toString()} onClick={handleBuyTicketClick}>
          MEME VIPs: {lottery.vipCostPerTicketPoints} points + {lottery.vipCostPerTicketCoins} coins
        </button>
        <button name={TicketPriceTier.Member.toString()} onClick={handleBuyTicketClick}>
          PINA holders: {lottery.memberCostPerTicketPoints} points + {lottery.memberCostPerTicketCoins} coins
        </button>
        <button name={TicketPriceTier.NonMember.toString()} onClick={handleBuyTicketClick}>
          General: {lottery.nonMemberCostPerTicketCoins} coins
        </button>
      </div>
    </Modal>
  );
}

export default GetTicketModal;
