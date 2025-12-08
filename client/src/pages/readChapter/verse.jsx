import React, { useState, useEffect, useRef } from 'react';
import './verse.css';
import { Play, Pause, BookType } from 'lucide-react';
import api from '../../api';

// Global audio instance shared across all Verse components
const globalAudio = new Audio();

function Word({ word, showWordTranslation }) {
  const isEnd = word.char_type_name === "end";

  return (
    <div className="word_container">
      <div className="arabic">
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
      {showWordTranslation &&
        <div className="translation">
          {isEnd
            ? word.translation_en?.replace(/[()]/g, '') || '\u00A0'
            : word.translation_bh || '\u00A0'}
        </div>
      }
    </div>
  );
}

export default function Verse({ verse, headerRef, showWordTranslation, audioEdition }) {
  const [showTefsir, setShowTefsir] = useState(false);
  const [tefsirContent, setTefsirContent] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    document.body.style.overflow = showTefsir ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [showTefsir]);

    useEffect(() => {
    if (isPlaying) {
      globalAudio.pause();
      setIsPlaying(false);
      setProgress(0);
    }
  }, [audioEdition]);

  useEffect(() => {
    const handleEnded = () => {
      if (globalAudio.getAttribute('data-ayah-id') === String(verse.id)) {
        setIsPlaying(false);
        setProgress(0);
      }
    };

    const handlePlay = () => {
      const currentAyahId = globalAudio.getAttribute('data-ayah-id');
      if (currentAyahId === String(verse.id)) {
        setIsPlaying(true);
      } else {
        setIsPlaying(false);
        setProgress(0);
      }
    };

    const handlePause = () => {
      if (globalAudio.getAttribute('data-ayah-id') === String(verse.id)) {
        setIsPlaying(false);
      }
    };

    const handleTimeUpdate = () => {
      if (globalAudio.getAttribute('data-ayah-id') === String(verse.id)) {
        setProgress(globalAudio.currentTime);
        setDuration(globalAudio.duration || 0);
      }
    };

    const handleLoadedMetadata = () => {
      if (globalAudio.getAttribute('data-ayah-id') === String(verse.id)) {
        setDuration(globalAudio.duration);
      }
    };

    globalAudio.addEventListener('ended', handleEnded);
    globalAudio.addEventListener('play', handlePlay);
    globalAudio.addEventListener('pause', handlePause);
    globalAudio.addEventListener('timeupdate', handleTimeUpdate);
    globalAudio.addEventListener('loadedmetadata', handleLoadedMetadata);

    return () => {
      globalAudio.removeEventListener('ended', handleEnded);
      globalAudio.removeEventListener('play', handlePlay);
      globalAudio.removeEventListener('pause', handlePause);
      globalAudio.removeEventListener('timeupdate', handleTimeUpdate);
      globalAudio.removeEventListener('loadedmetadata', handleLoadedMetadata);
    };
  }, [verse.id]);

  const fetchTefsir = async (verse_key) => {
    try {
      const [chapter, ayah] = verse_key.split(':');
      const response = await api.get(`/api/tefsir?chapter=${chapter}&ayah=${ayah}`);
      setTefsirContent(response.data.content || response.data);
      setShowTefsir(true);
    } catch (err) {
      console.error(err);
    }
  };

  const playAyah = (ayahId) => {
    const url = `https://cdn.islamic.network/quran/audio/128/${audioEdition}/${ayahId}.mp3`;
    const currentAyahId = globalAudio.getAttribute('data-ayah-id');

    if (currentAyahId === String(ayahId) && !globalAudio.paused) {
      globalAudio.pause();
    } else {
      globalAudio.pause();
      globalAudio.src = url;
      globalAudio.setAttribute('data-ayah-id', String(ayahId));
      globalAudio.play();
    }
  };

  const handleSliderChange = (e) => {
    const newTime = parseFloat(e.target.value);
    if (globalAudio.getAttribute('data-ayah-id') === String(verse.id)) {
      globalAudio.currentTime = newTime;
      setProgress(newTime);
    }
  };

  const formatTime = (time) => {
    if (!time || isNaN(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="verse_container">
      <div className='verse_words_container'>
        {verse.words.map((word) => (
          <Word key={word.id} word={word} showWordTranslation={showWordTranslation} />
        ))}
      </div>

      <div className='verse_footer'>
        <div className='verse_footer_buttons'>
          <div
            className='verse_tefsir_button'
            onClick={() => { fetchTefsir(verse.verse_key) }}
          >
            <BookType size={24} />
          </div>
          <div
            onClick={() => { playAyah(verse.id) }}
            className='verse_tefsir_button'
          >
            {isPlaying ? <Pause size={20} /> : <Play size={20} />}
          </div>
          <span className='verse_key'>{verse.verse_key}</span>
        </div>

        {isPlaying && (
          <div className='audio_progress_container'>
            <span className='audio_time'>{formatTime(progress)}</span>
            <input
              type="range"
              min="0"
              max={duration || 0}
              value={progress}
              onChange={handleSliderChange}
              className='audio_slider'
              step="0.1"
            />
            <span className='audio_time'>{formatTime(duration)}</span>
          </div>
        )}

        <span className='verse_translation'>{verse.translation}</span>
      </div>

      {showTefsir && (
        <div className="modal_overlay" onClick={() => setShowTefsir(false)}>
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
