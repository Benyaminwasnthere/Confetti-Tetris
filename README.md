# Confetti Tetris

## Overview

Confetti Tetris is a unique twist on the classic Tetris game. When tetrominoes land, they burst into confetti, introducing a visually stunning and engaging mechanic. The confetti pieces follow realistic physics, adding an extra layer of dynamism to the gameplay. Additionally, the game features a modified Breadth-First Search (BFS) algorithm to detect chains of the same-colored confetti stretching from the left to the right end of the board. Completing such chains deletes the chains, adds points to the score.

The game uses **Firebase** for backend services, **React** for the frontend, and **p5.js** for creating the interactive game experience.

Players can enjoy the game without logging in, but those who choose to log in with their Google accounts can have their high scores saved to the Firebase Realtime Database.

---

## Features

- **Confetti Physics**: Tetrominoes explode into colorful confetti upon landing, which behave according to realistic physics.
- **Chain Detection**: A custom BFS algorithm identifies chains of same-colored confetti spanning the board, triggering special bonuses and increasing the score.
- **Optional Google Sign-In**: Players can log in with Firebase Authentication for a personalized experience and high score tracking.
- **Realtime Database**: Firebase Realtime Database stores user data, including high scores, for logged-in users.
- **Interactive Gameplay**: A dynamic game built with p5.js.
- **Responsive UI**: Optimized for both desktop and mobile devices.
- **Automatic Score Saving**: Logged-in users' scores are saved only if they surpass their existing high score.
- **Automatic Deployment Pipeline**: Through simple GitHub push, which triggers building of the project, and automatic deployment to Firebase hosting.

---

## Game Rules

1. Users can play the game without logging in.
2. Move and rotate tetrominoes to fill rows and score points.
3. Tetrominoes burst into confetti when they land, introducing a new layer of gameplay.
4. A BFS algorithm detects same-colored chains of confetti, enabling combo scoring and chain deletions.
5. If a logged-in user’s current score exceeds their stored high score, the new score is saved automatically in Firebase.
6. The game ends if no valid moves are left, and players can restart to try again.

---

## Technologies Used

- **React**: Framework for building the UI and managing components.
- **Firebase**: Backend services for optional authentication, database, and hosting.
- **p5.js**: JavaScript library for rendering the game.
- **React Router**: Navigation between game and optional login pages.
- **CSS**: Styling for the application.


# Algorithms Involved

## 1. Confetti Physics

When a tetromino lands, it bursts into colorful confetti pieces.  
The confetti pieces follow realistic physics, including gravity and collisions.

## 2. Chain Detection

A modified BFS algorithm identifies chains of same-colored confetti extending from the left to the right end of the board.  
Completing such chains deletes the chains, adds points to the score.

## 3. Score Management

The game tracks the user’s score dynamically during gameplay.  
If a logged-in user’s score exceeds their current high score in Firebase, it updates automatically.

## 4. Database Interaction

Firebase Realtime Database stores user profiles and high scores under the `users` path.  
When a new user logs in, a record is created with their email and an initial high score of 0.
## 4. Authentication 

Firebase Authentication makes sure real users are logged in


# Build and Deployment

## Prerequisites

**You can skip steps 1 and 2 if you clone my project as it is.**

Before getting started, ensure you have the following installed:

- **Node.js**: [Download Node.js](https://nodejs.org/).
- **Firebase CLI**: Install globally by running:
  ```bash
  npm install -g firebase-tools
  ```
# Steps to Run Locally

1. **Clone the Repository**
   ```bash
   git clone <repository-url>
   cd <repository-folder>
2. **Install Dependencies**
   ```bash
   npm install
   ```
   
# Set Up Firebase

1. Go to [Firebase Console](https://console.firebase.google.com/).
2. Create a new project.
3. Enable Google Sign-In under **Authentication > Sign-In Methods** (optional).
4. Enable Realtime Database and set its rules to allow authenticated access.
5. Copy the Firebase configuration object from **Project Settings > General**.
6. Replace the placeholder configuration in `firebase.js` with your Firebase config.
7. Commit changes to your local repository.
8. Push Changes to Remote to initiate build and deploy process in github

# Firebase Configuration

```javascript
const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-auth-domain",
  databaseURL: "your-database-url",
  projectId: "your-project-id",
  storageBucket: "your-storage-bucket",
  messagingSenderId: "your-messaging-sender-id",
  appId: "your-app-id"
};
```
# Git Workflow: Make Changes and Push to Remote


Commit changes to your local repository using the following commands:

```bash
git add .
git commit -m "Your commit message"
```

# Push Changes to Remote

Once you're ready to share your changes with others, use `git push` to upload them to the remote repository:

```bash
git push origin branch-name
```
## Project demo
https://confetti-3b50f.web.app/game