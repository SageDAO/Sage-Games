interface Props {
  file: File;
}

export default function MediaPreview({ file }: Props) {
  const isVideo = file.name.toLowerCase().endsWith('mp4');
  const src = URL.createObjectURL(file);

  return (
    <div>
      {isVideo ? (
        <video autoPlay muted loop playsInline className='border border-dark rounded mt-4' width={150}>
          <source src={src} type='video/mp4'></source>
        </video>
      ) : (
        <img src={src} className='border border-dark rounded mt-4' width={150} />
      )}
    </div>
  );
}
