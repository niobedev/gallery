import { useState } from 'react';
import { ThumbnailGrid } from './ThumbnailGrid';
import type { MediaFile } from '../utils/types';
import './MonthSection.css';

interface MonthSectionProps {
  month: string;
  mediaFiles: MediaFile[];
  type: 'pictures' | 'videos';
}

export function MonthSection({ month, mediaFiles, type }: MonthSectionProps) {
  const [expanded, setExpanded] = useState(true);

  const formatDate = (monthStr: string): string => {
    const [year, monthNum] = monthStr.split('-');
    const date = new Date(parseInt(year), parseInt(monthNum) - 1);
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  const count = mediaFiles.length;

  return (
    <div className="month-section">
      <button
        className="month-section__header"
        onClick={() => setExpanded(!expanded)}
      >
        <span className="month-section__title">{formatDate(month)}</span>
        <span className="month-section__count">{count} {type === 'videos' ? 'video' : 'photo'}{count !== 1 ? 's' : ''}</span>
        <span className={`month-section__toggle ${expanded ? 'month-section__toggle--expanded' : ''}`}>
          ▼
        </span>
      </button>
      
      {expanded && (
        <div className="month-section__content">
          <ThumbnailGrid mediaFiles={mediaFiles} type={type} />
        </div>
      )}
    </div>
  );
}