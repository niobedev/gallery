import { useRef } from 'react';
import './ImageDisplay.css';

interface ImageDisplayProps {
  blobUrl: string;
  alt?: string;
}

export function ImageDisplay({ blobUrl, alt }: ImageDisplayProps) {
  const imgRef = useRef<HTMLImageElement>(null);

  return (
    <img
      ref={imgRef}
      src={blobUrl}
      alt={alt}
      className="image-display"
    />
  );
}