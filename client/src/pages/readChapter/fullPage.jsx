import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom';
import api from '../../api';
import './fullChapter.css'
import Verse from './verse'

function FullPage() {
    const { page_id } = useParams();
    const [page, setPage] = useState();
    const headerRef = React.useRef(null);
    const lastScrollYRef = React.useRef(0);

  const fetchPage = async () => {
    try {
      const response = await api.get(`/api/page?page=${page}`);
      console.log(response.data);
      setPage(response.data);
    } catch (err) {
      console.error(err);
    }
  };

    useEffect(() => {
      fetchPage();
      
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

    return (
      <>
        <header ref={headerRef} className="chapter_header">
          <div className="header_content">
            <h1>{chapter ? chapter.name_simple : 'Loading...'}</h1>
          </div>
        </header>
        
        <div className="chapter_page_container">
    {chapter ? (
      chapter.verses.map((verse, index) => {
        const prevPage =
          index > 0 ? chapter.verses[index - 1].page_number : null;
        const currentPage = verse.page_number;
        const currentJuz = verse.juz_number;
        const showPageNumber = prevPage !== currentPage;

        return (
          <React.Fragment key={verse.id}>
            {showPageNumber && (
              <div className="page_number_label">
                    Page {currentPage} {' '} / Juz {currentJuz}
              </div>
            )}
            <Verse verse={verse} />
            <div className="h_line"></div>
          </React.Fragment>
        );
      })
    ) : (
      <div>Loading...</div>
    )}
  </div>
</>
    )
}

export default FullPage