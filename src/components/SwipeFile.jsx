import React, { useState, useEffect } from 'react';
import '../components/Components.css';
import SwipeModal from './SwipeModal';
import { auth, database } from '../firebase';
import { ref, push, set, onValue, remove } from 'firebase/database';

function SwipeFile() {
  const [ideas, setIdeas] = useState([]);
  const [selectedIdea, setSelectedIdea] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAddingNewIdea, setIsAddingNewIdea] = useState(false);

  useEffect(() => {
    // Check if user is logged in
    const user = auth.currentUser;
    if (!user) return;

    // Reference to user's ideas in the database
    const ideasRef = ref(database, `users/${user.uid}/ideas`);

    // Listen for changes in ideas
    const unsubscribe = onValue(ideasRef, (snapshot) => {
      const ideasData = snapshot.val();
      if (ideasData) {
        // Convert ideas object to array
        const ideasList = Object.keys(ideasData).map(key => ({
          ...ideasData[key],
          firebaseId: key
        }));
        setIdeas(ideasList);
      } else {
        setIdeas([]);
      }
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  const handleIdeaClick = (idea) => {
    setSelectedIdea(idea);
    setIsAddingNewIdea(false);
    setIsModalOpen(true);
  };
  
  const handleAddNewIdea = (e) => {
    e.stopPropagation();
    const newIdea = {
      id: ideas.length + 1,
      title: '',
      notes: '',
      type: 'Tweet',
      category: '',
      link: ''
    };
    setSelectedIdea(newIdea);
    setIsAddingNewIdea(true);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedIdea(null);
    setIsAddingNewIdea(false);
  };

  const handleSaveIdea = async (ideaData) => {
    const user = auth.currentUser;
    if (!user) return;

    const ideasRef = ref(database, `users/${user.uid}/ideas`);

    try {
      if (ideaData.firebaseId) {
        // Update existing idea
        await set(
          ref(database, `users/${user.uid}/ideas/${ideaData.firebaseId}`), 
          {
            title: ideaData.title,
            notes: ideaData.notes || '',
            type: ideaData.type || 'Tweet',
            category: ideaData.category || '',
            link: ideaData.link || ''
          }
        );
      } else {
        // Add new idea
        const newIdeaRef = push(ideasRef);
        await set(newIdeaRef, {
          title: ideaData.title,
          notes: ideaData.notes || '',
          type: ideaData.type || 'Tweet',
          category: ideaData.category || '',
          link: ideaData.link || ''
        });
      }
      handleCloseModal();
    } catch (error) {
      console.error('Error saving idea:', error);
    }
  };

  const handleDeleteIdea = async (ideaToDelete) => {
    const user = auth.currentUser;
    if (!user) return;

    try {
      // Remove idea from database
      await remove(
        ref(database, `users/${user.uid}/ideas/${ideaToDelete.firebaseId}`)
      );
      handleCloseModal();
    } catch (error) {
      console.error('Error deleting idea:', error);
    }
  };

  return (
    <div className="dashboard-card">
      <div className="drag-handle">
        <h2>Threads Swipe File</h2>
      </div>
      <div className="card-content">
        {ideas.map((idea) => (
          <div 
            key={idea.firebaseId} 
            className="info-box"
            onClick={(e) => { 
                e.stopPropagation();
                handleIdeaClick(idea);
                }}
          >
            <div className="idea-title">{idea.title}</div>
            <div className="idea-type">{idea.type}</div>
          </div>
        ))}
        <button 
          className="info-box add-more"
          onClick={handleAddNewIdea}
        >
          {ideas.length === 0 ? 'Add an idea...' : 'Add more ideas...'}
        </button>
      </div>

      {selectedIdea && (
        <SwipeModal 
        isOpen={isModalOpen} 
        onClose={handleCloseModal} 
        idea={selectedIdea} 
        onSave={handleSaveIdea} 
        onDelete={handleDeleteIdea} 
        isNewIdea={isAddingNewIdea} 
        />
    )}
    </div>
  );
}

export default SwipeFile;