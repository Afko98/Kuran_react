import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom';
import './chapter.css'
import api from '../../api';
import { Bookmark } from 'lucide-react';

export function BookmarkChapter({ verse_key, props}) {
    const [chapterId, verse] = verse_key.split(':');
    const [booked, setBooked] = useState(true);
    const navigate = useNavigate();

const onClickBookmark = () => {
    setBooked(!booked);
    const bookmarkVerses = JSON.parse(localStorage.getItem('bookmarkVerses')) || [];
    if (booked) {
      const updated = bookmarkVerses.filter(p => p !== verse_key);
      localStorage.setItem('bookmarkVerses', JSON.stringify(updated));
    }
    else {
      bookmarkVerses.push(verse_key);
      localStorage.setItem('bookmarkVerses', JSON.stringify(bookmarkVerses));
    }
  }

  return (
    <div className='home_chapter_container' onClick={() => navigate(`/chapter/${chapterId}/verse/${verse}`)}>
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
        <span className='chapter_number'>{chapterId}</span>
      </div>
      
      <div className='home_chapter_info_container'>
        <span className='home_chapter_info_simple_name'>{props.name_simple + ' - ajet: ' + verse}</span>
        <div className='home_chapter_info_name_bh'>{props.name_bh}</div>
        <span className='home_chapter_info_revelation'>{props.revelation_place + ' ' + props.verses_count + ' ajeta'}</span>
      </div>
      
      <div className='home_chapter_bookmark_icon'
     onClick={(e) => {
       e.stopPropagation(); // Prevents the parent click
       onClickBookmark();
     }}
     style={{fontSize: `40px`, display:'flex',padding:'6px', borderRadius:'6px', justifyContent:'center', alignItems:'center'}}
>
  <Bookmark color={booked ? 'var(--color-bookmark)' : 'currentColor'} opacity={booked ? 1 : 0.4}  strokeWidth={booked ? 2.6 : 1.6} size={20} />
</div>
    </div>
  );
}

export function BookmarkPage({ page }) {
    const [pageInfo, setPageInfo] = useState(null);
    const [booked, setBooked] = useState(true);
      const navigate = useNavigate();
      const fetchPageInfo = async () => {
    try {
      const response = await api.get(`/api/page/pageInfo?page=${page}`);
      console.log(response.data);
      setPageInfo(response.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchPageInfo();
  }, [page]);
  
  const onClickBookmark = () => {
    setBooked(!booked);
    const bookmarkPages = JSON.parse(localStorage.getItem('bookmarkPages')) || [];
    if (booked) {
      const updated = bookmarkPages.filter(p => p !== page);
      localStorage.setItem('bookmarkPages', JSON.stringify(updated));
    }
    else {
      bookmarkPages.push(page);
      localStorage.setItem('bookmarkPages', JSON.stringify(bookmarkPages));
    }
  }

  return (
    <div className='home_chapter_container' style={{paddingLeft:'16px'}} onClick={() => navigate(`/page/${page}`)}>
      <div className='home_chapter_info_container'>
        <span className='home_chapter_info_simple_name'>Kur'an - strana {page}</span>
<span className='home_chapter_info_revelation'>
  {pageInfo && (
    <>
      {pageInfo.chapters?.length === 1 && (
        <span className="chapter-line">
          {pageInfo.chapters[0].beginning_of_surah
            ? `Početak sure ${pageInfo.chapters[0].name_simple}`
            : `Nastavak sure ${pageInfo.chapters[0].name_simple}`}
        </span>
      )}

      {pageInfo.chapters?.length === 2 && (
        <>
          {pageInfo.chapters[0].beginning_of_surah ? (
            <span className="chapter-line">
              Početak sure {pageInfo.chapters[0].name_simple} i{' '}
              sure {pageInfo.chapters[1].name_simple}
            </span>
          ) : (
            <>
              <span className="chapter-line">
                Kraj sure {pageInfo.chapters[0].name_simple}
              </span>
              <span className="chapter-line">
                Početak sure {pageInfo.chapters[1].name_simple}
              </span>
            </>
          )}
        </>
      )}

      {pageInfo.chapters?.length === 3 && (
        <>
          {pageInfo.chapters[0].beginning_of_surah ? (
            <span className="chapter-line">
              Početak sura {pageInfo.chapters[0].name_simple},{' '}
              {pageInfo.chapters[1].name_simple} i{' '}
              {pageInfo.chapters[2].name_simple}
            </span>
          ) : (
            <>
              <span className="chapter-line">
                Kraj sure {pageInfo.chapters[0].name_simple}
              </span>
              <span className="chapter-line">
                Početak sura {pageInfo.chapters[1].name_simple} i{' '}
                {pageInfo.chapters[2].name_simple}
              </span>
            </>
          )}
        </>
      )}
    </>
  )}
</span>
      </div>

<div className='home_chapter_bookmark_icon'
     onClick={(e) => {
       e.stopPropagation(); // Prevents the parent click
       onClickBookmark();
     }}
     style={{fontSize: `40px`, display:'flex',padding:'6px', borderRadius:'6px', justifyContent:'center', alignItems:'center'}}
>
  <Bookmark color={booked ? 'var(--color-bookmark)' : 'currentColor'} opacity={booked ? 1 : 0.4}  strokeWidth={booked ? 2.6 : 1.6} size={20} />
</div>
    

    </div>
  );
}

