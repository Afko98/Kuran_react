import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api';
import './fullChapter.css';
import Verse from './verse';
import ChapterHeader from './chapterHeader';
import { ChevronLeft, ChevronRight } from 'lucide-react';

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
  const PAGES_PER_LOAD = 1;
  const MAX_PAGES_IN_MEMORY = 3; // Keep max 6 pages loaded
  const [loadedFonts, setLoadedFonts] = useState(new Set());
const [verses_l, setVerses_l] = useState(
  () => JSON.parse(localStorage.getItem('bookmarkVerses')) || []
);
  const [audioEdition, setAudioEdition] = useState(
    localStorage.getItem('audioEdition') || `ar.alafasy`
  );
  const [textStyleArabic, setTextStyleArabic] = useState(
    localStorage.getItem('textStyleArabic') || `text_uthmani`
  );
  const [isAutoplayEnabled, setIsAutoplayEnabled] = useState(false);
  const [showWordTranslation, setShowWordTranslation] = useState(() => {
    return localStorage.getItem('showWordTranslation') === 'true';
  });

  useEffect(() => {
    localStorage.setItem('showWordTranslation', showWordTranslation);
  }, [showWordTranslation]);

  const fetchChapter = async () => {
    try {
      const response = await api.get(`/api/chapter?chapter=${chapter_id}`);
      setChapter(response.data.chapter);
      
      // Load first pages initially
      if (response.data.chapter.verses.length > 0) {
        const firstPage = response.data.chapter.verses[0].page_number;
        localStorage.setItem('lastReadChapter', chapter_id);
        localStorage.setItem('prevReadPage', firstPage);
        loadVersesByPageRange(response.data.chapter, firstPage, firstPage + PAGES_PER_LOAD - 1);
      }
    } catch (err) {
      console.error(err);
    }
  };

    const saveVerses = (list) => {
    setVerses_l(list);
    localStorage.setItem('bookmarkVerses', JSON.stringify(list));
  };


  const addVerse = (verse_key) => {
    if (!verses_l.includes(verse_key)) saveVerses([...verses_l, verse_key]);
  };

  const removeVerse = (verse_key) => {
    const updated = verses_l.filter(p => p !== verse_key);
    saveVerses(updated);
  };


  const loadVersesByPageRange = useCallback((chapterData, startPage, endPage) => {
    const verses = chapterData.verses.filter(
      v => v.page_number >= startPage && v.page_number <= endPage
    );
    setLoadedVerses(verses);
    setCurrentPageRange({ start: startPage, end: endPage });
    isLoadingRef.current = { top: false, bottom: false };
  }, []);

  // Unload pages that are too far from current range
  const cleanupDistantPages = useCallback(() => {
    if (!currentPageRange.start || !currentPageRange.end) return;

    const currentPages = new Set();
    for (let i = currentPageRange.start; i <= currentPageRange.end; i++) {
      currentPages.add(i);
    }

    // Remove fonts that are not in current page range
    setLoadedFonts(prev => {
      const newSet = new Set();
      prev.forEach(pageNum => {
        if (currentPages.has(pageNum)) {
          newSet.add(pageNum);
        } else {
          // Unload font from memory
          const fontName = `QuranPage${pageNum}`;
          document.fonts.forEach(font => {
            if (font.family === fontName) {
              document.fonts.delete(font);
            }
          });
        }
      });
      return newSet;
    });
  }, [currentPageRange]);

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
      setCurrentPageRange(prev => {
        const newRange = { start: prev.start, end: nextEndPage };
        
        // Check if we need to trim from top
        const totalPages = newRange.end - newRange.start + 1;
        if (totalPages > MAX_PAGES_IN_MEMORY) {
          newRange.start = newRange.end - MAX_PAGES_IN_MEMORY + 1;
        }
        
        return newRange;
      });
      
      localStorage.setItem('lastReadChapter', chapter_id);
      localStorage.setItem('prevReadPage', nextEndPage);
    }
    
    isLoadingRef.current.bottom = false;
  }, [chapter, currentPageRange, PAGES_PER_LOAD, chapter_id, MAX_PAGES_IN_MEMORY]);

  // Trim verses when page range changes
  useEffect(() => {
    if (!chapter || !currentPageRange.start || !currentPageRange.end) return;
    
    setLoadedVerses(prev => {
      return prev.filter(
        v => v.page_number >= currentPageRange.start && 
             v.page_number <= currentPageRange.end
      );
    });
    
    cleanupDistantPages();
  }, [currentPageRange, chapter, cleanupDistantPages]);

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

  useEffect(() => {
    if (!loadedVerses.length) return;

    const pageNumbers = [...new Set(loadedVerses.map(v => v.page_number))];
    
    pageNumbers.forEach(pageNum => {
      if (!loadedFonts.has(pageNum)) {
        const formatted = pageNum.toString().padStart(3, '0');
        const fontFace = new FontFace(
          `QuranPage${pageNum}`,
          `url(https://raw.githubusercontent.com/mustafa0x/qpc-fonts/f93bf5f3/mushaf-woff2/QCF_P${formatted}.woff2)`,
  {
    display: 'swap'    // optional, similar to CSS
  }
        );
        
        fontFace.load()
          .then((loadedFace) => {
            document.fonts.add(loadedFace);
            setLoadedFonts(prev => new Set([...prev, pageNum]));
          })
          .catch(err => {
            console.error(`Failed to load font for page ${pageNum}:`, err);
          });
      }
    });
  }, [loadedVerses, loadedFonts]);

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

  const BismillahText = () => {
    const bismillah = String.fromCharCode(0xFC21);
    return (
      <span className='arabic' style={{ fontSize: `min(calc(var(--font-size-arabic, 16px) + 10px), 58px)`,fontFamily: 'Bismillah', display:'flex', justifyContent:'center', alignContent:'top'}}>
        {bismillah}
      </span>
    );
  };

  const SurahName = ({ number }) => {
    const paddedNumber = String(number).padStart(3, '0');
    const surah = String.fromCharCode(0xe000);
    const left_effect = String.fromCharCode(0x004f);
    const right_effect = String.fromCharCode(0x004E);
    return (
      <div className='arabic' style={{fontSize: `calc(var(--font-size-arabic, 16px) + 10px)`,display:'flex', justifyContent:'center', alignItems:'center'}}>
        <span style={{ fontFamily: 'Bismillah'}}>
          {left_effect}
        </span>
        <span style={{ fontFamily: 'SurahNames' }}>
          {surah}
        </span>
        <span style={{ fontFamily: 'SurahNames'}}>
          surah{paddedNumber}
        </span>
        <span style={{ fontFamily: 'Bismillah'}}>
          {right_effect}
        </span>
      </div>
    );
  };

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
      const startPage = Math.max(
        chapter.verses[0].page_number,
        targetPage - Math.floor(PAGES_PER_LOAD / 2)
      );
      
      loadVersesByPageRange(chapter, startPage , startPage);
      
