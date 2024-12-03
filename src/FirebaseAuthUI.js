import React, { useEffect, useRef } from "react";
import StyledFirebaseAuth from "react-firebaseui/StyledFirebaseAuth";
import { auth, database } from "./firebase"; // Ensure correct imports for auth and database
import { GoogleAuthProvider } from "firebase/auth";
import { ref, set } from "firebase/database";
import { useNavigate } from "react-router-dom"; // Import useNavigate for navigation
import p5 from "p5";
import LOGOTET from "./LOGOTET.png"; // Import the image file

// FirebaseUI configuration for Google Sign-In
const uiConfig = {
  signInFlow: "popup", // Use the popup flow for sign-in
  signInOptions: [GoogleAuthProvider.PROVIDER_ID], // Google Sign-In
  callbacks: {
    signInSuccessWithAuthResult: (authResult) => {
      const email = authResult.user.email;
      const userId = authResult.user.uid; // Get the Firebase User ID (UID)

      // If it's a new user, add them to the database
      if (authResult.additionalUserInfo?.isNewUser) {
        console.log("New user detected. Adding to the database...");
        addUser(userId, email); // Add user to Firebase Database with their UID
      } else {
        console.log("Existing user signed in.");
      }

      return false; // Prevent redirect after sign-in
    },
  },
};

// Function to add a new user to Firebase Realtime Database
function addUser(userId, email) {
  const userRef = ref(database, `users/${userId}`); // Use the Firebase User UID as the key

  set(userRef, {
    email: email, // Store the email address
    highscore: 0, // Default high score
  })
    .then(() => console.log("User added successfully to the database."))
    .catch((error) => console.error("Error adding user:", error));
}

const FirebaseAuthUI = () => {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const navigate = useNavigate(); // Initialize navigate

  // Initialize p5.js canvas
  useEffect(() => {
    const sketch = (p) => {
      p.setup = () => {
        const canvas = p.createCanvas(310, 600);
        canvas.parent(canvasRef.current); // Attach canvas to the DOM
        p.background(0); // Black background
      };
    };

    const p5Instance = new p5(sketch, containerRef.current);

    // Cleanup on unmount
    return () => p5Instance.remove();
  }, []);

  // Function to handle "Play Now without Signing In" button click
  const handlePlayNow = () => {
    navigate("/game"); // Navigate to the game page without signing in
  };

  return (
    <div ref={containerRef}>
      <div ref={canvasRef} style={{ position: "relative" }}>
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "310px",
            height: "600px",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            flexDirection: "column", // Align content vertically
          }}
        >
          <div className="auth-container">
            {/* Display the image instead of the text */}
            <img
              src={LOGOTET}
              alt="Confetti Tetris Logo"
              style={{
                maxWidth: "100%",
                height: "auto",
                marginBottom: "20px", // Space between logo and sign-in
              }}
            />
            <StyledFirebaseAuth uiConfig={uiConfig} firebaseAuth={auth} />
            {/* "Play Now without Signing In" Button */}
            <button
              onClick={handlePlayNow}
              style={{
                width: "100%", // Match width with Google sign-in button
                padding: "15px", // Match padding with Google sign-in button
                marginTop: "10px", // Adjusted for closer spacing
                background: "linear-gradient(135deg, #4CAF50, #2E7D32)", // Green gradient
                color: "white",
                fontSize: "18px", // Larger font for better readability
                border: "none",
                borderRadius: "8px",
                boxShadow: "0 4px 10px rgba(0, 0, 0, 0.2)", // Soft shadow for depth
                cursor: "pointer",
                transition: "all 0.3s ease", // Smooth transition for hover effect
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = "scale(1.05)"; // Slightly enlarge on hover
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = "scale(1)"; // Reset size after hover
              }}
            >
              Play Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FirebaseAuthUI;
