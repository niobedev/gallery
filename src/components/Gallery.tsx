import { useMediaFiles } from '../hooks/useMediaFiles';
import { MonthSection } from './MonthSection';
import './Gallery.css';

export function Gallery() {
  const {
    currentType,
    setCurrentType,
    getMonths,
    getFilesByMonth,
    loading,
    error,
    reload
  } = useMediaFiles();

  const months = getMonths(currentType);

  const handleTypeChange = (type: 'pictures' | 'videos') => {
    setCurrentType(type);
  };

  if (loading) {
    return (
      <div className="gallery gallery--loading">
        <div className="gallery__spinner" />
        <p>Loading gallery...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="gallery gallery--error">
        <p>{error}</p>
        <button onClick={reload} className="gallery__button">
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="gallery">
      <div className="gallery__header">
        <h1 className="gallery__title">Gallery</h1>

        <div className="gallery__tabs">
          <button
            className={`gallery__tab ${currentType === 'pictures' ? 'gallery__tab--active' : ''}`}
            onClick={() => handleTypeChange('pictures')}
          >
            Pictures
          </button>
          <button
            className={`gallery__tab ${currentType === 'videos' ? 'gallery__tab--active' : ''}`}
            onClick={() => handleTypeChange('videos')}
          >
            Videos
          </button>
        </div>
      </div>

      <div className="gallery__content">
        {months.length === 0 ? (
          <div className="gallery gallery--empty">
            <p className="gallery__empty-icon">
              {currentType === 'videos' ? '🎬' : '🖼️'}
            </p>
            <p className="gallery__empty-text">
              No {currentType === 'videos' ? 'videos' : 'pictures'} yet
            </p>
            <p className="gallery__empty-hint">
              Add files using the encoding scripts
            </p>
          </div>
        ) : (
          months.map((month) => (
            <MonthSection
              key={month}
              month={month}
              mediaFiles={getFilesByMonth(currentType, month)}
              type={currentType}
            />
          ))
        )}
      </div>
    </div>
  );
}