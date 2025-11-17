import React, { useState, useEffect } from 'react';
import { Book, X, Moon, Sun } from 'lucide-react';
import './App.css';

const QuranReader = () => {
  const [chapters, setChapters] = useState([]);
  const [roots, setRoots] = useState({});
  const [addons, setAddons] = useState({});
  const [selectedChapter, setSelectedChapter] = useState(1);
  const [selectedWord, setSelectedWord] = useState(null);
  const [language, setLanguage] = useState('bh');
  const [theme, setTheme] = useState('light');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
         const chaptersData = await fetch('/chapters.json').then(r => r.json());
     setChapters(chaptersData.chapters);
     const rootsData = await fetch('/roots.json').then(r => r.json());
     setRoots(rootsData.roots);
     setAddons(rootsData.addons);
  };

  const handleWordClick = (word, verseKey) => {
    if (word.char_type_name === 'end') return;
    
    setSelectedWord({
      ...word,
      verseKey,
      rootData: word.root ? roots[word.root] : null,
      addonData: word.addons?.map(addon => addons[addon]).filter(Boolean) || []
    });
  };

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const currentChapter = chapters.find(ch => ch.chapter_id === selectedChapter);

  return (
    <div className="app">
      <div className="container">
        {/* File Upload Section */}

        <Header 
          language={language}
          setLanguage={setLanguage}
          theme={theme}
          toggleTheme={toggleTheme}
        />

        <ChapterSelector
          chapters={chapters}
          selectedChapter={selectedChapter}
          setSelectedChapter={setSelectedChapter}
        />

        <div className="content-grid">
          <VersesDisplay
            currentChapter={currentChapter}
            handleWordClick={handleWordClick}
          />

          <WordDetailsPanel
            selectedWord={selectedWord}
            language={language}
            onClose={() => setSelectedWord(null)}
          />
        </div>

      </div>
    </div>
  );
};

const Header = ({ language, setLanguage, theme, toggleTheme }) => (
  <div className="header">
    <div className="header-content">
      <div className="header-title">
        <Book className="icon-large" />
        <h1>القرآن الكريم</h1>
      </div>
      
      <div className="header-controls">
        <button
          onClick={toggleTheme}
          className="btn-icon"
          aria-label="Toggle theme"
        >
          {theme === 'light' ? <Moon className="icon" /> : <Sun className="icon" />}
        </button>

        <div className="language-toggle">
          <button
            onClick={() => setLanguage('bh')}
            className={`btn ${language === 'bh' ? 'btn-active' : 'btn-secondary'}`}
          >
            Bosanski
          </button>
          <button
            onClick={() => setLanguage('en')}
            className={`btn ${language === 'en' ? 'btn-active' : 'btn-secondary'}`}
          >
            English
          </button>
        </div>
      </div>
    </div>
  </div>
);

const ChapterSelector = ({ chapters, selectedChapter, setSelectedChapter }) => (
  <div className="chapter-selector">
    <label className="label">Surah:</label>
    <select
      value={selectedChapter}
      onChange={(e) => setSelectedChapter(Number(e.target.value))}
      className="select"
    >
      {chapters.map(ch => (
        <option key={ch.chapter_id} value={ch.chapter_id}>
          {ch.chapter_id}. {ch.name_simple} - {ch.name_arabic}
        </option>
      ))}
    </select>
  </div>
);

const VersesDisplay = ({ currentChapter, handleWordClick }) => (
  <div className="verses-panel">
    {console.log(currentChapter)}
    {currentChapter ? (
      <div>
        <h2 className="chapter-title">{currentChapter.name_arabic}</h2>
        
        {currentChapter.verses?.map(verse => (
          <Verse 
            key={verse.verse_key}
            verse={verse}
            onWordClick={handleWordClick}
          />
        ))}
      </div>
    ) : (
      <div className="empty-state">Please load Quran data</div>
    )}
  </div>
);

