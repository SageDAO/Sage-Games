import { DropWithArtist } from '@/prisma/types';
import { useApproveDropMutation } from '@/store/services/dashboardReducer';
import Image from 'next/image';

interface Props {
  drop: DropWithArtist;
}

export default function NewDropCard({ drop }: Props) {
  const [approveDrop] = useApproveDropMutation();

  const handleApproveDropClick = async () => {};

  return (
    <>
      <div className='nft-tile'>
        <div className='image'>
          <Image src={drop.bannerImageS3Path || '/sample/0.png'} layout='fill' objectFit='cover' />
        </div>
        <div className='collection__tile-details'>
          <div className='interact' style={{ width: '200px' }}>
            <div className='interact__info' style={{ textAlign: 'left' }}>
              <h1 className='interact__name'>{drop.name}</h1>
              <h1 className='interact__subtitle'>{drop.Artist.displayName || 'anon'}</h1>
            </div>
          </div>
        </div>
        <button
          className='interact__claimbutton'
          onClick={handleApproveDropClick}
          style={{ width: '100%' }}
        >
          Approve Drop
        </button>
      </div>
    </>
  );
}
