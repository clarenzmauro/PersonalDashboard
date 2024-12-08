import React, { useState, useEffect } from 'react';
import '../components/Components.css';
import RiceStoreModal from './RiceStoreModal';
import { auth, database } from '../firebase';
import { ref, push, set, onValue, remove } from 'firebase/database';

function RiceStoreTasks() {
  const [tasks, setTasks] = useState([]);
  const [selectedTask, setSelectedTask] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAddingNewTask, setIsAddingNewTask] = useState(false);

  useEffect(() => {
    // Check if user is logged in
    const user = auth.currentUser;
    if (!user) return;

    // Reference to user's tasks in the database
    const tasksRef = ref(database, `users/${user.uid}/tasks`);

    // Listen for changes in tasks
    const unsubscribe = onValue(tasksRef, (snapshot) => {
      const tasksData = snapshot.val();
      if (tasksData) {
        // Convert tasks object to array
        const tasksList = Object.keys(tasksData).map(key => ({
          ...tasksData[key],
          firebaseId: key
        }));
        setTasks(tasksList);
      } else {
        setTasks([]);
      }
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  const handleTaskClick = (task) => {
    setSelectedTask(task);
    setIsAddingNewTask(false);
    setIsModalOpen(true);
  };
  
  const handleAddNewTask = (e) => {
    e.stopPropagation();
    const newTask = {
      id: tasks.length + 1,
      title: '',
      notes: '',
      dateTimeCreated: new Date().toISOString(),
      dateTimeDeadline: '',
      additionalResources: ''
    };
    setSelectedTask(newTask);
    setIsAddingNewTask(true);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedTask(null);
    setIsAddingNewTask(false);
  };

  const handleSaveTask = async (taskData) => {
    const user = auth.currentUser;
    if (!user) return;

    const tasksRef = ref(database, `users/${user.uid}/tasks`);

    try {
      if (taskData.firebaseId) {
        // Update existing task
        await set(
          ref(database, `users/${user.uid}/tasks/${taskData.firebaseId}`), 
          {
            title: taskData.title,
            notes: taskData.notes || '',
            dateTimeCreated: taskData.dateTimeCreated || new Date().toISOString(),
            dateTimeDeadline: taskData.dateTimeDeadline || '',
            additionalResources: taskData.additionalResources || ''
          }
        );
      } else {
        // Add new task
        const newTaskRef = push(tasksRef);
        await set(newTaskRef, {
          title: taskData.title,
          notes: taskData.notes || '',
          dateTimeCreated: taskData.dateTimeCreated || new Date().toISOString(),
          dateTimeDeadline: taskData.dateTimeDeadline || '',
          additionalResources: taskData.additionalResources || ''
        });
      }
      handleCloseModal();
    } catch (error) {
      console.error('Error saving task:', error);
    }
  };

  const handleDeleteTask = async (taskToDelete) => {
    const user = auth.currentUser;
    if (!user) return;

    try {
      // Remove task from database
      await remove(
        ref(database, `users/${user.uid}/tasks/${taskToDelete.firebaseId}`)
      );
      handleCloseModal();
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  return (
    <div className="dashboard-card">
      <div className="drag-handle">
        <h2>Rice Store Notes</h2>
      </div>
      <div className="card-content">
        {tasks.map((task) => (
          <div 
            key={task.firebaseId} 
            className="info-box"
            onClick={(e) => {
              e.stopPropagation();
              handleTaskClick(task);
            }}
          >
            <div className="task-title">{task.title}</div>
            <div className="task-due-date">{task.dateTimeDeadline}</div>
          </div>
        ))}
        <button 
          className="info-box add-more"
          onClick={handleAddNewTask}
        >
          Add more tasks...
        </button>
      </div>
      {selectedTask && (
        <RiceStoreModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          task={selectedTask}
          onSave={handleSaveTask}
          onDelete={handleDeleteTask}
          isNewTask={isAddingNewTask}
        />
      )}
    </div>
  );
}

export default RiceStoreTasks;
