import React, { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api';
import './fullChapter.css'
import Verse from './verse'
import ChapterHeader from './chapterHeader';

function FullChapter() {
  const navigate = useNavigate();
  const { chapter_id } = useParams();
  const [chapter, setChapter] = useState();
  const headerRef = useRef(null);
  const lastScrollYRef = useRef(0);
  const verseRefs = useRef({});

  const fetchChapter = async () => {
    try {
      const response = await api.get(`/api/chapter?chapter=${chapter_id}`);
      console.log(response.data.chapter);
      setChapter(response.data.chapter);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    setChapter(null);
    fetchChapter();
    window.scrollTo({ top: 0, behavior: 'auto' });
    const header = headerRef.current;
    if (!header) return;
    
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      if (currentScrollY < lastScrollYRef.current) {
        header.style.transform = 'translateY(0)';
      } else if (currentScrollY > lastScrollYRef.current && currentScrollY > 10) {
        header.style.transform = 'translateY(-100%)';
      }
      
      lastScrollYRef.current = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, [chapter_id]);

  const handleNavigate = (type, value) => {
    if (!chapter || !value) return;

    let targetVerse;
    
    if (type === 'page') {
      targetVerse = chapter.verses.find(v => v.page_number === parseInt(value));
    } else if (type === 'juz') {
      targetVerse = chapter.verses.find(v => v.juz_number === parseInt(value));
    } else if (type === 'ayet') {
      targetVerse = chapter.verses.find(v => v.verse_number === parseInt(value));
    }

    if (targetVerse && verseRefs.current[targetVerse.id]) {
      verseRefs.current[targetVerse.id].scrollIntoView({ 
        behavior: 'smooth', 
        block: 'start' 
      });
    }
  };

  return (
    <>
      <ChapterHeader 
        headerRef={headerRef} 
        chapter={chapter} 
        onNavigate={handleNavigate}
      />

      <div className="chapter_page_container">
        {chapter ? (
          <>
          <div className='chapter_page_button_container'
              style={{
                marginTop: '74px',
              }}
            >
              {Number(chapter_id) > 1 && (
                <button onClick={() => navigate(`/chapter/${Number(chapter_id) - 1}`)}>
                  Prethodna sura
                </button>
              )}
              {Number(chapter_id) < 114 && (
                <button onClick={() => navigate(`/chapter/${Number(chapter_id) + 1}`)}>
                  Sljedeća sura
                </button>
              )}
            </div>
            {chapter.verses.map((verse, index) => {
              const prevPage =
                index > 0 ? chapter.verses[index - 1].page_number : null;
              const currentPage = verse.page_number;
              const currentJuz = verse.juz_number;
              const showPageNumber = prevPage !== currentPage;

              return (
                <React.Fragment key={verse.id}>
                  {showPageNumber && (
                    <div className="page_number_label">
                      Page {currentPage} / Juz {currentJuz}
                    </div>
                  )}
                  <div ref={el => verseRefs.current[verse.id] = el}>
                    <Verse verse={verse} />
                  </div>
                  <div className="h_line"></div>
                </React.Fragment>
              );
            })}

            <div
              className='chapter_page_button_container'
              style={{
                marginTop: '12px',
              }}
            >
              {Number(chapter_id) > 1 && (
                <button onClick={() => navigate(`/chapter/${Number(chapter_id) - 1}`)}>
                  Prethodna sura
                </button>
              )}
              {Number(chapter_id) < 114 && (
                <button onClick={() => navigate(`/chapter/${Number(chapter_id) + 1}`)}>
                  Sljedeća sura
                </button>
              )}
            </div>
          </>
        ) : (
          <div>Loading...</div>
        )}
      </div>
    </>
  );
}

export default FullChapter