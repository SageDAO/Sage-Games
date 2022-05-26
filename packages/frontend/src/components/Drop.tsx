import { Lottery as LotteryType, Auction as AuctionType } from '@prisma/client';
import Image from 'next/image';
import shortenAddress from '@/utilities/shortenAddress';
import Link from 'next/link';
import { DropWithGamesAndArtist } from '@/prisma/types';

interface Props {
  drop: DropWithGamesAndArtist;
}

type Game = Partial<LotteryType> | Partial<AuctionType>;

function computeStatus({ Lotteries, Auctions }: DropWithGamesAndArtist) {
  let games: Game[];
  let startTime: number;
  let endTime: number;
  let status: 'upcoming' | 'active' | 'drawn';

  games = [...Lotteries!, ...Auctions!];

  games.sort((a: any, b: any) => +a.startTime - +b.startTime);
  startTime = +games[0].startTime!;

  games.sort((a: any, b: any) => +b.endTime + a.endTime);
  endTime = +games[0].endTime!;

  status = 'upcoming';
  if (startTime < Date.now()) {
    status = 'active';
    if (endTime < Date.now()) {
      status = 'drawn';
      //TODO: check if user has a claimable in this drop
    }
  }

  //TODO: this function should return react nodes with unique styling
  return { startTime, endTime, status };
}

export default function Drop({ drop }: Props) {
  const { status } = computeStatus(drop);
  return (
    <div className='drop'>
      <Link href={`drops/${drop.id}`}>
        <div className='thumbnail'>
          <Image src={drop.bannerImageS3Path || '/'} layout='fill' objectFit='cover' />
        </div>
      </Link>
      <div className='details'>
        <div className='artist'>
          <div className='artist-pfp'>
            <Image
              src={drop.Artist.profilePicture || '/sample/pfp.svg'}
              layout='fill'
              objectFit='cover'
            />
          </div>
          <h1 className='artist-name'>
            {drop.Artist.username || shortenAddress(drop.artistAddress)}
          </h1>
        </div>
        <div className='status'>{status}</div>
      </div>
    </div>
  );
}
