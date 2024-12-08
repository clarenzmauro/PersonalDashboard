import React, { useState, useEffect } from 'react';
import { Responsive, WidthProvider } from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import './App.css';
import CodingProjects from './components/CodingProjects';
import SwipeFile from './components/SwipeFile';
import RiceStoreTasks from './components/RiceStoreTasks';
import ReactDOM from 'react-dom';
import { auth, database } from './firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { ref, onValue } from 'firebase/database';
import Auth from './components/Auth';

const ResponsiveGridLayout = WidthProvider(Responsive);

function App() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [layouts, setLayouts] = useState({
    lg: [
      { i: 'projects', x: 0, y: 0, w: 4, h: 13 },
      { i: 'swipe', x: 4, y: 0, w: 4, h: 13 },
      { i: 'tasks', x: 8, y: 0, w: 4, h: 13 }
    ]
  });
  const [user, setUser] = useState(null);
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(true);

  // Store the initial layout to reset to
  const initialLayout = {
    lg: [
      { i: 'projects', x: 0, y: 0, w: 4, h: 13 },
      { i: 'swipe', x: 4, y: 0, w: 4, h: 13 },
      { i: 'tasks', x: 8, y: 0, w: 4, h: 13 }
    ]
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => {
      clearInterval(timer);
    };
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      
      if (currentUser) {
        // Fetch username from Realtime Database
        const userRef = ref(database, 'users/' + currentUser.uid);
        onValue(userRef, (snapshot) => {
          const userData = snapshot.val();
          if (userData) {
            setUsername(userData.username);
          }
        });
      } else {
        setUsername('');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const formattedTime = currentTime.toLocaleString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    month: '2-digit',
    day: '2-digit',
    year: '2-digit'
  });

  const onLayoutChange = (layout, layouts) => {
    setLayouts(layouts);
  };

  const resetLayout = () => {
    setLayouts(initialLayout);
  };

  // Check if the current layout is different from the initial layout
  const isLayoutChanged = React.useMemo(() => {
    if (!layouts.lg || !initialLayout.lg) return false;
    
    return layouts.lg.some((currentItem, index) => {
      const initialItem = initialLayout.lg[index];
      return (
        currentItem.x !== initialItem.x ||
        currentItem.y !== initialItem.y ||
        currentItem.w !== initialItem.w ||
        currentItem.h !== initialItem.h
      );
    });
  }, [layouts, initialLayout]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      // Note: onAuthStateChanged in useEffect will handle setting user to null
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Auth />;
  }

  return (
    <div className="app">
      <div className="header">
        <div className="time">{formattedTime}</div>
        <div className="logout">
          {isLayoutChanged && (
            <button 
              className="reset-layout-btn" 
              onClick={resetLayout}
            >
              Reset Layout
            </button>
          )}
          {username && <span>{username}</span>}
          <div 
            className="logout-circle" 
            onClick={handleLogout}
            role="button"
            tabIndex={0}
            onKeyPress={(e) => e.key === 'Enter' && handleLogout()}
          >
            Logout
          </div>
        </div>
      </div>
      <ResponsiveGridLayout
        className="layout"
        layouts={layouts}
        breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480 }}
        cols={{ lg: 12, md: 10, sm: 6, xs: 4 }}
        onLayoutChange={onLayoutChange}
        isDraggable={true}
        isResizable={true}
        compactType="vertical"
        preventCollision={false}
        autoSize={true}
        rowHeight={50}
        margin={[10, 10]}
        draggableHandle=".drag-handle"
      >
        <div key="projects" className="dashboard-card-container">
          <CodingProjects />
        </div>
        <div key="swipe" className="dashboard-card-container">
          <SwipeFile />
        </div>
        <div key="tasks" className="dashboard-card-container">
          <RiceStoreTasks />
        </div>
      </ResponsiveGridLayout>
    </div>
  );
}

export default App;
