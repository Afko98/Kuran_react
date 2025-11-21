import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom';
import api from '../../api';

function FullChapter() {
    const { chapter_id } = useParams();
    const [chapter, setChapter] = useState();

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


  fetchChapter();
    }, [chapter_id]);

    return (
        <div>FullChapter {chapter_id}</div>
    )
}

export default FullChapter