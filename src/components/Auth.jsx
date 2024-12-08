import React, { useState } from 'react';
import { auth, database } from '../firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { ref, set } from 'firebase/database';
import './Components.css';

function Auth() {
  const [isRegistering, setIsRegistering] = useState(false);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      if (isRegistering) {
        // Check if passwords match
        if (password !== confirmPassword) {
          throw new Error('Passwords do not match');
        }
        
        // Register new user
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const userId = userCredential.user.uid;
        
        try {
          // Save username to Realtime Database
          const userRef = ref(database, 'users/' + userId);
          await set(userRef, {
            username: username,
            email: email,
            createdAt: new Date().toISOString()
          });
        } catch (dbError) {
          console.error('Database Error:', dbError);
          setError('Failed to save user data. Please try again.');
          // Optionally delete the auth user if db save fails
          await userCredential.user.delete();
          throw dbError;
        }
      } else {
        // Login existing user
        await signInWithEmailAndPassword(auth, email, password);
      }
    } catch (error) {
      console.error('Auth Error:', error);
      setError(error.message);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1>Personal Dashboard</h1>
        <form onSubmit={handleSubmit} className="auth-form">
          {isRegistering && (
            <div className="form-group">
              <label>Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
          )}
          
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {isRegistering && (
            <div className="form-group">
              <label>Confirm Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
          )}

          {error && <div className="error-message">{error}</div>}

          <button type="submit" className="auth-button">
            {isRegistering ? 'Register' : 'Login'}
          </button>
        </form>

        <div className="auth-footer">
          <button
            className="switch-auth-mode"
            onClick={() => setIsRegistering(!isRegistering)}
          >
            {isRegistering
              ? 'Already have an account? Login'
              : "Don't have an account? Register"}
          </button>
        </div>

        <div className="auth-info">
          <div className="info-section">
            <h3>Created by</h3>
            <p>Clarenz Mauro</p>
            <p>m27oflegend@gmail.com</p>
          </div>

          <div className="info-section">
            <h3>Written Using</h3>
            <p>HTML, CSS, React</p>
          </div>

          <div className="info-section">
            <h3>Tools Used</h3>
            <p>ChatGPT</p>
            <p>Windsurf</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Auth;
