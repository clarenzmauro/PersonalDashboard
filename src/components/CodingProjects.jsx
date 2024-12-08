import React, { useState, useEffect } from 'react';
import '../components/Components.css';
import ProjectModal from './ProjectModal';
import { auth, database } from '../firebase';
import { ref, push, set, onValue, remove } from 'firebase/database';

function CodingProjects() {
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAddingNewProject, setIsAddingNewProject] = useState(false);

  useEffect(() => {
    // Check if user is logged in
    const user = auth.currentUser;
    if (!user) return;

    // Reference to user's projects in the database
    const projectsRef = ref(database, `users/${user.uid}/projects`);

    // Listen for changes in projects
    const unsubscribe = onValue(projectsRef, (snapshot) => {
      const projectsData = snapshot.val();
      if (projectsData) {
        // Convert projects object to array
        const projectsList = Object.keys(projectsData).map(key => ({
          ...projectsData[key],
          firebaseId: key
        }));
        setProjects(projectsList);
      } else {
        setProjects([]);
      }
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  const handleSaveProject = async (projectData) => {
    const user = auth.currentUser;
    if (!user) return;

    const projectsRef = ref(database, `users/${user.uid}/projects`);

    try {
      if (projectData.firebaseId) {
        // Update existing project
        await set(
          ref(database, `users/${user.uid}/projects/${projectData.firebaseId}`), 
          {
            title: projectData.title,
            description: projectData.description || '',
            notes: projectData.notes || '',
            progress: projectData.progress || 'Incomplete',
            technologies: projectData.technologies || [],
            todos: projectData.todos || []
          }
        );
      } else {
        // Add new project
        const newProjectRef = push(projectsRef);
        await set(newProjectRef, {
          title: projectData.title,
          description: projectData.description || '',
          notes: projectData.notes || '',
          progress: projectData.progress || 'Incomplete',
          technologies: projectData.technologies || [],
          todos: projectData.todos || []
        });
      }
      handleCloseModal();
    } catch (error) {
      console.error('Error saving project:', error);
    }
  };

  const handleDeleteProject = async (projectToDelete) => {
    const user = auth.currentUser;
    if (!user) return;

    try {
      // Remove project from database
      await remove(
        ref(database, `users/${user.uid}/projects/${projectToDelete.firebaseId}`)
      );
      handleCloseModal();
    } catch (error) {
      console.error('Error deleting project:', error);
    }
  };

  const handleProjectClick = (project) => {
    setSelectedProject(project);
    setIsAddingNewProject(false);
    setIsModalOpen(true);
  };

  const handleAddNewProject = (e) => {
    e.stopPropagation();
    const newProject = {
      id: projects.length + 1,
      title: '',
      description: '',
      notes: '',
      progress: 'Incomplete',
      technologies: [],
      todos: []
    };
    setSelectedProject(newProject);
    setIsAddingNewProject(true);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedProject(null);
    setIsAddingNewProject(false);
  };

  return (
    <div className="dashboard-card">
      <div className="drag-handle">
        <h2>Coding Projects</h2>
      </div>
      <div className="card-content">
        {projects.map((project) => (
          <div 
            key={project.firebaseId} 
            className="info-box"
            onClick={(e) => {
              e.stopPropagation();
              handleProjectClick(project);
            }}
          >
            <div className="project-title">{project.title}</div>
            <div className="project-progress">{project.progress}</div>
          </div>
        ))}
        <button
          className="info-box add-more"
          onClick={handleAddNewProject}
        >
          {projects.length === 0 ? 'Add a project...' : 'Add more projects...'}
        </button>
      </div>

      {selectedProject && (
        <ProjectModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          project={selectedProject}
          onSave={handleSaveProject}
          onDelete={handleDeleteProject}
          isNewProject={isAddingNewProject}
        />
      )}
    </div>
  );
}

export default CodingProjects;