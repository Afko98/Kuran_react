import {React, useEffect, useState} from 'react'

import api from '../../api'
import Chapter from './chapter';
import './home.css'
import background from '../../../assets/quran-background-simple.jpg'
import quran from '../../../assets/Holy-Quran-calligraphy-PNG.svg'


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

  return (
    <>
    <HomeHeader/>
    <div className='chapters__list_container'>
      {
        chapters.map(chapter => (
          <Chapter props={chapter} key={chapter.chapter_id}></Chapter>
        )
          
        )
      }
      </div>
    </>

  )
}

export default Home