import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Pause, Play, X } from 'lucide-react';
import './versePage.css';

// Global audio instance shared across all Word components
const globalAudio = new Audio();

function Word({ word, style, className, setSelectedVerse, selectedVerse, audioEdition = 'ar.alafasy' }) {
  const [isFlashing, setIsFlashing] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showControls, setShowControls] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);

  useEffect(() => {
    const handlePlay = () => {
      const currentVerseId = globalAudio.getAttribute('data-verse-id');
      if (currentVerseId === String(word.verse_id)) {
        setIsPlaying(true);
        setShowControls(true);
      } else {
        setIsPlaying(false);
        setShowControls(false);
      }
    };

    const handlePause = () => {
      if (globalAudio.getAttribute('data-verse-id') === String(word.verse_id)) {
        setIsPlaying(false);
      }
    };

    const handleEnded = () => {
      if (globalAudio.getAttribute('data-verse-id') === String(word.verse_id)) {
        setIsPlaying(false);
        setProgress(0);
        setShowControls(false);
      }
    };

    const handleTimeUpdate = () => {
      if (globalAudio.getAttribute('data-verse-id') === String(word.verse_id)) {
        setProgress(globalAudio.currentTime);
        setDuration(globalAudio.duration || 0);
      }
    };

    const handleLoadedMetadata = () => {
      if (globalAudio.getAttribute('data-verse-id') === String(word.verse_id)) {
        setDuration(globalAudio.duration);
      }
    };

    globalAudio.addEventListener('play', handlePlay);
    globalAudio.addEventListener('pause', handlePause);
    globalAudio.addEventListener('ended', handleEnded);
    globalAudio.addEventListener('timeupdate', handleTimeUpdate);
    globalAudio.addEventListener('loadedmetadata', handleLoadedMetadata);

    return () => {
      globalAudio.removeEventListener('play', handlePlay);
      globalAudio.removeEventListener('pause', handlePause);
      globalAudio.removeEventListener('ended', handleEnded);
      globalAudio.removeEventListener('timeupdate', handleTimeUpdate);
      globalAudio.removeEventListener('loadedmetadata', handleLoadedMetadata);
    };
  }, [word.verse_id]);

  const playAyah = (verseId) => {
    const url = `https://cdn.islamic.network/quran/audio/64/${audioEdition}/${verseId}.mp3`;
    const currentVerseId = globalAudio.getAttribute('data-verse-id');

    if (currentVerseId === String(verseId) && !globalAudio.paused) {
      globalAudio.pause();
    } else {
      globalAudio.pause();
      globalAudio.src = url;
      globalAudio.setAttribute('data-verse-id', String(verseId));
      globalAudio.playbackRate = playbackRate;
      globalAudio.play();
    }
  };

  const handlePlayPauseClick = (e) => {
    e.stopPropagation();
    if (isPlaying) {
      globalAudio.pause();
    } else {
      globalAudio.play();
    }
  };

  const handleCloseClick = (e) => {
    e.stopPropagation();
    globalAudio.pause();
    setIsPlaying(false);
    setShowControls(false);
    setProgress(0);
  };

  const handleSliderChange = (e) => {
    const newTime = parseFloat(e.target.value);
    if (globalAudio.getAttribute('data-verse-id') === String(word.verse_id)) {
      globalAudio.currentTime = newTime;
      setProgress(newTime);
    }
  };

  const changePlaybackRate = (rate) => {
    setPlaybackRate(rate);
    if (globalAudio.getAttribute('data-verse-id') === String(word.verse_id)) {
      globalAudio.playbackRate = rate;
    }
  };

  const formatTime = (time) => {
    if (!time || isNaN(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <>
      <span
        style={{ 
          ...style, 
          color: selectedVerse === word.verse_id 
            ? 'var(--selected-verse-color)' 
            : isFlashing 
              ? 'var(--selected-verse-color)' 
              : '',
          transition: 'color 0.2s ease-in-out'
        }}
        onClick={() => {
            playAyah(word.verse_id);
            setSelectedVerse(prev => prev === word.verse_id ? null : word.verse_id);
        }}
        className={`arabic_page ${className ? className : ''}`}
      >
        {word.text}
      </span>
      
{word.isEnd && showControls && createPortal(
  <div className="audio_controls_container">
    <button className="audio_control_button" onClick={handlePlayPauseClick}>
      {isPlaying ? <Pause size={18} /> : <Play size={18} />}
    </button>

    <input
      type="range"
      min="0"
      max={duration || 0}
      value={progress}
      onChange={handleSliderChange}
      className="audio_slider"
      step="0.1"
    />

    <span className="audio_time">{formatTime(progress)} / {formatTime(duration)}</span>

    <button
      className="audio_control_button rate_button"
      onClick={(e) => {
        e.stopPropagation();
        const speeds = [0.8, 0.9, 1, 1.1, 1.2, 1.5];
        const nextIndex = (speeds.indexOf(playbackRate) + 1) % speeds.length;
        changePlaybackRate(speeds[nextIndex]);
      }}
    >
      {playbackRate}x
    </button>

    <button className="audio_control_button" onClick={handleCloseClick}>
      <X size={18} />
    </button>
  </div>,
  document.body
)}
    </>
  );
}

export default function VersePage({ verse, pageNumber}) {
  const containerStyle = {
    fontFamily: `QuranPage${pageNumber}`,
    direction: 'rtl'
  };

  const [selectedVerse, setSelectedVerse] = useState(null);

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
      return <Word setSelectedVerse={setSelectedVerse} selectedVerse={selectedVerse} key={`${line.line_number}-${index}`} word={word} style={wordStyle} className={(line.surah_name || line.bismillah) ? 'surah_name' : ''} />;
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