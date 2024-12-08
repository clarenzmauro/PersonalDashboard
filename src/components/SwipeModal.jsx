import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import './Components.css';

function SwipeModal({ isOpen, onClose, idea, onSave, onDelete, isNewIdea }) {
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [type, setType] = useState('Tweet');
  const [link, setLink] = useState('');
  const [category, setCategory] = useState('');

  // Reset state when idea file changes or modal opens
  useEffect(() => {
    if (isOpen) {
      setTitle(idea.title || '');
      setNotes(idea.notes || '');
      setType(idea.type || 'Tweet');
      setCategory(idea.category || '');
      setLink(idea.link || '');
    }
  }, [isOpen, idea]);

  const handleSave = () => {
    // Validate title for new ideas
    if (isNewIdea && !title.trim()) {
      alert('Please enter an idea title');
      return;
    }

    onSave({
      ...idea,
      title,
      notes,
      type,
      category,
      link
    });
  };

  const handleDelete = () => {
    // Confirm deletion to prevent accidental removal
    const confirmDelete = window.confirm('Are you sure you want to delete this idea?');
    if (confirmDelete) {
      onDelete(idea);
    }
  };

  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          {isNewIdea ? (
            <input 
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter idea title"
              className="new-idea-title"
            />
          ) : (
            <h2>{idea.title}</h2>
          )}
          <button className="close-button" onClick={onClose}>X</button>
        </div>
        
        <div className="modal-body">
          <div className="modal-section">
            <h3>Notes</h3>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add your notes here..."
              rows={6}
            />
          </div>

          <div className="modal-section">
            <h3>Type</h3>
            <select 
              value={type} 
              onChange={(e) => setType(e.target.value)}
            >
              <option value="Tweet">Tweet</option>
              <option value="Thread">Thread</option>
            </select>
          </div>

          <div className="modal-section">
            <h3>Category</h3>
            <textarea
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="Add the category here..."
              rows={6}
            />
          </div>

          <div className="modal-section">
            <h3>Link</h3>
            <textarea
              type="text"
              value={link}
              onChange={(e) => setLink(e.target.value)}
              placeholder="Add the link here..."
              rows={6}
            />
          </div>
        </div>

        <div className="modal-footer">
          {!isNewIdea && (
            <button 
              onClick={handleDelete} 
              className="delete-button"
            >
              Delete Idea
            </button>
          )}
          <button onClick={handleSave} className="save-button">
            Save Changes
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

export default SwipeModal;
