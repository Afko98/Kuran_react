import React, { useState, useEffect } from 'react';
import './verse.css';
import { BookType } from 'lucide-react';
import api from '../../api'; // ← assuming you already have this

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

      <div className="translation">
        {isEnd
          ? word.translation_en?.replace(/[()]/g, '') || '\u00A0'
          : word.translation_bh || '\u00A0'}
      </div>
    </div>
  );
}

export default function Verse({ verse, headerRef }) {
  const [showTefsir, setShowTefsir] = useState(false);
  const [tefsirContent, setTefsirContent] = useState('');

  useEffect(() => {
    document.body.style.overflow = showTefsir ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [showTefsir]);

  const fetchTefsir = async (verse_key) => {
    try {
      const [chapter, ayah] = verse_key.split(':');
      const response = await api.get(`/api/tefsir?chapter=${chapter}&ayah=${ayah}`);
      setTefsirContent(response.data.content || response.data); // supports both structures
      setShowTefsir(true);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="verse_container">
      <div className='verse_words_container'>
        {verse.words.map((word) => (
          <Word key={word.id} word={word} />
        ))}
      </div>

      <div className='verse_footer'>
        <div className='verse_footer_buttons'>
        <div
          className='verse_tefsir_button'
          onClick={() => {headerRef.current.style.transform = 'translateY(-100%)'; fetchTefsir(verse.verse_key)}}
        >
          <BookType size={24} />
          
        </div>
        <span className='verse_key'>{verse.verse_key}</span>
        </div>
        <span className='verse_translation'>{verse.translation}</span>
      </div>

      {showTefsir && (
        <div className="tefsir_modal_overlay" onClick={() => setShowTefsir(false)}>
          <div
            className="tefsir_modal_content"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="tefsir_modal_header">
              <button className="tefsir_modal_close" onClick={() => setShowTefsir(false)}>×</button>
            </div>
            <div
              className="tefsir_text"
              dangerouslySetInnerHTML={{ __html: tefsirContent }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
