import React, { useEffect, useRef, useState } from "react";
import p5 from "p5";
import { ref, get } from "firebase/database";
import { database } from "./firebase";  // Adjust the path if needed

const Leaderboard = () => {
  const [leaderboard, setLeaderboard] = useState([]);  // State to store leaderboard data
  const canvasRef = useRef(null);

  // Function to load leaderboard data from Firebase
  function loadLeaderboard() {
    const leaderboardRef = ref(database, "users");
    get(leaderboardRef)
      .then((snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.val();
          let leaderboardData = Object.keys(data).map((key) => ({
            email: data[key].email,
            score: data[key].highscore,
          }));

          // Sort leaderboard by score in descending order
          leaderboardData.sort((a, b) => b.score - a.score);

          // Limit to top 10
          setLeaderboard(leaderboardData.slice(0, 10));  // Update state with top 10
        } else {
          console.log("No data available");
        }
      })
      .catch((error) => {
        console.error("Error fetching leaderboard data:", error);
      });
  }

  useEffect(() => {
    // Fetch leaderboard data from Firebase
    loadLeaderboard();

    // Create the p5.js instance
    const p5Instance = new p5((sketch) => {
      sketch.setup = () => {
        sketch.createCanvas(310, 600);  // Set canvas size
        sketch.noLoop();  // Only draw once
      };

      sketch.draw = () => {
        sketch.background(0);  // Set background to black

        // Draw leaderboard border
        drawBorder();

        // Only draw leaderboard if there is data
        if (leaderboard.length > 0) {
          // Draw leaderboard
          drawLeaderboard();
        }
      };

      // Function to draw leaderboard border
      function drawBorder() {
        sketch.noFill();
        sketch.stroke(170);  // White color for the border
        sketch.strokeWeight(3);  // Set border thickness
        sketch.rect(10, 60, sketch.width - 20, sketch.height - 120);  // Draw a rectangle with padding
      }

      // Function to draw leaderboard on the canvas
      function drawLeaderboard() {
        sketch.textAlign(sketch.CENTER);  // Align text to the center horizontally
        sketch.fill(255);  // Set text color to white for better contrast on black background
        sketch.textFont("Arial");

        // Draw header
        sketch.textSize(24);
        sketch.fill(255, 0, 100);  // Gold color for the header
        sketch.text("Leaderboard", sketch.width / 2, 40);

        // Set max width for the email text (considering padding)
        let maxWidth = sketch.width - 40; // Subtracting padding for margins
        let maxHeight = sketch.height - 120; // Subtracting top and bottom margins
        let yPos = 80;  // Initial vertical position
        let padding = 10;  // Padding between text and border

        // Calculate the font size that fits both horizontally and vertically
        let fontSize = calculateFontSize(maxWidth, maxHeight, leaderboard.length);

        // Loop through leaderboard and render each entry
        for (let i = 0; i < leaderboard.length; i++) {
          let entryText = `${i + 1}. ${leaderboard[i].email}: ${leaderboard[i].score}`;

          // Draw the text centered
          sketch.textSize(fontSize);
          sketch.fill(i < 3 ? sketch.color(sketch.random(255), sketch.random(255), sketch.random(255)) : sketch.color(255, 0, 0));  // Random color for top 3

          // Draw the text and update the vertical position
          sketch.text(entryText, sketch.width / 2, yPos);
          yPos += fontSize + padding;  // Adjust vertical spacing based on font size
        }
      }

      // Function to calculate font size based on available space
      function calculateFontSize(maxWidth, maxHeight, entriesCount) {
        let baseFontSize = 20;  // Base font size to start from

        // Max width the text can take (considering 10px padding)
        let widthScale = maxWidth / sketch.textWidth("100. example@example.com: 99999"); // Sample text width

        // Max height the text can take (based on the number of entries and 10px padding between entries)
        let heightScale = (maxHeight - (entriesCount - 1) * 10) / (entriesCount * baseFontSize);

        // Choose the smaller scale to ensure both width and height fit
        let fontSize = Math.min(baseFontSize * widthScale, baseFontSize * heightScale);

        // Ensure the font size isn't too small (minimum font size of 12)
        return Math.max(fontSize, 12);
      }

    }, canvasRef.current);

    // Cleanup the p5 instance on component unmount
    return () => {
      p5Instance.remove();
    };
  }, [leaderboard]); // Re-run effect when leaderboard data changes

  return (
    <div className="leaderboard-container">
      <div ref={canvasRef}></div>
    </div>
  );
};

export default Leaderboard;
