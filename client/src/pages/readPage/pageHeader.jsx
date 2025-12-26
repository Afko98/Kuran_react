import React, { useState, useEffect } from 'react';
import { TextAlignJustify, Settings, Bookmark } from 'lucide-react';
import { useNavigate, useParams } from "react-router-dom";
import UserSettings from '../../userSettings';

export default function PageHeader({ booked, addPage, removePage, pages_l}) {
  const navigate = useNavigate();
  const { page_id } = useParams();
  const [showSettings, setShowSettings] = useState(false);
  const [pageInput, setPageInput] = useState(page_id || '');

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
useEffect(() => {
  setPageInput(page_id || '');
}, [page_id]);
  const handleBookmarkClick = () => {
    if (booked) {
      removePage(page_id); // already bookmarked → remove
    } else {
      addPage(page_id);    // not bookmarked → add
    }
  };
  return (
    <>
      {showSettings &&
        <UserSettings 
          showSettings={showSettings} 
          setShowSettings={setShowSettings} 
          page={false}
        />
      }
      <header className="chapter_header_page">

          <TextAlignJustify  
            className='header_icon_border padding_2_4' 
            size={30} 
            style={{cursor:'pointer'}} 
            onClick={() => navigate(`/`)}
          />

<input
  type="number"
  value={pageInput}
  onChange={handlePageChange}
  onKeyPress={handlePageKeyPress}
  placeholder="Strana"
  min={1}       // minimum page
  max={604}     // maximum page
  inputMode="numeric"
  className="page-input"
/>

<div style={{display:'flex', gap:'20px', alignItems:'center'}}>
<Bookmark style={{cursor:'pointer'}}
onClick={handleBookmarkClick}
strokeWidth={booked ? 2.6 : 1.6}
color={booked ? 'var(--color-bookmark)' : 'currentColor'} opacity={booked ? 1 : 0.4}
/>
          <Settings 
            className='header_icon_border padding_2_4' 
            style={{cursor:'pointer'}} 
            size={30} 
            onClick={() => setShowSettings(true)}
          />
          </div>
   
      </header>
    </>
  );
}
