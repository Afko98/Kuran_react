import { useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';

import './App.css'
import Home from './pages/home/home';
import FullChapter from './pages/readChapter/fullChapter';
import FullPageMushaf from './pages/readPage/fullPageMushaf';

function AppContent() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Push a dummy state to history when navigating away from home
    if (location.pathname !== '/home') {
      window.history.pushState(null, '', window.location.href);
    }

    const handlePopState = () => {
      // Always navigate to home when back button is pressed
      if (location.pathname !== '/home') {
        navigate('/home', { replace: true });
      }
    };

    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [location.pathname, navigate]);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);

    const savedArabFont = localStorage.getItem('fontSizeArabic') || '36';
    document.documentElement.style.setProperty('--font-size-arabic', `${savedArabFont}px`);

    const savedTefsirFont = localStorage.getItem('fontSizeTefsir') || '14';
    document.documentElement.style.setProperty('--font-size-tefsir', `${savedTefsirFont}px`);

    const savedVerseTranslationFont = localStorage.getItem('fontSizeVerseTranslation') || '14';
    document.documentElement.style.setProperty('--font-size-verse-translation', `${savedVerseTranslationFont}px`);

    const savedWordTranslationFont = localStorage.getItem('fontSizeWordTranslation') || '12';
    document.documentElement.style.setProperty('--font-size-word-translation', `${savedWordTranslationFont}px`);

    const savedArabFontStyle = localStorage.getItem('fontStyleArabic3') || `Scheherazade New`;
    document.documentElement.style.setProperty('--font-style-arabic', savedArabFontStyle);

    const savedAudioEdition = localStorage.getItem('audioEdition') || `ar.alafasy`;
    document.documentElement.style.setProperty('--audio-edition', savedAudioEdition);
  }, []);

  return (
    <Routes>
      <Route path="/" element={<Navigate to="/home" replace/>}/>
      <Route path="/home" element={<Home />} />
      <Route path="chapter/:chapter_id" element={<FullChapter/>}/>
      <Route path="chapter/:chapter_id/page/:page_id" element={<FullChapter/>}/>
      <Route path="chapter/:chapter_id/verse/:verse_id" element={<FullChapter/>}/>
      <Route path="page/:page_id" element={<FullPageMushaf/>}/>
    </Routes>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  )
}

export default App