import {React, useEffect, useState, useMemo} from 'react'
import api from '../../api'
import Chapter from './chapter';
import './home.css'
import background from '../../../assets/quran-background-simple.jpg'
import quran from '../../../assets/Holy-Quran-calligraphy-PNG.svg'
import { useNavigate, useLocation } from "react-router-dom";
import {BookmarkChapter, BookmarkPage} from './bookmark';
import { Search } from 'lucide-react';

function HomeHeader() {

  // Pick a random phrase once per component mount


  return (
    <div className='home_background_container'>
      <img className='home_background_image' src={background} alt="Quran background"/>
      <div className='home_background_inner_container'>
        <img className='home_background_quran_image' src={quran} alt="Quran background"/>
        <div>
          <h1>Kur'an i Tefsir</h1>
<h2>Pristupite kompletnom Kur'anu sa bosanskim prijevodom, audio recitacijama i skraćenim tefsirom Ibn Kesira</h2>
        </div>
      </div>
    </div>
  );
}

function VersionSelector({ selectedVersion, onVersionChange }) {
  return (
    <nav className="version_selector" aria-label="Verzija prikaza">
      <div className="version_button_group">
        <button
          className={`version_button ${selectedVersion === 'sura' ? 'active' : ''}`}
          onClick={() => onVersionChange('sura')}
          aria-pressed={selectedVersion === 'sura'}
        >
          Prijevod
        </button>

        <button
          className={`version_button ${selectedVersion === 'strana' ? 'active' : ''}`}
          onClick={() => onVersionChange('strana')}
          aria-pressed={selectedVersion === 'strana'}
        >
          Kur'an
        </button>
      </div>
      
      <button 
        className={`version_button ${selectedVersion === 'biljeske' ? 'active' : ''}`}
        onClick={() => onVersionChange('biljeske')}
        aria-pressed={selectedVersion === 'biljeske'}
      >
        Bilješke
      </button>
    </nav>
  );
}


function Home() {
  const [chapters, setChapters] = useState([]);
  const [lastRead, setLastRead] = useState(null);
  const { pathname } = useLocation();
      const navigate = useNavigate();
  const [bookmarks, setBookmarks] = useState({ chapters: [], pages: [] });

  const [selectedVersion, setSelectedVersion] = useState(() => {
    // Initialize from localStorage or default to 'sura'
    return localStorage.getItem('selectedVersion') || 'sura';
  });
  

  useEffect(() => {
    const chapterId = localStorage.getItem('lastReadChapter');
    const page = localStorage.getItem('prevReadPage');
    const bookmarkChapters = localStorage.getItem('bookmarkVerses'); // bookmarked chapters:verses
    const bookmarkPages = localStorage.getItem('bookmarkPages'); // bookmarked pages
    if (chapterId && page) {
      setLastRead({ chapterId, page });
    }
    setBookmarks({
      chapters: bookmarkChapters ? JSON.parse(bookmarkChapters) : [],
      pages: bookmarkPages ? JSON.parse(bookmarkPages) : []
    });
  }, [selectedVersion]);

  const fetchChapters = async () => {
    try {
      const response = await api.get('/api/chapter/info');
      setChapters(response.data.chapters);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchChapters();

  }, []);
  
useEffect(() => {
  requestAnimationFrame(() => window.scrollTo({ top: 0, left: 0, behavior: 'instant' }));
}, [pathname]);


  const handleVersionChange = (version) => {
    setSelectedVersion(version);
    localStorage.setItem('selectedVersion', version);
  };

  const handleChapterClick = (chapter) => {
    if (selectedVersion === 'sura') {
      navigate(`/chapter/${chapter.chapter_id}`);
    } else {
      // Assuming chapter has verses array with page_number
      navigate(`/page/${chapter.start_page || 1}`);
    }
  };
    const [pageInput, setPageInput] = useState('');
    const handleChapterClickHistory = () => {
    if (selectedVersion === 'sura') {
      navigate(`/chapter/${lastRead.chapterId}/page/${lastRead.page}`);
    } else {
      // Assuming chapter has verses array with page_number
      navigate(`/page/${lastRead.page || 1}`);
    }
  };
   const handlePageChange = (e) => {
    setPageInput(e.target.value);
  };

const handlePageKeyPress = (e) => {
  if (e.key === 'Enter') {
    let pageNumber = parseInt(pageInput, 10);
    if (!isNaN(pageNumber)) {
      // clamp between 1 and 604
      if (pageNumber < 1) pageNumber = 1;
      if (pageNumber > 604) pageNumber = 604;

      navigate(`/page/${pageNumber}`);
    }
  }
};
return (
  <>
    <HomeHeader />

    <div className='chapters_list_container'>
      {lastRead && chapters.length > 0 && (
        <>
          <div style={{ width: "94%", paddingTop: '12px' }}>
            <span>Nastavi čitanje:</span>
          </div>
          <Chapter
            props={chapters[Number(lastRead.chapterId) - 1]}
            page={lastRead.page}
            onClick={() => handleChapterClickHistory()}
          />
        </>
      )}

      <VersionSelector 
        selectedVersion={selectedVersion} 
        onVersionChange={handleVersionChange}
      />
    {selectedVersion === 'strana' && (
      <div style={{ width: "94%", display: 'flex', justifyContent: 'end', alignContent: 'center', alignItems: 'center', gap: '4px'}}>
        <input
          type="number"
          value={pageInput}
          onChange={handlePageChange}
          onKeyPress={handlePageKeyPress}
          placeholder="Strana"
          min={1}
          max={604}
          inputMode="numeric"
          style={{position:'relative', left:'0px', transform:'translateY(0px)'}}
          className="page-input"
        />
        <Search size={20} opacity={0.8}/>
      </div>
    )}
      {selectedVersion === 'biljeske' && (
        <>
          <h3 className="bookmark_section_header">Kur'an</h3>
          {bookmarks.pages.toReversed().map(page => (
            <BookmarkPage
              key={`page-${page}`}
              page={page}
              onClick={() => handleChapterClick(page)}
            />
          ))}

          <h3 className="bookmark_section_header">Prijevod i tefsir</h3>
          {bookmarks.chapters.toReversed().map(chapter => {
            const chapterIndex = Number(chapter.split(':')[0]) - 1;
            const chapterData = chapters[chapterIndex];
            if (!chapterData) return null;

            return (
              <BookmarkChapter
                key={`chapter-${chapter}`}
                verse_key={chapter}
                props={chapterData}
                onClick={() => handleChapterClick(chapter)}
              />
            );
          })}
        </>
      )}

     {(selectedVersion === 'sura' || selectedVersion === 'strana') && (
  
    chapters.map(chapter => (
      <Chapter
        key={chapter.chapter_id}
        props={chapter}
        page={selectedVersion === 'strana' ? (chapter.start_page || 1) : undefined}
        onClick={() => handleChapterClick(chapter)}
      />
    ))
  
)}
    </div>
  </>
);
}

export default Home
