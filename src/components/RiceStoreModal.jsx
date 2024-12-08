import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import './Components.css';

function RiceStoreModal({ isOpen, onClose, task, onSave, onDelete, isNewTask }) {
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [dateTimeCreated, setDateTimeCreated] = useState('');
  const [dateTimeDeadline, setDateTimeDeadline] = useState('');
  const [additionalResources, setAdditionalResources] = useState('');

  // Reset state when task file changes or modal opens
  useEffect(() => {
    if (isOpen) {
      setTitle(task.title || '');
      setNotes(task.notes || '');
      setDateTimeCreated(task.dateTimeCreated || '');
      setDateTimeDeadline(task.dateTimeDeadline || '');
      setAdditionalResources(task.additionalResources || '');
    }
  }, [isOpen, task]);

  const handleSave = () => {
    // Validate title for new tasks
    if (isNewTask && !title.trim()) {
      alert('Please enter a task title');
      return;
    }

    onSave({
      ...task,
      title,
      notes,
      dateTimeCreated,
      dateTimeDeadline,
      additionalResources
    });
  };

  const handleDelete = () => {
    // Confirm deletion to prevent accidental removal
    const confirmDelete = window.confirm('Are you sure you want to delete this task?');
    if (confirmDelete) {
      onDelete(task);
    }
  };

  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          {isNewTask ? (
            <input 
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter task title..."
              className="new-task-title"
            />
          ) : (
            <h2>{task.title}</h2>
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
            <h3>Date & Time Created</h3>
            <div className="timestamp-display">
                {dateTimeCreated 
                ? new Date(dateTimeCreated).toLocaleString() 
                : 'No creation time'}
            </div>
          </div>

          <div className="modal-section">
            <h3>Date & Time Deadline</h3>
            <input
                type="datetime-local"
                value={dateTimeDeadline}
                onChange={(e) => setDateTimeDeadline(e.target.value)}
                className="deadline-input"
            />
            </div>

          <div className="modal-section">
            <h3>Additional Resources</h3>
            <textarea
              value={additionalResources}
              onChange={(e) => setAdditionalResources(e.target.value)}
              placeholder="Add additional resources here..."
              rows={6}
            />
          </div>
        </div>

        <div className="modal-footer">
          {!isNewTask && (
            <button 
              onClick={handleDelete} 
              className="delete-button"
            >
              Delete Task
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

export default RiceStoreModal;
