import React from 'react';
import Dashboard from './components/Dashboard';
import { mockUser, mockProgressData } from './data/mockData';
import { DarkModeProvider } from './contexts/DarkModeContext';
import { GamificationProvider } from './contexts/GamificationContext';
import './App.css';

function App() {
  return (
    <DarkModeProvider>
      <GamificationProvider initialUser={mockUser}>
        <div className="App">
          <Dashboard user={mockUser} progressData={mockProgressData} />
        </div>
      </GamificationProvider>
    </DarkModeProvider>
  );
}

export default App;