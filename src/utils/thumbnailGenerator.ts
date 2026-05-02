import type { MediaFile } from './types';

export function getThumbnailPath(mediaFile: MediaFile): string | null {
  if (mediaFile.type === 'image') {
    return mediaFile.filename;
  }
  
  if (mediaFile.type === 'video' && mediaFile.thumbnail) {
    return mediaFile.thumbnail;
  }
  
  return null;
}