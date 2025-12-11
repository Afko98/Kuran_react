import {React, useEffect, useState} from 'react'
import UserSettings from '../../userSettings';
import api from '../../api'
import Chapter from './chapter';
import './home.css'
import background from '../../../assets/quran-background-simple.jpg'
import quran from '../../../assets/Holy-Quran-calligraphy-PNG.svg'
import { useNavigate } from "react-router-dom";

function HomeHeader() {
  return (
      <div className='home_background_container'>
      <img className='home_background_image' src={background} alt="Quran background"/>
      <div className='home_background_inner_container'>
        <img className='home_background_quran_image' src={quran} alt="Quran background"/>
        <div>
          <h1>Nauči arapski uz Kur'an časni</h1>
          <p>"Ko krene putem traženja znanja, Allah mu olakšava put prema Džennetu." (Muslim)</p>
        </div>
      </div>
    </div>
);
}

function Home() {
  const [chapters, setChapters] = useState([]);
  const [lastRead, setLastRead] = useState(null);
useEffect(() => {
  window.scrollTo(0, 0);
}, []);
  useEffect(() => {
    const chapterId = localStorage.getItem('lastReadChapter');
    const page = localStorage.getItem('prevReadPage');

    if (chapterId && page) {
      setLastRead({ chapterId, page });
    }
  }, []);

  const fetchChapters = async () => {
    try {
      const response = await api.get('/api/chapter/info');
      console.log(response.data);
      setChapters(response.data.chapters);
    } catch (err) {
      console.error(err);
    }
  };

 useEffect(() => {
  fetchChapters();
}, []);
const navigate = useNavigate();
  return (
    <>
    <HomeHeader/>
    <div className='chapters_list_container'>
      {lastRead && chapters.length > 0 && (
  <>
    <h3>Nastavi čitanje</h3>
    <Chapter
      props={chapters[Number(lastRead.chapterId) - 1]}
      use_nav={false}
      onClick={() => navigate(`/chapter/${lastRead.chapterId}/page/${lastRead.page}`)}
      
    />
    <div></div>
    <div className='h_line'></div>
    <div></div>
  </>
)}
      {
        chapters.map(chapter => (
          <Chapter
            props={chapter}
            key={chapter.chapter_id}
            onClick={() => navigate(`/chapter/${chapter.chapter_id}`)}
          />
        ))
      }
      </div>
    </>

  )
}

export default Home