import React, { useState } from 'react';
import './chapterHeader.css'

export default function ChapterHeader({ headerRef, chapter, onNavigate }) {
  const [selectorType, setSelectorType] = useState('page');
  const [showDropdown, setShowDropdown] = useState(false);

  const getOptions = () => {
    if (!chapter) return [];

    if (selectorType === 'page') {
      const pages = [...new Set(chapter.verses.map(v => v.page_number))];
      return pages.sort((a, b) => a - b);
    } else if (selectorType === 'juz') {
      const juzs = [...new Set(chapter.verses.map(v => v.juz_number))];
      return juzs.sort((a, b) => a - b);
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
  const label = selectorType === 'page' ? 'Stranica' : selectorType === 'juz' ? 'Džuz' : 'Ajet';

  return (
    <header ref={headerRef} className="chapter_header">
        <div className="header_content">

        </div>
        <div className='h_line'></div>
      <div className="header_content">
        <h1>{chapter ? (chapter.chapter_id + '. ' + chapter.name_simple) : 'Loading...'}</h1>
        
        {chapter && (
          <div className="navigation_selector">
            <select
              value={selectorType}
              onChange={(e) => {
                setSelectorType(e.target.value);
                setShowDropdown(false);
              }}
              className="selector_type"
            >
              <option value="page">Stranica</option>
              <option value="juz">Džuz</option>
              <option value="ayet">Ajet</option>
            </select>

            <div className="selector_dropdown">
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="selector_button"
              >
                {`Izaberi ${label.toLowerCase()}`}
              </button>

              {showDropdown && (
                <div className="selector_options">
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
      
    </header>
  );
}