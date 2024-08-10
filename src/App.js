// src/App.js

import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import WorkshopList from './components/WorkshopList';
import Questionnaire from './components/Questionnaire';
import Results from './components/Results';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<WorkshopList />} />
        <Route path="/questionnaire/:workshopId" element={<Questionnaire />} />
        <Route path="/results/:workshopId" element={<Results />} />
      </Routes>
    </Router>
  );
};

export default App;
