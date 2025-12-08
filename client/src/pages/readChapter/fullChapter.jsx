import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api';
import './fullChapter.css';
import Verse from './verse';
import ChapterHeader from './chapterHeader';

function FullChapter() {
  const navigate = useNavigate();
  const { chapter_id } = useParams();
  const [chapter, setChapter] = useState(null);
  const [loadedVerses, setLoadedVerses] = useState([]);
  const [currentPageRange, setCurrentPageRange] = useState({ start: null, end: null });
  const headerRef = useRef(null);
  const lastScrollYRef = useRef(0);
  const verseRefs = useRef({});
  const loadMoreTopRef = useRef(null);
  const loadMoreBottomRef = useRef(null);
  const isLoadingRef = useRef({ top: false, bottom: false });
  const PAGES_PER_LOAD = 1; // Load 2 pages at a time for better UX
  const [audioEdition, setAudioEdition] = useState(
    localStorage.getItem('audioEdition') || `ar.alafasy`
  )
  
const [showWordTranslation, setShowWordTranslation] = useState(() => {
  return localStorage.getItem('showWordTranslation') === 'true';
});

useEffect(() => {
  localStorage.setItem('showWordTranslation', showWordTranslation);
}, [showWordTranslation]);

  const fetchChapter = async () => {
    try {
      const response = await api.get(`/api/chapter?chapter=${chapter_id}`);
      console.log(response.data.chapter);
      setChapter(response.data.chapter);
      
      // Load first pages initially
      if (response.data.chapter.verses.length > 0) {
        const firstPage = response.data.chapter.verses[0].page_number;
        loadVersesByPageRange(response.data.chapter, firstPage, firstPage + PAGES_PER_LOAD - 1);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const loadVersesByPageRange = useCallback((chapterData, startPage, endPage) => {
    const verses = chapterData.verses.filter(
      v => v.page_number >= startPage && v.page_number <= endPage
    );
    setLoadedVerses(verses);
    setCurrentPageRange({ start: startPage, end: endPage });
    isLoadingRef.current = { top: false, bottom: false };
  }, []);

  const loadMoreTop = useCallback(() => {
    if (!chapter || !currentPageRange.start || isLoadingRef.current.top) return;
    
    // Check if we've reached the first verse
    const firstVerse = chapter.verses[0];
    if (currentPageRange.start <= firstVerse.page_number) return;
    
    isLoadingRef.current.top = true;
    
    const prevEndPage = currentPageRange.start - 1;
    const prevStartPage = Math.max(firstVerse.page_number, prevEndPage - PAGES_PER_LOAD + 1);
    
    const newVerses = chapter.verses.filter(
      v => v.page_number >= prevStartPage && v.page_number <= prevEndPage
    );
    
    if (newVerses.length > 0) {
      // Store scroll position before adding
      const scrollPos = window.scrollY;
      const containerHeight = document.documentElement.scrollHeight;
      
      setLoadedVerses(prev => [...newVerses, ...prev]);
      setCurrentPageRange(prev => ({ start: prevStartPage, end: prev.end }));
      
      // Restore scroll position after new content loads
      requestAnimationFrame(() => {
        const newHeight = document.documentElement.scrollHeight;
        window.scrollTo(0, scrollPos + (newHeight - containerHeight));
        isLoadingRef.current.top = false;
      });
    } else {
      isLoadingRef.current.top = false;
    }
  }, [chapter, currentPageRange, PAGES_PER_LOAD]);

  const loadMoreBottom = useCallback(() => {
    if (!chapter || !currentPageRange.end || isLoadingRef.current.bottom) return;
    
    // Check if we've reached the last verse
    const lastVerse = chapter.verses[chapter.verses.length - 1];
    if (currentPageRange.end >= lastVerse.page_number) return;
    
    isLoadingRef.current.bottom = true;
    
    const nextStartPage = currentPageRange.end + 1;
    const nextEndPage = Math.min(lastVerse.page_number, nextStartPage + PAGES_PER_LOAD - 1);
    
    const newVerses = chapter.verses.filter(
      v => v.page_number >= nextStartPage && v.page_number <= nextEndPage
    );
    
    if (newVerses.length > 0) {
      setLoadedVerses(prev => [...prev, ...newVerses]);
      setCurrentPageRange(prev => ({ start: prev.start, end: nextEndPage }));
    }
    
    isLoadingRef.current.bottom = false;
  }, [chapter, currentPageRange, PAGES_PER_LOAD]);

  useEffect(() => {
    setChapter(null);
    setLoadedVerses([]);
    setCurrentPageRange({ start: null, end: null });
    isLoadingRef.current = { top: false, bottom: false };
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

  // Observer for loading more at the top
  useEffect(() => {
    if (!chapter || !loadMoreTopRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isLoadingRef.current.top) {
          loadMoreTop();
        }
      },
      { 
        threshold: 0,
        rootMargin: '800px'
      }
    );

    observer.observe(loadMoreTopRef.current);

    return () => observer.disconnect();
  }, [chapter, loadMoreTop]);

  // Observer for loading more at the bottom
  useEffect(() => {
    if (!chapter || !loadMoreBottomRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isLoadingRef.current.bottom) {
          loadMoreBottom();
        }
      },
      { 
        threshold: 0,
        rootMargin: '800px'
      }
    );

    observer.observe(loadMoreBottomRef.current);

    return () => observer.disconnect();
  }, [chapter, loadMoreBottom]);

  const handleNavigate = useCallback((type, value) => {
    if (!chapter || !value) return;

    let targetPage;
    let targetVerse;
    
    if (type === 'page') {
      targetPage = parseInt(value);
      targetVerse = chapter.verses.find(v => v.page_number === targetPage);
    } else if (type === 'juz') {
      targetVerse = chapter.verses.find(v => v.juz_number === parseInt(value));
      targetPage = targetVerse?.page_number;
    } else if (type === 'ayet') {
      targetVerse = chapter.verses.find(v => v.verse_number === parseInt(value));
      targetPage = targetVerse?.page_number;
    }

    if (targetPage && targetVerse) {
      // Load a range centered around the target page
      const startPage = Math.max(
        chapter.verses[0].page_number,
        targetPage - Math.floor(PAGES_PER_LOAD / 2)
      );
      const endPage = Math.min(
        chapter.verses[chapter.verses.length - 1].page_number,
        targetPage + Math.ceil(PAGES_PER_LOAD / 2)
      );
      
      loadVersesByPageRange(chapter, startPage, endPage);
      
      // Scroll to the target after a short delay to allow rendering
      setTimeout(() => {
        if (verseRefs.current[targetVerse.id]) {
          verseRefs.current[targetVerse.id].scrollIntoView({ 
            behavior: 'smooth', 
            block: 'start' 
          });
        }
      }, 150);
    }
  }, [chapter, loadVersesByPageRange, PAGES_PER_LOAD]);

  const hasMoreTop = useMemo(() => {
    if (!chapter || !currentPageRange.start) return false;
    const firstVerse = chapter.verses[0];
    return currentPageRange.start > firstVerse.page_number;
  }, [chapter, currentPageRange]);

  const hasMoreBottom = useMemo(() => {
    if (!chapter || !currentPageRange.end) return false;
    const lastVerse = chapter.verses[chapter.verses.length - 1];
    return currentPageRange.end < lastVerse.page_number;
  }, [chapter, currentPageRange]);

  // Memoize verse rendering to prevent unnecessary re-renders
  const renderedVerses = useMemo(() => {
    return loadedVerses.map((verse, index) => {
      const prevPage = index > 0 ? loadedVerses[index - 1].page_number : null;
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
            <Verse verse={verse} headerRef={headerRef} showWordTranslation={showWordTranslation}
            audioEdition={audioEdition}
       />
          </div>
          <div className="h_line"></div>
        </React.Fragment>
      );
    });
  }, [loadedVerses, showWordTranslation, audioEdition]);

  return (
    <>
      <ChapterHeader 
        headerRef={headerRef} 
        chapter={chapter} 
        onNavigate={handleNavigate}
        showWordTranslation={showWordTranslation}
        setShowWordTranslation={setShowWordTranslation}
        audioEdition={audioEdition}
        setAudioEdition={setAudioEdition}
      />

      <div className="chapter_page_container">
        {chapter ? (
          <>
            <div className={`chapter_page_button_container ${
    Number(chapter_id) === 114 ? "reverse" : ""
  }`}
              style={{ marginTop: '74px' }}
            >
              {Number(chapter_id) < 114 && (
                <button className='btn' onClick={() => navigate(`/chapter/${Number(chapter_id) + 1}`)}>
                  Sljedeća sura
                </button>
              )}
              {Number(chapter_id) > 1 && (
                <button className='btn' onClick={() => navigate(`/chapter/${Number(chapter_id) - 1}`)}>
                  Prethodna sura
                </button>
              )}
         
            </div>

            {/* Top infinite scroll trigger */}
            {hasMoreTop && (
              <div ref={loadMoreTopRef} style={{ height: '1px', margin: '10px 0' }} />
            )}

            {renderedVerses}

            {/* Bottom infinite scroll trigger */}
            {hasMoreBottom && (
              <div ref={loadMoreBottomRef} style={{ height: '1px', margin: '40px 0' }} />
            )}

            <div
              className='chapter_page_button_container'
              style={{ marginTop: '12px' }}
            >
              {Number(chapter_id) < 114 && (
                <button className='btn' onClick={() => navigate(`/chapter/${Number(chapter_id) + 1}`)}>
                  Sljedeća sura
                </button>
              )}
              {Number(chapter_id) > 1 && (
                <button className='btn' onClick={() => navigate(`/chapter/${Number(chapter_id) - 1}`)}>
                  Prethodna sura
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

export default FullChapter;