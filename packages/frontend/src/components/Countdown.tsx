import useCountdown from '@/hooks/useCountdown';

type Colors = 'purple';

interface Props {
  endTime: number | Date;
  color?: Colors;
}

export default function Countdown({ endTime, color }: Props) {
  const { days, hours, minutes, seconds, total } = useCountdown({ targetDate: endTime });
  return (
    <div className='status__countdown' data-color={color}>
      {days * 24 + hours}h {minutes}m {seconds}s
    </div>
  );
}
