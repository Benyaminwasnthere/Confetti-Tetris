import React, { useEffect, useState } from "react";
import "./App.css";
import { Route, Routes, useNavigate, useLocation } from "react-router-dom";
import FirebaseAuthUI from "./FirebaseAuthUI";
import { auth } from "./firebase";
import { onAuthStateChanged } from "firebase/auth";
import Sketch from "./Sketch";
import Leaderboard from "./leaderboard";
import About from "./About"; // Import About component

// Function to handle navigation for both click and touch events
function handleNavigation(path, navigate) {
  return (event) => {
    event.preventDefault(); // Prevent unwanted behavior
    console.log(`${path} clicked`);
    navigate(path);
  };
}

// Navbar component for navigation
function Navbar({ onSignOut, userEmail }) {
  const navigate = useNavigate();
  const location = useLocation();

  // Only render the navbar if not on the root page or the about page
  if (location.pathname === "/" || location.pathname === "/about") {
    return null; // No buttons when on login or about page
  }

  return (
    <div className="navbar">
      {/* Conditionally render "Go to Game" button */}
      {location.pathname !== "/game" && (
        <button onClick={handleNavigation("/game", navigate)} onTouchEnd={handleNavigation("/game", navigate)}>
          Go to Game
        </button>
      )}
      {/* Conditionally render "Leaderboard" button */}
      {location.pathname !== "/leaderboard" && (
        <button onClick={handleNavigation("/leaderboard", navigate)} onTouchEnd={handleNavigation("/leaderboard", navigate)}>
          Leaderboard
        </button>
      )}
      {/* Conditionally render "About" button */}
      {location.pathname !== "/about" && (
        <button onClick={handleNavigation("/about", navigate)} onTouchEnd={handleNavigation("/about", navigate)}>
          About
        </button>
      )}
      {/* Sign Out / Log In button */}
      <button
        onClick={() => {
          console.log(userEmail ? "Sign Out clicked" : "Log In clicked");
          onSignOut();
        }}
        onTouchEnd={() => {
          console.log(userEmail ? "Sign Out touched" : "Log In touched");
          onSignOut();
        }}
      >
        {userEmail ? "Sign Out" : "Log In"}
      </button>
    </div>
  );
}

// AboutNav component for specific buttons on the About page
function AboutNav({ onSignOut, userEmail }) {
  const navigate = useNavigate();

  return (
    <div className="navbar">
      {/* Back to Game Button */}
      <button onClick={handleNavigation("/game", navigate)} onTouchEnd={handleNavigation("/game", navigate)}>
        Back to Game
      </button>

      {/* Leaderboard Button */}
      <button onClick={handleNavigation("/leaderboard", navigate)} onTouchEnd={handleNavigation("/leaderboard", navigate)}>
        Leaderboard
      </button>

      {/* Sign Out / Log In Button */}
      <button
        onClick={() => {
          console.log(userEmail ? "Sign Out clicked" : "Log In clicked");
          onSignOut();
        }}
        onTouchEnd={() => {
          console.log(userEmail ? "Sign Out touched" : "Log In touched");
          onSignOut();
        }}
      >
        {userEmail ? "Sign Out" : "Log In"}
      </button>
    </div>
  );
}

function App() {
  const [userEmail, setUserEmail] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Disable back navigation
    const handleBeforeUnload = (event) => {
      event.preventDefault();
      event.returnValue = "";
    };

    window.history.pushState(null, "", window.location.href); // Push a state to the history stack
    window.onpopstate = () => {
      window.history.pushState(null, "", window.location.href); // Revert back to the current URL
    };

    // Set up authentication state listener
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserEmail(user.email);
        document.title = `Logged in as ${user.email}`;  // Fixed string interpolation

        // Prevent redirect if already on leaderboard or about page
        if (location.pathname !== "/leaderboard" && location.pathname !== "/about") {
          navigate("/game");
        }
      } else {
        setUserEmail(null);
        document.title = "Sign In";

        // Allow access to the leaderboard and about page even if not logged in
        if (location.pathname !== "/" && location.pathname !== "/leaderboard" && location.pathname !== "/about") {
          navigate("/game");
        }
      }
    });

    // Attach the event listener to prevent back navigation
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      unsubscribe();
      window.removeEventListener("beforeunload", handleBeforeUnload);
      window.onpopstate = null; // Clean up the event listener
    };
  }, [navigate, location.pathname]);

  const handleSignOut = () => {
    if (userEmail) {
      auth.signOut();
      navigate("/"); // Redirect to login if the user is signed out
    } else {
      navigate("/"); // Redirect to login if the user isn't logged in
    }
  };

  return (
    <div className="App-header">
      <div className="app-container">
        <Navbar onSignOut={handleSignOut} userEmail={userEmail} />
        <Routes>
          {/* Authentication Route */}
          <Route path="/" element={<FirebaseAuthUI />} />

          {/* Game Page */}
          <Route
            path="/game"
            element={
              <div className="game-container">
                <Sketch />
              </div>
            }
          />

          {/* Leaderboard Page */}
          <Route path="/leaderboard" element={<Leaderboard />} />

          {/* About Page with its own nav */}
          <Route
            path="/about"
            element={
              <div>
                <AboutNav onSignOut={handleSignOut} userEmail={userEmail} />
                <About />
              </div>
            }
          />
        </Routes>
      </div>
    </div>
  );
}

export default App;
