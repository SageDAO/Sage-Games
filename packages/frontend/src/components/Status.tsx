import Countdown from './Countdown';

// styles/components/_status.scss
type GameStatus = 'Done' | 'Live' | 'Error';

interface ComputeGameStatusArgs {
  endTime: number | Date;
  startTime: number | Date;
  settled: boolean;
}

export function computeGameStatus({
  startTime,
  endTime,
  settled,
}: ComputeGameStatusArgs): GameStatus {
  if (settled) {
    return 'Done';
  }
  if (endTime < Date.now()) {
    return 'Done';
  }
  if (startTime < Date.now()) {
    return 'Live';
  }
  return 'Error';
}

interface Props extends ComputeGameStatusArgs {}

// src/styles/components/_status.scss
export default function Status({ endTime, startTime, settled }: Props) {
  const gameStatus = computeGameStatus({ endTime, startTime, settled });
  return (
    <div className='status'>
      <div className='status__is-live'>
        <div className='status__dot' data-status={gameStatus} />
        <div className='status__text'>{gameStatus}</div>
        <Countdown endTime={endTime}></Countdown>
      </div>
    </div>
  );
}
