import React from 'react';
import { ReactP5Wrapper } from 'react-p5-wrapper';

// The p5.js sketch code
function sketch(p) {
  p.setup = () => {
    p.createCanvas(310, 600);
    p.background(0); // Set background color to dark gray

    p.noStroke(); // Disable stroke for text and shapes
    p.fill(255); // White text

    // Title styling
    p.textSize(24);
    p.textAlign(p.CENTER, p.TOP);
    p.fill(255, 200, 0); // Gold color for the title
    p.textFont('Georgia')
    p.text("Confetti Tetris", p.width / 2, 20);

    // Add a decorative line under the title
    p.stroke(255, 200, 0);
    p.strokeWeight(2);
    p.line(50, 50, p.width - 50, 50);

    // Reset styling for instructions
    p.noStroke();
    p.fill(255);
    p.textSize(12);
    p.textAlign(p.LEFT, p.TOP);

    // Display game instructions
    let instructions = [
      "Mouse or Touch Input:",
      "- Swipe Left or Right: Move the tetromino left or right.",
      "- Swipe Up: Rotate the tetromino.",
      "- Swipe Down: Move the tetromino down faster.",
      "",
      "Keyboard Controls:",
      "  - Left Arrow: Move the tetromino to the left.",
      "  - Right Arrow: Move the tetromino to the right.",
      "  - Down Arrow: Drop the tetromino quickly.",
      "  - Up Arrow: Rotate the tetromino clockwise.",
      "  - R Key: Reset the game.",
      "",
      "Start the Game:",
      "- Click \"ENTER/PRESS TO START\" to begin.",
      "",
      "Scoring:",
      "- Fill rows to clear them and earn points.",
      "- Chain reactions earn bonus points.",
      "",
      "Game Over:",
      "- The game ends if a tetromino cannot be placed.",
      "",
      "Additional Features:",
      "- Highscore tracking: Beat your highscore and save it!",
      "- Leaderboard: Saves the top 10 global highscores"
    ];

    // Display instructions with spacing and sections
    let lineHeight = 18;
    let yOffset = 70; // Start below the decorative line
    for (let i = 0; i < instructions.length; i++) {
      if (instructions[i] === "") {
        yOffset += 8; // Add extra space for empty lines
      } else if (instructions[i].endsWith(":")) {
        p.fill(150, 200, 255); // Highlight section headers in light blue
        p.text(instructions[i], 10, yOffset);
      } else {
        p.fill(255); // Normal text in white
        p.text(instructions[i], 10, yOffset);
      }
      yOffset += lineHeight;
    }

    // Add a footer for aesthetics
    p.fill(255, 200, 0, 80); // Semi-transparent gold color
    p.rect(0, p.height - 30, p.width, 30);
    p.fill(255);
    p.textSize(10);
    p.textAlign(p.CENTER, p.CENTER);
    p.text("Designed by Benyamin Plaksienko", p.width / 2, p.height - 15);
  };

  p.draw = () => {
    // The p5.js `draw` function can be left empty if we only need static rendering.
  };
}

function About() {
  return (
    <div className="about-container">

      <ReactP5Wrapper sketch={sketch} />
    </div>
  );
}

export default About;
