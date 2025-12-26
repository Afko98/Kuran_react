import React from 'react';
import './versePage.css';

function Word({ word, style, className }) {
  return (
    <span
      className={`arabic_page ${className ? className : ''}`}
      style={{ ...style }}
    >
      {word}
    </span>
  );
}


export default function VersePage({ verse, pageNumber}) {
  const containerStyle = {
    fontFamily: `QuranPage${pageNumber}`,
    direction: 'rtl'
  };

  const renderWords = (line) =>
    line.words.map((word, index) => {
      let wordStyle = {};

    if (pageNumber === '1' || pageNumber === '2') {
      wordStyle.fontSize = '9vw'; // bigger font for pages 1 and 2
    }
      if (line.bismillah) {
        wordStyle.fontFamily = 'Bismillah';
        wordStyle.lineHeight = '1';
        wordStyle.fontSize = '11vw'; 
      } else if (line.surah_name) {
        wordStyle.fontFamily = 'SurahNames';
        wordStyle.lineHeight = '1';
        wordStyle.marginTop = '12px'
        wordStyle.fontSize = '11vw'; 
        if (word === 'surah' + String(113)) {
          wordStyle.padding = '8px';
        }
      }
{console.log(verse);}
      return <Word key={`${line.line_number}-${index}`} word={word} style={wordStyle} className={(line.surah_name || line.bismillah) ? 'surah_name' : ''} />;
    });

  // Render mode

    // --- Mode 1-2: Each line separately ---
    return (
      <div className="verse_page_container" style={containerStyle}>
        {verse?.map((line) => (
          <div key={line.line_number} className="line">
            {renderWords(line)}
          </div>
        ))}
      </div>
    );
  
}