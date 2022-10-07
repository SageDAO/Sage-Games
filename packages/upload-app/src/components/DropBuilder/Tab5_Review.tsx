import { useState } from 'react';
import { BadgeCheckIcon, CloudUploadIcon, ExclamationCircleIcon, TicketIcon } from '@heroicons/react/outline';
import { ProgressBar } from '../ProgressBar';
import { validate } from './_validation';
import { handleDropUpload } from '../../services/dropUploadClient';
import Confetti from 'react-confetti';
import { useWindowSize } from 'react-use';
import { format as formatDate } from 'date-fns';
import { toNamespacedPath } from 'path';
import MediaPreview from '../MediaPreview';

type Props = {
  formData: any;
};

export const Tab5_Review = ({ ...props }: Props) => {
  const [currentProgressPercent, setCurrentProgressPercent] = useState<number>(0);
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
            <MediaPreview file={props.formData.bannerImageFile} width={350} />
            <br />
            <b>{props.formData.name}</b>
            <br />
            &nbsp;
          </div>
          <div className='flex items-center'>
            {props.formData.auctionGames.map((auction: any, i: number) => (
              <GameReviewItem game={auction} nft={auction} gameType='auction' key={i} />
            ))}
            {props.formData.drawingGames.map((drawing: any) =>
              drawing.nfts.map((nft: any, i: number) => (
                <GameReviewItem game={drawing} nft={nft} gameType='drawing' key={i} />
              ))
            )}
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

function GameReviewItem({ game, gameType, nft }) {
  return (
    <table style={{ marginLeft: 'auto', marginRight: 'auto', width: '50%' }} cellPadding={'5px'}>
      <tbody>
        <tr>
          <td width='150'>
            <div style={{ marginRight: '25px' }}>{nft.previewJSX}</div>
          </td>
          <td style={{ textAlign: 'left', verticalAlign: 'middle', borderLeft: '1px solid gray' }}>
            <div style={{ marginLeft: '25px' }}>
              <div style={{ marginBottom: '5px' }}>
                {gameType == 'auction' ? <img src='/icon_auction_outline.svg' width={20} /> : <TicketIcon width='20' />}
              </div>
              <b>{nft.name}</b>{' '}
              <span style={{ fontSize: '12px' }}>
                | {nft.numberOfEditions || 1} edition(s)
                <br />
                start date: {formatDate(game.startDate * 1000, 'MM/dd/yyyy hh:mm aa')}
                <br />
                {game.endDate && `end date: ${formatDate(game.endDate * 1000, 'MM/dd/yyyy hh:mm aa')}`}
                {game.duration && `duration: ${game.duration / (60 * 60)} hours`}
                <br />
                description: {nft.description}
                <br />
                {gameType == 'auction' ? (
                  <>min price: {game.minPrice} ASH</>
                ) : (
                  <>
                    ticket cost: {game.ticketCostTokens} ASH + {game.ticketCostPoints || 0} PIXEL <br />
                    max tickets: {game.maxTickets || 0} total, {game.maxTicketsPerUser || 0} per user
                    <br />
                  </>
                )}
              </span>
            </div>
          </td>
        </tr>
        <tr>
          <td height={15}></td>
        </tr>
      </tbody>
    </table>
  );
}