const Verse = ({ verse, onWordClick }) => {

  
  return (
    <div className="verse">
      <div className="verse-arabic" dir="rtl">
        {verse.words?.map((word, idx) => {
          if (word.char_type_name === 'end') {
            return (
              <span key={idx} className="verse-number">
                {word.text}
              </span>
            );
          }
          
          // Find translation from roots
          let wordTranslationBh = word.translation_bh;
          if (!wordTranslationBh && word.root) {
    const rootData = word.root;
    const rootWords = rootData.words || [];  // fallback to empty array
    const matchingWord = rootWords.find(
        w => w.text === word.text_imlaei || w.text === word.text
    );
    if (matchingWord) {
        wordTranslationBh = matchingWord.translation_bh;
    }
}
          return (
            <span key={idx} className="word-container">
              <span
                onClick={() => onWordClick(word, verse.verse_key)}
                className="word"
              >
                {word.text_uthmani || word.text}
              </span>
              {wordTranslationBh && (
                <span className="word-translation-inline">
                  {wordTranslationBh}
                </span>
              )}
            </span>
          );
        })}
      </div>

      <div className="verse-translation">
        {verse.translations?.[0]?.text || 'No translation available'}
      </div>
    </div>
  );
};

const WordDetailsPanel = ({ selectedWord, language, onClose }) => (
  <div className="details-panel">
    {selectedWord ? (
      <div>
        <div className="details-header">
          <h3 className="details-title">Word Details</h3>
          <button onClick={onClose} className="btn-icon" aria-label="Close">
            <X className="icon" />
          </button>
        </div>

        <div className="word-display">
          <div className="word-arabic" dir="rtl">
            {selectedWord.text_uthmani || selectedWord.text}
          </div>
          <div className="word-transliteration">
            {selectedWord.transliteration?.text}
          </div>
          <div className="word-translation">
            {language === 'bh' ? selectedWord.translation_bh : selectedWord.translation_en}
          </div>
        </div>

        {selectedWord.root && (
          <DetailSection title="Root (الجذر)" className="detail-root">
            <div className="detail-arabic" dir="rtl">{selectedWord.root}</div>
            {selectedWord.rootData && (
              <div className="detail-text">
                {language === 'bh' 
                  ? selectedWord.rootData.translation_bh 
                  : selectedWord.rootData.translation_en}
              </div>
            )}
          </DetailSection>
        )}

        {selectedWord.lemma && (
          <DetailSection title="Lemma (اللمة)" className="detail-lemma">
            <div className="detail-arabic" dir="rtl">{selectedWord.lemma}</div>
          </DetailSection>
        )}

        {selectedWord.addons?.length > 0 && (
          <DetailSection title="Prefixes/Suffixes" className="detail-addons">
            <div className="addons-list">
              {selectedWord.addons.map((addon, idx) => (
                <span key={idx} className="addon-tag" dir="rtl">{addon}</span>
              ))}
            </div>
          </DetailSection>
        )}

        {selectedWord.rootData?.words && (
          <DetailSection title="Related Words from Same Root" className="detail-related">
            <div className="related-words">
              {selectedWord.rootData.words.slice(0, 10).map((relWord, idx) => (
                <div key={idx} className="related-word">
                  <div className="related-word-arabic" dir="rtl">{relWord.text}</div>
                  <div className="related-word-translation">
                    {language === 'bh' ? relWord.translation_bh : relWord.translation_en}
                  </div>
                  <div className="related-word-count">
                    Used {relWord.occurrences.length} times
                  </div>
                </div>
              ))}
            </div>
          </DetailSection>
        )}

        {selectedWord.part_of_speech && (
          <div className="detail-pos">
            <span className="detail-pos-label">Part of Speech:</span> {selectedWord.part_of_speech}
          </div>
        )}
      </div>
    ) : (
      <div className="empty-state">Click on any word to see details</div>
    )}
  </div>
);

const DetailSection = ({ title, children, className }) => (
  <div className={`detail-section ${className}`}>
    <div className="detail-section-title">{title}</div>
    {children}
  </div>
);

export default QuranReader;
