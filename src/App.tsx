import React from 'react';
import Dashboard from './components/Dashboard';
import Login from './components/Login';
import { mockProgressData } from './data/mockData';
import { DarkModeProvider } from './contexts/DarkModeContext';
import { AuthProvider, useAuth } from './AuthContext';
import './App.css';

function AppContent() {
  const { currentUser } = useAuth();

  if (!currentUser) {
    return <Login />;
  }

  // Convert Firebase user to our user format
  const user = {
    id: currentUser.uid,
    name: currentUser.displayName || 'User',
    email: currentUser.email || '',
    avatar: currentUser.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.displayName || 'User')}&background=3b82f6&color=fff`,
    studyGoals: {
      dailyFlashcards: 20,
      weeklyHours: 5
    }
  };

  return (
    <div className="App">
      <Dashboard user={user} progressData={mockProgressData} />
    </div>
  );
}

function App() {
  return (
    <DarkModeProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </DarkModeProvider>
  );
}

export default App;