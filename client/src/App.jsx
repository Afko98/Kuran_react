import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import './App.css'
import Home from './pages/home/home';
import FullChapter from './pages/readChapter/fullChapter';

function App() {
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);

    const savedArabFont = localStorage.getItem('fontSizeArabic') || '32';
    document.documentElement.style.setProperty('--font-size-arabic', `${savedArabFont}px`);

    const savedTefsirFont = localStorage.getItem('fontSizeTefsir') || '14';
    document.documentElement.style.setProperty('--font-size-tefsir', `${savedTefsirFont}px`);

    const savedVerseTranslationFont = localStorage.getItem('fontSizeVerseTranslation') || '16';
    document.documentElement.style.setProperty('--font-size-verse-translation', `${savedVerseTranslationFont}px`);

    const savedWordTranslationFont = localStorage.getItem('fontSizeWordTranslation') || '12';
    document.documentElement.style.setProperty('--font-size-word-translation', `${savedWordTranslationFont}px`);

    const savedArabFontStyle = localStorage.getItem('fontStyleArabic') || `KFGQPC Uthmanic Script, Scheherazade New, Noto Naskh Arabic, Amiri Quran, serif`;
    document.documentElement.style.setProperty('--font-style-arabic', savedArabFontStyle);
  }, []);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/home" replace/>}/>
        <Route path="/home" element={<Home />} />
        <Route path="chapter/:chapter_id" element={<FullChapter/>}/>
      </Routes>
    </Router>
  )
}

export default App
