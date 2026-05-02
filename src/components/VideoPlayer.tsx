import { useRef } from 'react';
import './VideoPlayer.css';

interface VideoPlayerProps {
  blobUrl: string;
  orientation?: 'vertical' | 'horizontal';
}

export function VideoPlayer({ blobUrl, orientation = 'horizontal' }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  return (
    <video
      ref={videoRef}
      src={blobUrl}
      controls
      className={`video-player video-player--${orientation}`}
    />
  );
}