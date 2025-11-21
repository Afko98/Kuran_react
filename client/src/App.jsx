import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import './App.css'
import Home from './pages/home/home';
import FullChapter from './pages/readChapter/fullChapter';

function App() {


  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/home" replace/>}/>
        <Route path="/home" element={<Home />} />
        <Route path="chapter/:chapter_id" element={<FullChapter/>}/>
      </Routes>
    </Router>
  )
}

export default App
