import React, { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import Slider from './pages/moduls/slider';
import './userSettings.css'

function UserSettings({ setShowSettings, showWordTranslation, setShowWordTranslation, audioEdition, textStyleArabic, setAudioEdition, page=true }) {
  const [isVisible, setIsVisible] = useState(false);
  const [fontSizeArabic, setFontSizeArabic] = useState(
    localStorage.getItem('fontSizeArabic') || 36
  );
  const [fontSizeTefsir, setFontSizeTefsir] = useState(
    localStorage.getItem('fontSizeTefsir') || 14
  );
  const [fontSizeVerseTranslation, setFontSizeVerseTranslation] = useState(
    localStorage.getItem('fontSizeVerseTranslation') || 14
  );
  const [fontSizeWordTranslation, setFontSizeWordTranslation] = useState(
    localStorage.getItem('fontSizeWordTranslation') || 12
  );
  const [currentTheme, setCurrentTheme] = useState(
    localStorage.getItem('theme') || 'light'
  )

  // Trigger animation after component mounts
  useEffect(() => {
    // Small delay to ensure initial render completes
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 10);

    return () => clearTimeout(timer);
  }, []);
  
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    
    return () => {
      document.body.style.overflow = '';
    };
  }, []);
  
  useEffect(() => {
    document.documentElement.style.setProperty('--font-size-arabic', `${fontSizeArabic}px`);
    localStorage.setItem('fontSizeArabic', fontSizeArabic);
  }, [fontSizeArabic]);
    useEffect(() => {
    document.documentElement.style.setProperty('--font-size-tefsir', `${fontSizeTefsir}px`);
    localStorage.setItem('fontSizeTefsir', fontSizeTefsir);
  }, [fontSizeTefsir]);
    useEffect(() => {
    document.documentElement.style.setProperty('--font-size-verse-translation', `${fontSizeVerseTranslation}px`);
    localStorage.setItem('fontSizeVerseTranslation', fontSizeVerseTranslation);
  }, [fontSizeVerseTranslation]);
    useEffect(() => {
    document.documentElement.style.setProperty('--font-size-word-translation', `${fontSizeWordTranslation}px`);
    localStorage.setItem('fontSizeWordTranslation', fontSizeWordTranslation);
  }, [fontSizeWordTranslation]);
    useEffect(() => {
    localStorage.setItem('audioEdition', audioEdition);
  }, [audioEdition]);
    useEffect(() => {
    localStorage.setItem('textStyleArabic', textStyleArabic);
  }, [textStyleArabic]);

  function handleThemeChange(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
    setCurrentTheme(theme);
  }

  const handleClose = () => {
    setIsVisible(false);
    // Wait for animation to complete before unmounting
    setTimeout(() => {
      setShowSettings(false);
    }, 300); // Match transition duration
  };

  return (
    <div className='modal_overlay_right' onClick={handleClose}>
      <div
        className={`user_settings_container ${isVisible ? 'active' : ''}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="settings_header">
          <h2>Postavke</h2>
          <button className="close_button" onClick={handleClose} aria-label="Zatvori">
            <X size={20} />
          </button>
        </div>
        
        <div className="setting-group">
          <label htmlFor="theme-select">Tema</label>
          <select id="theme-select" value={currentTheme} onChange={(e) => handleThemeChange(e.target.value)}>
            <option value="light">Svijetla</option>
            <option value="dark">Tamna</option>
            <option value="midnight">Plava</option>
            <option value="forest-dark">Zelena</option>
            <option value="sepia">Topla</option>
            <option value="rose">Ruža</option>
          </select>
        </div>      

        <div className="setting-group">
          <label >Učač</label>
          <select 
            id="audioEdition"
            value={audioEdition}    
            onChange={(e) => setAudioEdition(e.target.value)}
          >
            <option value="ar.alafasy">Alafasy</option>
            <option value="ar.husary">Husary</option>
            <option value="ar.abdurrahmaansudais-2">Sudais</option>
            <option value="ar.mahermuaiqly">Maher</option>
            <option value="ar.hudhaify">Hudhaify</option>
          </select>
        </div>

        {page &&
        <>
        <div className="toggle-container">
          <label style={{maxWidth:"56%"}} className="toggle-label">Prijevod riječ po riječ (u izradi)</label>
          <label className="toggle-switch">
            <input
              type="checkbox"
              checked={showWordTranslation}
              onChange={(e) => setShowWordTranslation(e.target.checked)}
            />
            <span className="toggle-slider"></span>
          </label>
        </div>

        <div style={{display:'flex', flexDirection:"column", gap:"8px", borderBottom:"1px solid gray", borderTop:"1px solid gray", paddingTop:"10px"}}>
        <Slider
          label="Veličina arapskog pisma"
          min={24}
          max={80}
          value={fontSizeArabic}
          onChange={(e) => setFontSizeArabic(Number(e.target.value))}
        />
        <span  className={'arabic'} style={{paddingBottom:"18px", fontSize:`${fontSizeArabic}px`, fontFamily: 'QuranPage1'}}>ﭑ
ﭒ</span>
        </div>

        <div style={{display:'flex', flexDirection:"column", gap:"18px", borderBottom:"1px solid gray"}}>
        <Slider
          label="Veličina prevedenih riječi"
          min={8}
          max={40}
          value={fontSizeWordTranslation}
          onChange={(e) => setFontSizeWordTranslation(Number(e.target.value))}
        />
        <span   style={{paddingBottom:"18px", fontSize:`${fontSizeWordTranslation}px`}}>Primjer teksta</span>
        </div>
        <div style={{display:'flex', flexDirection:"column", gap:"18px", borderBottom:"1px solid gray"}}>
        <Slider
          label="Veličina prijevoda"
          min={8}
          max={40}
          value={fontSizeVerseTranslation}
          onChange={(e) => setFontSizeVerseTranslation(Number(e.target.value))}
        />
        <span  style={{paddingBottom:"18px", fontSize:`${fontSizeVerseTranslation}px`}}>Primjer teksta</span>
        </div>
        <div style={{display:'flex', flexDirection:"column", gap:"18px", borderBottom:"1px solid gray"}}>
        <Slider
          label="Veličina teksta tefsira"
          min={8}
          max={40}
          value={fontSizeTefsir}
          onChange={(e) => setFontSizeTefsir(Number(e.target.value))}
        />
        <span style={{paddingBottom:"18px", fontSize:`${fontSizeTefsir}px`}}>Primjer teksta</span>
        </div>
        </>
}
      </div>
      
    </div>
  )
}

export default UserSettings
