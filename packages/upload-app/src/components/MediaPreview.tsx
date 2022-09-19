import { useEffect, useState } from 'react';

interface Props {
  file: File;
  onGeneratePreview?: (s3PathOptimized: string) => void;
}

async function uploadTiffFile(file: File): Promise<string> {
  const formData = new FormData();
  formData.append('file', file);
  const result = await fetch(`https://sage-dev.vercel.app/api/endpoints/tiffUpload/`, {
    method: 'POST',
    body: formData,
  });
  const { s3PathOptimized } = await result.json();
  return s3PathOptimized;
}

export default function MediaPreview({ file, onGeneratePreview }: Props) {
  const [src, setSrc] = useState<string>();
  const LOADING_IMG = '/loading.gif',
    ERROR_IMG = '/error.webp';
  const isVideo: boolean = file?.type == 'video/mp4';
  const isTiff: boolean = file?.type == 'image/tiff';

  useEffect(() => {
    if (isTiff) {
      setSrc(LOADING_IMG);
      uploadTiffFile(file)
        .then((s3PathOptimized) => {
          if (s3PathOptimized) {
            if (onGeneratePreview) {
              console.log(`onGeneratePreview() :: ${s3PathOptimized}`);
              onGeneratePreview(s3PathOptimized);
            }
            setSrc(s3PathOptimized);
          } else {
            setSrc(ERROR_IMG);
          }
        })
        .catch((error) => {
          console.log(error);
          setSrc(ERROR_IMG);
        });
    } else {
      setSrc(URL.createObjectURL(file));
    }
  }, [file]);

  return isVideo ? (
    <video autoPlay muted loop playsInline className='border border-dark rounded' width={150}>
      <source src={src} type='video/mp4'></source>
    </video>
  ) : (
    <img src={src} className='border border-dark rounded' width={150} />
  );
}
