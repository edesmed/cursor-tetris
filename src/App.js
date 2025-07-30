import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Routes, Route, useLocation } from 'react-router-dom';
import { uiActions } from './store/uiSlice';
import { socketActions } from './store/socketSlice';
import Lobby from './components/Lobby';
import Game from './components/Game';
import ErrorBoundary from './components/ErrorBoundary';
import './App.css';

const App = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  const connected = useSelector(state => state.ui.connected);
  const error = useSelector(state => state.ui.error);

  useEffect(() => {
    // Connect to socket when app loads
    dispatch({ type: 'socket/connect' });
    
    return () => {
      dispatch({ type: 'socket/disconnect' });
    };
  }, [dispatch]);

  useEffect(() => {
    // Parse room and player name from URL
    const pathParts = location.pathname.split('/').filter(Boolean);
    if (pathParts.length >= 2) {
      const [room, playerName] = pathParts;
      if (room && playerName && connected) {
        dispatch({ 
          type: 'socket/joinGame', 
          payload: { room, playerName } 
        });
      }
    }
  }, [location, connected, dispatch]);

  const handleErrorClose = () => {
    dispatch(uiActions.clearError());
  };

  return (
    <ErrorBoundary>
      <div className="app">
        {error && (
          <div className="error-banner">
            <span>{error}</span>
            <button onClick={handleErrorClose}>×</button>
          </div>
        )}
        
        <Routes>
          <Route path="/" element={<Lobby />} />
          <Route path="/:room/:playerName" element={<Game />} />
        </Routes>
      </div>
    </ErrorBoundary>
  );
};

export default App; 