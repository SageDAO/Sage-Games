import { useState } from 'react';
import { BadgeCheckIcon, CloudUploadIcon, ExclamationCircleIcon } from '@heroicons/react/outline';
import { ProgressBar } from '../ProgressBar';
import { validate } from './_validation';
import { handleDropUpload } from '../../services/dropUploadClient';
import Confetti from 'react-confetti';
import { useWindowSize } from 'react-use';

type Props = {
  formData: any;
};

export const Tab5_Review = ({ ...props }: Props) => {
  const [currentProgressPercent, setCurrentProgressPercent] = useState<number>();
  const [displayConfetti, setDisplayConfetti] = useState<boolean>(false);
  const [recycleConfetti, setRecycleConfetti] = useState<boolean>(true);
  const { width, height } = useWindowSize();
  const errors = validate(props.formData);

  const splitsAsArray = (data: any, pctField: string, adrField: string, range: number[]): any[] => {
    let splits = Array();
    for (let i of range) {
      let percent = data[`${pctField}${i}`];
      let destinationAddress = data[`${adrField}${i}`];
      if (percent && Number(percent) > 0 && destinationAddress && destinationAddress.length > 0) {
        splits.push({ percent: parseFloat(percent), destinationAddress });
      }
    }
    return splits;
  };

  const displayProgressBar = () => {
    document.getElementById('progressBar').style.display = 'block';
  };

  const startUpload = async (e: React.MouseEvent<HTMLButtonElement>) => {
    (e.target as HTMLButtonElement).disabled = true;
    try {
      const data = props.formData;
      // data.royaltySplitEntries = splitsAsArray(data, "rltySplit", "rltySplitAddr", [1, 2, 3, 4]);
      // data.primarySalesSplitEntries = splitsAsArray(
      //         data,
      //         "pmySalesSplit",
      //         "pmySalesSplitAddr",
      //         [1, 2, 3, 4]
      //     );
      setDisplayConfetti(false);
      setRecycleConfetti(true);
      displayProgressBar();
      await handleDropUpload(data, setCurrentProgressPercent);
      setDisplayConfetti(true);
      setTimeout(() => setRecycleConfetti(false), 5000);
    } catch (e) {
      console.log(e);
    }
    (e.target as HTMLButtonElement).disabled = false;
  };

  const nftsInDrop = props.formData.auctionGames.slice(0);
  for (const d of props.formData.drawingGames) {
    Array.prototype.push.apply(nftsInDrop, d.nfts);
  }

  return (
    <div className='mt-5'>
      {displayConfetti && <Confetti width={width} height={height} recycle={recycleConfetti} />}
      {errors.map((item: string, i: number) => {
        return (
          <div key={i} className='mx-auto alert alert-danger' role='alert' style={{ width: '50%' }}>
            <ExclamationCircleIcon width='20' stroke='#842029' /> &nbsp; {item}
          </div>
        );
      })}
      {errors.length == 0 && (
        <div className='text-center'>
          <div className='flex items-center'>
            {nftsInDrop.map((nft: any, i: number) => (
              <NftPreview nft={nft} key={i} />
            ))}
          </div>
          <div className='mx-auto alert alert-primary mt-5' role='alert' style={{ width: '50%' }}>
            <BadgeCheckIcon width='20' stroke='#084298' /> &nbsp; Everything looks good!
          </div>
          <button className='mx-auto btn btn-primary mt-4' onClick={startUpload}>
            <CloudUploadIcon width='20' stroke='white' /> &nbsp; Upload Drop to {props.formData.target}
          </button>
          <div id='progressBar' className='mt-5 mx-auto' style={{ width: '50%', display: 'none' }}>
            <ProgressBar currentProgressPercent={currentProgressPercent} />
          </div>
        </div>
      )}
      {/* <br />
      <br />
      <div className='mx-auto' role='alert' style={{ width: '50%' }}>
        <pre>{JSON.stringify(props.formData, null, 2)}</pre>
      </div> */}
    </div>
  );
};

function NftPreview({ nft }) {
  return (
    <div style={{ display: 'inline-block', padding: '10px' }}>
      {nft.preview}
      <br />
      <b>{nft.name}</b>
      <br />
      <span style={{ fontSize: '12px' }}>editions: {nft.numberOfEditions || 1}</span>
    </div>
  );
}
