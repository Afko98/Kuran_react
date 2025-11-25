import React from 'react'
import './verse.css'

function Word({ word }) {
  const isEnd = word.char_type_name === "end";

  return (
    <div className="word_container">
      <div className="font_arabic_XL arabic">
        {isEnd ? (
          <div className="flower_wrapper">
            <svg className="verse_chapter_badge" viewBox="0 0 100 100">
              <circle cx="50" cy="25" r="15" />
              <circle cx="70" cy="50" r="15" />
              <circle cx="50" cy="75" r="15" />
              <circle cx="30" cy="50" r="15" />
              <circle cx="65" cy="35" r="12" />
              <circle cx="65" cy="65" r="12" />
              <circle cx="35" cy="65" r="12" />
              <circle cx="35" cy="35" r="12" />
              <circle cx="50" cy="50" r="20" />
            </svg>
            <span className="flower_text">{word.text_uthmani}</span>
          </div>
        ) : (
          word.text_uthmani
        )}
      </div>

      <div className="translation">  {word.char_type_name === "end"
    ? word.translation_en.replace(/[()]/g, '') || '\u00A0'
    : word.translation_bh || '\u00A0'}</div>
    </div>
  );
}


export default function Verse({ verse }) {
  return (
    <div className="verse_container">

      <div className='verse_words_container'>
        {verse.words.map((word) => (
        <Word key={word.id} word={word} />
      ))}
      </div>
      <div className='verse_footer'>
        <span className='verse_translation'>{verse.translation}</span>
      </div>
      
    </div>
  );
}