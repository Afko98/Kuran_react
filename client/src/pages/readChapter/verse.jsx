import React, { useState, useEffect } from 'react';
import './verse.css';
import { Play, Pause, BookType, StepForward, Bookmark } from 'lucide-react';
import api from '../../api';

// Global audio instance shared across all Verse components
const globalAudio = new Audio();

function Word({ word, showWordTranslation, pageNumber }) {
  const isEnd = word.char_type_name === "end";

  return (
    <div className="word_container">
      <div className="arabic"
     
      >
          <span  style={{ fontFamily: `QuranPage${pageNumber}` }}>{word.text}</span>

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
export default function Verse({ scrollToVerse, verse, booked, removeVerse, addVerse, showWordTranslation, audioEdition, isAutoplayEnabled, setIsAutoplayEnabled }) {
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
      
      if (isAutoplayEnabled && verse.id < 6236) {
        const nextAyahId = verse.id + 1;
        setTimeout(() => {
          playAyah(nextAyahId);
          // Scroll to next ayah
          scrollToVerse(nextAyahId);
        }, 100);
      }
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
  }, [verse.id, isAutoplayEnabled,scrollToVerse]);

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
    const url = `https://cdn.islamic.network/quran/audio/64/${audioEdition}/${ayahId}.mp3`;
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

  const toggleAutoplay = () => {
    const newAutoplayState = !isAutoplayEnabled;
    setIsAutoplayEnabled(newAutoplayState);
  };
const canPlayOpus = (() => {
  const audio = document.createElement('audio');
  return audio.canPlayType('audio/ogg; codecs=opus') !== '';
})();
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
  const handleBookmarkClick = () => {
    if (booked) {
      removeVerse(verse.verse_key); // already bookmarked → remove
    } else {
      addVerse(verse.verse_key);    // not bookmarked → add
    }
  };
  return (
    <div className="verse_container">
      <div className='verse_words_container'>
        {verse.words.map((word) => (
          <Word pageNumber={verse.page_number} key={word.id} word={word} showWordTranslation={showWordTranslation} />
        ))}
      </div>
      <span className='verse_translation'>{verse.translation}</span>
      <div className='verse_footer'>
        <div className='verse_footer_buttons'>
          <div
            className='verse_tefsir_button'
            onClick={() => { fetchTefsir(verse.verse_key) }}
          >
            <BookType size={20} strokeWidth={1.6}/>
          </div>

          <div
            onClick={() => { playAyah(verse.id) }}
            className='verse_tefsir_button'
          >
            {isPlaying ? <Pause size={18} strokeWidth={1.6}/> : <Play size={18} strokeWidth={1.6}/>}
          </div>
                    <div
            onClick={toggleAutoplay}
            className={`verse_tefsir_button ${isAutoplayEnabled ? 'autoplay_active' : ''}`}
            title="Autoplay consecutive ayahs"
          >
            <StepForward size={18} strokeWidth={1.5}/>
          </div>
                    <div
            className='verse_tefsir_button'
            onClick={handleBookmarkClick}
          >
            <Bookmark color={booked ? 'var(--color-bookmark)' : 'currentColor'} opacity={booked ? 1 : 0.4} size={20} strokeWidth={booked ? 2.6 : 1.6} />
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
