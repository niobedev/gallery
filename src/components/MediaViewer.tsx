import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useMediaFiles } from '../hooks/useMediaFiles';
import { ImageDisplay } from './ImageDisplay';
import { VideoPlayer } from './VideoPlayer';
import './MediaViewer.css';

export function MediaViewer() {
  const { fileId } = useParams<{ fileId: string }>();
  const navigate = useNavigate();
  const { getFileById, decodeMediaFile, getShareableUrl, loading: manifestLoading } = useMediaFiles();
  const [blobUrl, setBlobUrl] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const mediaFile = fileId ? getFileById(fileId) : null;

  useEffect(() => {
    const loadMedia = async () => {
      if (manifestLoading) {
        return;
      }

      if (!mediaFile) {
        setError('Media file not found');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const url = await decodeMediaFile(mediaFile);
        setBlobUrl(url);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load media');
      } finally {
        setLoading(false);
      }
    };

    loadMedia();
  }, [mediaFile, decodeMediaFile, manifestLoading]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        navigate('/');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [navigate]);

  const handleDownload = async () => {
    if (!blobUrl || !mediaFile) return;

    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = mediaFile.originalName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleShare = async () => {
    if (!fileId) return;

    try {
      const url = getShareableUrl(fileId);
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy URL:', err);
    }
  };

  const handleClose = () => {
    navigate('/');
  };

  if (loading || manifestLoading) {
    return (
      <div className="media-viewer media-viewer--loading">
        <div className="media-viewer__spinner" />
      </div>
    );
  }

  if (error || !mediaFile) {
    return (
      <div className="media-viewer">
        <div className="media-viewer__error">
          <p>{error || 'Media file not found'}</p>
          <button onClick={handleClose} className="media-viewer__button">
            Back to Gallery
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="media-viewer">
      <div className="media-viewer__toolbar">
        <button onClick={handleClose} className="media-viewer__button">
          ✕ Close
        </button>
        <div className="media-viewer__info">
          <span className="media-viewer__filename">{mediaFile.originalName}</span>
        </div>
        <div className="media-viewer__actions">
          <button onClick={handleShare} className="media-viewer__button">
            {copied ? '✓ Copied!' : '🔗 Share'}
          </button>
          <button onClick={handleDownload} className="media-viewer__button">
            ⬇ Download
          </button>
        </div>
      </div>
      
      <div className="media-viewer__content">
        {mediaFile.type === 'video' ? (
          <VideoPlayer blobUrl={blobUrl} orientation={mediaFile.orientation} />
        ) : (
          <ImageDisplay blobUrl={blobUrl} alt={mediaFile.originalName} />
        )}
      </div>
    </div>
  );
}