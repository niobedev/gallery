import { useState, useEffect } from 'react';
import type { MediaFile, Manifest, MediaType } from '../utils/types';

export function useMediaFiles() {
  const [manifest, setManifest] = useState<Manifest | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentType, setCurrentType] = useState<MediaType>('pictures');
  const [decodedCache, setDecodedCache] = useState<Map<string, string>>(new Map());

  useEffect(() => {
    loadManifest();
  }, []);

  const loadManifest = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/manifest.json');
      
      if (!response.ok) {
        throw new Error('Failed to load manifest');
      }
      
      const data = await response.json();
      setManifest(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load manifest');
    } finally {
      setLoading(false);
    }
  };

  const getMediaFiles = (type: MediaType): Record<string, MediaFile[]> => {
    if (!manifest) return {};
    return type === 'pictures' ? manifest.pictures : manifest.videos;
  };

  const getMonths = (type: MediaType): string[] => {
    const files = getMediaFiles(type);
    return Object.keys(files).sort().reverse();
  };

  const getFilesByMonth = (type: MediaType, month: string): MediaFile[] => {
    const files = getMediaFiles(type);
    return files[month] || [];
  };

  const getFileById = (fileId: string): MediaFile | null => {
    if (!manifest) return null;
    
    const allFiles = [
      ...Object.values(manifest.pictures).flat(),
      ...Object.values(manifest.videos).flat()
    ];
    
    return allFiles.find(f => f.id === fileId) || null;
  };

  const getFileType = (fileId: string): MediaType | null => {
    const file = getFileById(fileId);
    if (!file) return null;
    return file.type === 'video' ? 'videos' : 'pictures';
  };

  const getMonthForFile = (fileId: string): string | null => {
    if (!manifest) return null;
    
    for (const [month, files] of Object.entries(manifest.pictures)) {
      if (files.find(f => f.id === fileId)) return month;
    }
    
    for (const [month, files] of Object.entries(manifest.videos)) {
      if (files.find(f => f.id === fileId)) return month;
    }
    
    return null;
  };

  const decodeMediaFile = async (mediaFile: MediaFile): Promise<string> => {
    const cacheKey = mediaFile.filename;
    
    if (decodedCache.has(cacheKey)) {
      return decodedCache.get(cacheKey)!;
    }
    
    const type = mediaFile.type === 'video' ? 'videos' : 'pictures';
    const { decodeFile } = await import('../utils/decoder');
    const blob = await decodeFile(mediaFile.filename, type);
    const url = URL.createObjectURL(blob);
    
    setDecodedCache(prev => new Map(prev).set(cacheKey, url));
    
    return url;
  };

  const decodeThumbnail = async (mediaFile: MediaFile): Promise<string> => {
    const { getThumbnailPath } = await import('../utils/thumbnailGenerator');
    const thumbnailFilename = getThumbnailPath(mediaFile);
    
    if (!thumbnailFilename) {
      return '';
    }
    
    const cacheKey = `thumb_${thumbnailFilename}`;
    
    if (decodedCache.has(cacheKey)) {
      return decodedCache.get(cacheKey)!;
    }
    
    const type = mediaFile.type === 'video' ? 'videos' : 'pictures';
    const { decodeFile } = await import('../utils/decoder');
    const blob = await decodeFile(thumbnailFilename, type);
    const url = URL.createObjectURL(blob);
    
    setDecodedCache(prev => new Map(prev).set(cacheKey, url));
    
    return url;
  };

  const getShareableUrl = (fileId: string): string => {
    return `${window.location.origin}${window.location.pathname}#/file/${fileId}`;
  };

  return {
    manifest,
    loading,
    error,
    currentType,
    setCurrentType,
    getMediaFiles,
    getMonths,
    getFilesByMonth,
    getFileById,
    getFileType,
    getMonthForFile,
    decodeMediaFile,
    decodeThumbnail,
    getShareableUrl,
    reload: loadManifest
  };
}