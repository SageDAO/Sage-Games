import { useEffect, useState } from 'react';

interface Props {
  file: File;
  onGeneratePreview?: (s3PathOptimized: string) => void;
  width?: number;
}

export default function MediaPreview({ file, onGeneratePreview, width }: Props) {
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
      if (onGeneratePreview) {
        onGeneratePreview(null);
      }
      setSrc(URL.createObjectURL(file));
    }
  }, [file]);

  return isVideo ? (
    <video autoPlay muted loop playsInline className='border border-dark rounded' width={width || 150}>
      <source src={src} type='video/mp4'></source>
    </video>
  ) : (
    <img src={src} className='border border-dark rounded' width={width || 150} />
  );
}

async function uploadTiffFile(file: File): Promise<string> {
  const formData = new FormData();
  formData.append('file', file);
  const result = await fetch(`https://sage-dev.vercel.app/api/endpoints/tiffUpload/?${new Date().getTime()}`, {
    method: 'POST',
    body: formData,
  });
  const { s3PathOptimized } = await result.json();
  return s3PathOptimized;
}
