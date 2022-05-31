import { BuyTicketRequest, useBuyTicketsMutation } from '@/store/services/lotteriesReducer';
import Modal, { Props as ModalProps } from '@/components/Modals';
import { useSession } from 'next-auth/react';
import { Lottery_include_Nft, Nft } from '@/prisma/types';
import { User } from '@prisma/client';
import GamesModalHeader from './GamesModalHeader';
import { useState } from 'react';
import { useAccount } from 'wagmi';
import GetTicketsButton from '@/components/Games/GetTicketsButton';

interface Props extends ModalProps {
  lottery: Lottery_include_Nft;
  nft: Nft;
  artist: User;
  dropName: string;
}

//@scss : '@/styles/components/_games-modal.scss'
function GetTicketModal({ isOpen, closeModal, lottery, dropName, artist, nft }: Props) {
  const [desiredTicketAmount, setDesiredTicketAmount] = useState<number>(0);
  const { data: sessionData } = useSession();
  const [buyTickets, { isLoading }] = useBuyTicketsMutation();
  const { data: accountData } = useAccount();

  //ui event handlers
  function handleTicketSubClick() {
    if (desiredTicketAmount == 0) {
      return;
    }
    setDesiredTicketAmount((prevState) => prevState - 1);
  }

  function handleTicketAddClick() {
    if (desiredTicketAmount + 1 > lottery.maxTicketsPerUser) {
      return;
    }
    setDesiredTicketAmount((prevState) => prevState + 1);
  }

  function handleTicketInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = +e.target.value;
    if (val < 0) {
      return;
    }
    if (val > lottery.maxTicketsPerUser) {
      e.currentTarget.value = String(lottery.maxTicketsPerUser);
      setDesiredTicketAmount(lottery.maxTicketsPerUser);
    }
    setDesiredTicketAmount(+e.target.value);
  }

  // ? lottery db field will only have one tier?
  const getPriceCoins = (): bigint => {
    return BigInt(lottery.memberCostPerTicketCoins * 1000) * BigInt(10 ** 15);
  };

  // ? lottery db field will only have one tier?
  const getPricePoints = (): bigint => {
    return BigInt(lottery.memberCostPerTicketPoints);
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

  const handleBuyTicketClick = async () => {
    const pricePoints = getPricePoints();
    if (pricePoints > 0) {
      var { totalPointsEarned, proof } = await fetchUserPointsAndProof();
    } else {
      var totalPointsEarned = BigInt(0),
        proof = '';
    }

    const request = {
      walletAddress: accountData?.address,
      lotteryId: lottery.id,
      numberOfTickets: desiredTicketAmount,
      ticketCostPoints: pricePoints,
      ticketCostCoins: getPriceCoins(),
      totalPointsEarned,
      proof,
    } as BuyTicketRequest;
    await buyTickets(request);
  };

  return (
    <Modal title='Get a Ticket' isOpen={isOpen} closeModal={closeModal}>
      <div className='games-modal'>
        <GamesModalHeader
          imgSrc={nft.s3Path}
          nftName={nft.name}
          nftEditions={nft.numberOfEditions}
          artist={artist}
        ></GamesModalHeader>
        <div className='games-modal__rules'>
          <div className='games-modal__rules-item'>
            <div className='games-modal__rules-label'>Drawing For</div>
            <div className='games-modal__rules-value'>{nft.name}</div>
          </div>
          <div className='games-modal__rules-item'>
            <div className='games-modal__rules-label'>Refundable</div>
            <div className='games-modal__rules-value'>
              {lottery.isRefundable ? 'true' : 'false'}
            </div>
          </div>
          <div className='games-modal__rules-item'>
            <div className='games-modal__rules-label'>Drawing</div>
            <div className='games-modal__rules-value'>{lottery.endTime.toLocaleDateString()}</div>
          </div>
        </div>
        <div className='games-modal__heading'>
          <h1 className='games-modal__heading-label'>Price per ticket</h1>
          <div className='games-modal__heading-value games-modal__heading-value--green'>
            {lottery.memberCostPerTicketPoints} PIXEL
          </div>
        </div>
        <div className='games-modal__tickets-section'>
          <div className='games-modal__tickets-inner'>
            <div className='games-modal__tickets-controls'>
              <button
                onClick={handleTicketSubClick}
                className='games-modal__tickets-sub'
                disabled={isLoading}
              >
                -
              </button>
              <input
                type='number'
                className='games-modal__tickets-input'
                value={desiredTicketAmount}
                onChange={handleTicketInputChange}
                min={1}
                max={lottery.maxTicketsPerUser}
                disabled={isLoading}
              ></input>
              <button
                onClick={handleTicketAddClick}
                className='games-modal__tickets-add'
                disabled={isLoading}
              >
                +
              </button>
            </div>
          </div>
          <div className='games-modal__tickets-total'>
            <span className='games-modal__tickets-total-label'>Total </span>
            {desiredTicketAmount * lottery.memberCostPerTicketPoints} PIXEL{' + '}
            {desiredTicketAmount * lottery.memberCostPerTicketCoins} ASH
          </div>
          <div className='games-modal__btn-container'>
            <GetTicketsButton onClick={handleBuyTicketClick} pending={isLoading}></GetTicketsButton>
          </div>
        </div>
      </div>
    </Modal>
  );
}

export default GetTicketModal;
