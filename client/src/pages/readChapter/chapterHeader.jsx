import React, { useState, useEffect } from 'react';
import './chapterHeader.css'
import { TextAlignJustify , Settings, BookType } from 'lucide-react';
import { useNavigate, useParams } from "react-router-dom";
import UserSettings from '../../userSettings';

export default function ChapterHeader({ headerRef, chapter, onNavigate, showWordTranslation, setShowWordTranslation, audioEdition, setAudioEdition,textStyleArabic, setTextStyleArabic }) {
  const [selectorType, setSelectorType] = useState('page');
  const [showDropdown, setShowDropdown] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

const navigate = useNavigate();

  // Disable main page scroll when popup is open

  const { verse_id, page_id } = useParams();

useEffect(() => {
  const timer = setTimeout(() => {
    if (page_id)
      onNavigate('page', page_id);
    else if (verse_id)
      onNavigate('ayet', verse_id);
  }, 200); // delay in milliseconds, e.g., 300ms

  return () => clearTimeout(timer); // cleanup if component unmounts
}, [page_id, verse_id, onNavigate]);
  const getOptions = () => {
    if (!chapter) return [];

    if (selectorType === 'page') {
      const pages = [...new Set(chapter.verses.map(v => v.page_number))];
      return pages.sort((a, b) => a - b);
    } else if (selectorType === 'ayet') {
      return chapter.verses.map(v => v.verse_number);
    }
    return [];
  };

  const handleSelect = (value) => {
    onNavigate(selectorType, value);
    setShowDropdown(false);
  };

  const options = getOptions();

  return (<>
    {
      showSettings && 
      <UserSettings 
        showSettings={showSettings} 
        setShowSettings={setShowSettings} 
        showWordTranslation={showWordTranslation}
        setShowWordTranslation={setShowWordTranslation}
        audioEdition={audioEdition}
        setAudioEdition={setAudioEdition}
        textStyleArabic={textStyleArabic}
        setTextStyleArabic={setTextStyleArabic}
      />
    }
    <header ref={headerRef} className="chapter_header">
      
        <div className="header_content_options">
          <TextAlignJustify  className='header_icon_border padding_2_4' size={'30'} style={{cursor:'pointer'}} onClick={() => navigate(`/`)}/>
                    <div className="header_content">
          <h1>{chapter ? (chapter.chapter_id + '. ' + chapter.name_simple) : 'Loading...'}</h1>
          
          {chapter && (
            <div className="navigation_selector setting-group">
              <select
                value={selectorType}
                onChange={(e) => {
                  setSelectorType(e.target.value);
                  setShowDropdown(false);
                }}
                className="selector_type"
              >
                <option value="page">Stranica</option>
                <option value="ayet">Ajet</option>
              </select>

              <div className="selector_dropdown">
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="btn"
                >
                  {"Izaberi"}
                </button>

                {showDropdown && (
                  <div className="select selector_options">
                    {options.map(option => (
                      <div
                        key={option}
                        onClick={() => handleSelect(option)}
                        className="selector_option"
                      >
                        {option}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
          
        </div>
          <Settings className='header_icon_border padding_2_4' size={'30'} style={{cursor:'pointer'}} onClick={() => setShowSettings(true)}/>
        </div>

        <div className='h_line'></div>
    </header>
    </>
  );
  
}
