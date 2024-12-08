import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import './Components.css';

function ProjectModal({ isOpen, onClose, project, onSave, onDelete, isNewProject }) {
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [progress, setProgress] = useState('Incomplete');
  const [todos, setTodos] = useState([]);
  const [newTodo, setNewTodo] = useState('');

  // Reset state when project changes or modal opens
  useEffect(() => {
    if (isOpen) {
      setTitle(project.title || '');
      setNotes(project.notes || '');
      setProgress(project.progress || 'Incomplete');
      setTodos(project.todos || []);
    }
  }, [isOpen, project]);

  const handleSave = () => {
    // Validate title for new projects
    if (isNewProject && !title.trim()) {
      alert('Please enter a project title');
      return;
    }

    onSave({
      ...project,
      title,
      notes,
      progress,
      todos
    });
  };

  const handleDelete = () => {
    // Confirm deletion to prevent accidental removal
    const confirmDelete = window.confirm('Are you sure you want to delete this project?');
    if (confirmDelete) {
      onDelete(project);
    }
  };

  const addTodo = (e) => {
    e.preventDefault();
    if (newTodo.trim()) {
      setTodos([...todos, newTodo.trim()]);
      setNewTodo('');
    }
  };

  const removeTodo = (index) => {
    setTodos(todos.filter((_, i) => i !== index));
  };

  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          {isNewProject ? (
            <input 
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter project title"
              className="new-project-title"
            />
          ) : (
            <h2>{project.title}</h2>
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
            <h3>Progress</h3>
            <select 
              value={progress} 
              onChange={(e) => setProgress(e.target.value)}
            >
              <option value="Incomplete">Incomplete</option>
              <option value="In Progress">In Progress</option>
              <option value="Complete">Complete</option>
            </select>
          </div>

          <div className="modal-section">
            <h3>To-do</h3>
            <form onSubmit={addTodo} className="todo-form">
              <input
                type="text"
                value={newTodo}
                onChange={(e) => setNewTodo(e.target.value)}
                placeholder="Add new todo..."
              />
              <button type="submit">Add</button>
            </form>
            <ul className="todo-list">
              {todos.map((todo, index) => (
                <li key={index}>
                  {todo}
                  <button 
                    onClick={() => removeTodo(index)}
                    className="remove-todo"
                  >
                    ×
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="modal-footer">
          {!isNewProject && (
            <button 
              onClick={handleDelete} 
              className="delete-button"
            >
              Delete Project
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

export default ProjectModal;
