import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Gallery } from './components/Gallery';
import { MediaViewer } from './components/MediaViewer';
import './App.css';

function App() {
  return (
    <HashRouter>
      <div className="app">
        <Routes>
          <Route path="/" element={<Gallery />} />
          <Route path="/file/:fileId" element={<MediaViewer />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </HashRouter>
  );
}

export default App;