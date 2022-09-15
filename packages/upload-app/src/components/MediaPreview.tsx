interface Props {
  file: File;
}

export default function MediaPreview({ file }: Props) {
  const isVideo = file.name.toLowerCase().endsWith('mp4');
  const src = URL.createObjectURL(file);

  return isVideo ? (
    <video autoPlay muted loop playsInline className='border border-dark rounded' width={150}>
      <source src={src} type='video/mp4'></source>
    </video>
  ) : (
    <img src={src} className='border border-dark rounded' width={150} />
  );
}
