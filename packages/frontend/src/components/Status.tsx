// styles/components/_status.scss
export default function Status() {
  return (
    <div className='status'>
      <div className='status__is-live'>
        <div className='status__dot status__dot--active' />
        <div className='status__text'>Live</div>
      </div>
      <div className='status__countdown'>00h 3m 12s</div>
    </div>
  );
}
