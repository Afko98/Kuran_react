import React from 'react'
import './chapter.css'

const SurahName = ({ number }) => {
    const paddedNumber = String(number).padStart(3, '0');
    const surah = String.fromCharCode(0xe000);

    return (
      <div className='home_chapter_name_arab arabic font_arabic_L' style={{fontSize: `40px`,display:'flex', justifyContent:'center', alignItems:'center'}}>


        <span style={{ fontFamily: 'SurahNames'}}>
          surah{paddedNumber}
        </span>

      </div>
    );
  };

function Chapter({ props, use_nav = true , onClick, page}) {
  return (
    <div className='home_chapter_container'  onClick={onClick}>
      <div className='home_chapter_id'>
        <svg className='chapter_badge' viewBox="0 0 100 100">
          {/* Simple flower/medallion shape with 8 petals */}
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
        <span className='chapter_number'>{props.chapter_id}</span>
      </div>
      
      <div className='home_chapter_info_container'>
        <span className='home_chapter_info_simple_name'>{props.name_simple}{page ? ` (strana ${page})` : ''}</span>
        <div className='home_chapter_info_name_bh'>{props.name_bh}</div>
        <span className='home_chapter_info_revelation'>{props.revelation_place + ' ' + props.verses_count + ' ajeta'}</span>
      </div>
      
      <SurahName number={props.chapter_id}/>
    </div>
  );
}

export default Chapter