setTimeout(() => {
  const verseEl = verseRefs.current[targetVerse.id];
  if (verseEl) {
    const headerHeight = headerRef.current?.offsetHeight || 0;
    const verseTop = verseEl.getBoundingClientRect().top + window.scrollY;
    window.scrollTo({
      top: verseTop, // extra 10px for padding
      behavior: 'smooth',
    });
  }
}, 150);
    }
  }, [chapter, loadVersesByPageRange, PAGES_PER_LOAD]);

  const scrollToVerse = useCallback((verseId) => {
    const verseEl = verseRefs.current[verseId];
    if (verseEl) {
      verseEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, []);

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
      const booked = verses_l.includes(verse.verse_key);

      return (
        <React.Fragment key={verse.id}>
          {showPageNumber && (
            <div className="page_number_label">
              Page {currentPage} / Juz {currentJuz}
            </div>
          )}
          <div ref={el => verseRefs.current[verse.id] = el}>
            <Verse 
              verse={verse} 
              headerRef={headerRef} 
              showWordTranslation={showWordTranslation} 
              textStyleArabic={textStyleArabic}
              audioEdition={audioEdition}
              isAutoplayEnabled={isAutoplayEnabled}
              setIsAutoplayEnabled={setIsAutoplayEnabled}
              scrollToVerse={scrollToVerse}
              addVerse={addVerse}
              removeVerse={removeVerse}
              booked={booked}
            />
          </div>
          <div className="h_line"></div>
        </React.Fragment>
      );
    });
  }, [loadedVerses, verses_l, showWordTranslation, audioEdition, textStyleArabic, isAutoplayEnabled, setIsAutoplayEnabled, scrollToVerse]);

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
        textStyleArabic={textStyleArabic}
        setTextStyleArabic={setTextStyleArabic}
      />

      <div className="chapter_page_container">
        {chapter ? (
          <>
            <div className={`chapter_page_button_container ${
              Number(chapter_id) === 114 ? "reverse" : ""
            }`}
              style={{ marginTop: '40px' }}
            >

         
            </div>
{loadedVerses.length > 0 && (
  <>
    {loadedVerses[0].page_number === chapter.verses[0].page_number && (
      <>
<div
  style={{
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  }}
>
  <button
    className="btn"
    onClick={() => navigate(`/chapter/${Number(chapter_id) + 1}`)}
    disabled={Number(chapter_id) === 114}
    style={{ visibility: Number(chapter_id) === 114 ? "hidden" : "visible" }}
  >
    <ChevronLeft />
  </button>

  <SurahName number={chapter_id} />

  <button
    className="btn"
    onClick={() => navigate(`/chapter/${Number(chapter_id) - 1}`)}
    disabled={Number(chapter_id) === 1}
    style={{ visibility: Number(chapter_id) === 1 ? "hidden" : "visible" }}
  >
    <ChevronRight />
  </button>
</div>
        
        {chapter_id != 1 && chapter_id != 9 && <BismillahText />}
      </>
    )}
  </>
)}
            {hasMoreTop && (
              <div ref={loadMoreTopRef} style={{ height: '1px', margin: '10px 0' }} />
            )}
     
            {renderedVerses}

            {/* Bottom infinite scroll trigger */}
            {hasMoreBottom && (
              <div ref={loadMoreBottomRef} style={{ height: '1px', margin: '40px 0' }} />
            )}

            <div
              className={`chapter_page_button_container ${
              Number(chapter_id) === 114 ? "reverse" : ""
            }`}
              style={{ marginTop: '12px' }}
            >
              {Number(chapter_id) < 114 && (
                <button className='btn' onClick={() => navigate(`/chapter/${Number(chapter_id) + 1}`)}>
                  <ChevronLeft/>
                </button>
              )}
              {Number(chapter_id) > 1 && (
                <button className='btn' onClick={() => navigate(`/chapter/${Number(chapter_id) - 1}`)}>
                  <ChevronRight/>
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
