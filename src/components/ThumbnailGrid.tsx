import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMediaFiles } from '../hooks/useMediaFiles';
import type { MediaFile } from '../utils/types';
import './ThumbnailGrid.css';

interface ThumbnailGridProps {
  mediaFiles: MediaFile[];
  type: 'pictures' | 'videos';
}

export function ThumbnailGrid({ mediaFiles, type }: ThumbnailGridProps) {
  const navigate = useNavigate();
  const { decodeThumbnail } = useMediaFiles();
  const [thumbnails, setThumbnails] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState<Record<string, boolean>>({});

  const handleThumbnailLoad = async (mediaFile: MediaFile) => {
    if (thumbnails[mediaFile.id] || loading[mediaFile.id]) return;

    setLoading(prev => ({ ...prev, [mediaFile.id]: true }));

    try {
      const url = await decodeThumbnail(mediaFile);
      setThumbnails(prev => ({ ...prev, [mediaFile.id]: url }));
    } catch (err) {
      console.error('Failed to load thumbnail:', err);
    } finally {
      setLoading(prev => ({ ...prev, [mediaFile.id]: false }));
    }
  };

  const handleClick = (fileId: string) => {
    navigate(`#/file/${fileId}`);
  };

  return (
    <div className="thumbnail-grid">
      {mediaFiles.map((mediaFile) => (
        <div
          key={mediaFile.id}
          className="thumbnail-item"
          onClick={() => handleClick(mediaFile.id)}
          onMouseEnter={() => handleThumbnailLoad(mediaFile)}
        >
          <div className="thumbnail-item__content">
            {loading[mediaFile.id] ? (
              <div className="thumbnail-item__loading" />
            ) : thumbnails[mediaFile.id] ? (
              <img
                src={thumbnails[mediaFile.id]}
                alt={mediaFile.originalName}
                className="thumbnail-item__image"
              />
            ) : (
              <div className="thumbnail-item__placeholder">
                {type === 'videos' ? '🎬' : '🖼️'}
              </div>
            )}
            
            {type === 'videos' && mediaFile.duration && (
              <div className="thumbnail-item__duration">
                {formatDuration(mediaFile.duration)}
              </div>
            )}
          </div>
          
          <div className="thumbnail-item__info">
            <span className="thumbnail-item__name">{mediaFile.originalName}</span>
            <span className="thumbnail-item__size">{formatSize(mediaFile.size)}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}