import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api';
import PageHeader from './pageHeader';
import VersePage from './versePage';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useSwipeable } from 'react-swipeable';
import { motion, AnimatePresence } from 'framer-motion';
import './fullPageMushaf.css';

function FullPageMushaf() {
  const navigate = useNavigate();
  const { page_id } = useParams();
  const pageNumber = Number(page_id);
  const [lines, setLines] = useState(null);
  const [swipeDirection, setSwipeDirection] = useState(0); // -1 = left, 1 = right
  const [booked, setBooked] = useState(false);
  const [pages_l, setPages_l] = useState(
      () => JSON.parse(localStorage.getItem('bookmarkPages')) || []
  )

  const savePage = (list) => {
    setPages_l(list);
    localStorage.setItem('bookmarkPages', JSON.stringify(list));
  };

  const addPage = (page) => {
    if (!pages_l.includes(page)) savePage([...pages_l, page]);
  };

  const removePage = (page) => {
    const updated = pages_l.filter(p => p !== page);
    savePage(updated);
  };

  // Fetch page data
  const fetchPage = async () => {
    try {
      const p = await api.get(`/api/page?page=${page_id}`);
      const page = p.data;
      if (!page || !page.chapters) 
      {
        return null;
      }

      const linesMap = new Map();

      page.chapters.forEach(chapter => {
        if (chapter.beginning_of_surah) {
          const firstVerse = chapter.verses[0];
          const firstWord = firstVerse?.words?.[0];
          const lineNumber = firstWord?.line_number;

          let no_b = false;
          let offset = 2;
          if (chapter.chapter_id == 1 || chapter.chapter_id == 9)
          {
            no_b = true;
            offset = 1;
          }

          linesMap.set(lineNumber - offset, {
            line_number: lineNumber - offset,
            words: ['surah' + String(chapter.chapter_id).padStart(3, '0') + String.fromCharCode(0xe000)],
            surah_name: true
          });
          if (!no_b)
          {
                      linesMap.set(lineNumber - 1, {
            line_number: lineNumber - 1,
            words: [String.fromCharCode(0xFC21)],
            bismillah: true
          });
          }

        }

        chapter.verses.forEach(verse => {
          verse.words.forEach(word => {
            const lineNumber = word.line_number;
            if (!linesMap.has(lineNumber)) {
              linesMap.set(lineNumber, { line_number: lineNumber, words: [] });
            }
            linesMap.get(lineNumber).words.push(word.text);
          });
        });
      });

		const obj = {};           // create empty object
		obj['lines'] = Array.from(linesMap.values()).sort((a, b) => a.line_number - b.line_number);
		obj['chapter'] = page.chapters[0].chapter_id;

		return obj;
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    const load = async () => {
      	const linesResult = await fetchPage();
      	setLines(linesResult.lines);
		localStorage.setItem('prevReadPage', page_id);
		localStorage.setItem('lastReadChapter', linesResult.chapter);
    };
    setBooked(pages_l.includes(page_id))
    load();
  }, [page_id, pages_l]);

  // Load font for page
  useEffect(() => {
    const formatted = page_id.toString().padStart(3, '0');
    const fontFace = new FontFace(
      `QuranPage${page_id}`,
      `url(https://raw.githubusercontent.com/mustafa0x/qpc-fonts/f93bf5f3/mushaf-woff2/QCF_P${formatted}.woff2)`,
      { display: 'swap' }
    );

    fontFace.load()
      .then(loadedFace => document.fonts.add(loadedFace))
      .catch(err => console.error(`Failed to load font for page ${page_id}:`, err));
  }, [page_id]);

  const goToNextPage = () => {
    setSwipeDirection(-1);
    navigate(`/page/${pageNumber === 604 ? 1 : pageNumber + 1}`);
  };

  const goToPrevPage = () => {
    setSwipeDirection(1);
    navigate(`/page/${pageNumber === 1 ? 604 : pageNumber - 1}`);
  };

  // Swipe handlers - RTL: swipe right = next, swipe left = prev
  const swipeHandlers = useSwipeable({
    onSwipedLeft: goToPrevPage,
    onSwipedRight: goToNextPage,
    preventScrollOnSwipe: false,
    trackTouch: true,
    trackMouse: false,
    delta: 50
  });



  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: '12px' }}>
      <PageHeader booked={booked} addPage={addPage} removePage={removePage} pages_l={pages_l}/>

      <div {...swipeHandlers} style={{ flex: 1, position: 'relative', minHeight: 0}}>
        <AnimatePresence initial={false} custom={swipeDirection} mode="wait">
          <motion.div
            key={page_id}
            custom={swipeDirection}
            initial={{ x: swipeDirection > 0 ? 300 : -300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: swipeDirection > 0 ? -300 : 300, opacity: 0 }}
            transition={{ type: 'tween', duration: 0.1, ease: 'circInOut' }}
            style={{ 
              width: '100%', 
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              gap: '12px'
            }}
          >
            <div className="chapter_page_container_page">
              <VersePage verse={lines} pageNumber={page_id} />
            </div>

            <div>
              <div className="h_line" style={{ width: '90%', margin: 'auto' }}></div>
              <div className="full_page_footer_buttons_container">
                <button className="btn" onClick={goToNextPage}>
                  <ChevronLeft />
                </button>

                <span>{page_id}</span>

                <button className="btn" onClick={goToPrevPage}>
                  <ChevronRight />
                </button>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

export default FullPageMushaf;