export interface MediaFile {
  id: string;
  filename: string;
  originalName: string;
  type: 'image' | 'video';
  size: number;
  timestamp: string;
  thumbnail?: string;
  orientation?: 'vertical' | 'horizontal';
  duration?: number;
  width?: number;
  height?: number;
  dimensions?: { width: number; height: number };
}

export interface Manifest {
  version: string;
  generatedAt: string;
  videos: Record<string, MediaFile[]>;
  pictures: Record<string, MediaFile[]>;
}

export type MediaType = 'pictures' | 'videos';