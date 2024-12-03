import React from 'react';
import { ReactP5Wrapper } from 'react-p5-wrapper'; // Corrected import
import p5 from 'p5';
import { database, auth } from './firebase'; // Make sure you're importing Firebase config
import { ref, get, update } from 'firebase/database';
import  { useEffect, useState } from 'react';

// Define your p5.js sketch
const sketch = (p5) => {
//----------------------------
// The grid and tetromino
let gameOver = false;
let finalScore = 0; // Variable to store the final score when the game ends
let score = 0;
let scales = 5;
let grid, velocityGrid;
let w = 5; // Cell size
let cols, rows;
let tetromino, position, hueValue;
let gravity = 0.1;
let timeSinceLastDrop = 0;
let dropInterval = 10; // milliseconds
let visited = [];
let colors = [0,50,270,150,200];
let startButton; // Variable for the start button
let gameStarted = false; // Flag to track if the game has started

let chainCheckInterval = 20; // Check chains every 30 frames
let framesSinceLastChainCheck = 0;
// Variables for touch controls
let touchStart = { x: 0, y: 0 }; // To track initial touch position

let bgImage; // Variable to store the background GIF

//----------------------------
const swipeThreshold = 25;  // Adjust this value to make the swipe less sensitive

p5.touchStarted = (e) => {
  if (e.touches && e.touches.length > 0) {
    touchStart.x = e.touches[0].clientX;
    touchStart.y = e.touches[0].clientY;
  } else {
    //console.log("No valid touches detected in touchStarted");
  }
  return false; // Prevent default
};

p5.touchMoved = (e) => {
  if (e.touches && e.touches.length > 0) {
    let dx = e.touches[0].clientX - touchStart.x;
    let dy = e.touches[0].clientY - touchStart.y;

    // Horizontal swipe: Move left or right
    if (Math.abs(dx) > Math.abs(dy)) {
      if (dx > 0) {
        moveTetromino(1, 0); // Move right
      } else {
        moveTetromino(-1, 0); // Move left
      }
    }
    // Vertical swipe: Rotate on swipe up if the swipe is larger than the threshold
    else {
      if (dy < -swipeThreshold) { // Only rotate if the swipe is up and exceeds threshold
        rotateTetromino(); // Rotate on swipe up
      } else if (dy > 0) {
        moveTetromino(0, 1); // Move down
      }
    }

    touchStart.x = e.touches[0].clientX;
    touchStart.y = e.touches[0].clientY;
  } else {
    //console.log("No valid touches detected in touchMoved");
  }
  return false; // Prevent default
};

p5.touchEnded = (e) => {
  return false; // Prevent default
};




   // Function to create a 2D array with default values
   function make2DArray(cols, rows) {
     let arr = new Array(cols);
     for (let i = 0; i < arr.length; i++) {
       arr[i] = new Array(rows).fill({ occupied: false, color: 0 }); // Initially empty cells with no color
     }
     return arr;
   }

   // Function to create a new Tetromino
   function createNewTetromino() {
     const tetrominos = [
       { shape: getLetterShape("P"), color: 0 },  // P
       { shape: getLetterShape("A"), color: 50 }, // A
       { shape: getLetterShape("R"), color: 270 },// R
       { shape: getLetterShape("T"), color: 150 },// T
       { shape: getLetterShape("Y"), color: 200 },// Y
     ];

     const randomTetromino = p5.random(tetrominos); // Get a random Tetromino from the list
     tetromino = scaleTetromino(randomTetromino.shape, scales); // Scale the tetromino
     hueValue = randomTetromino.color;
     position = { x: p5.floor(cols / 2) - 1, y: 0 }; // Initial position
   }

   // Function to get the letter shape for "P", "A", "R", "T", "Y"
   function getLetterShape(letter) {
     switch (letter) {
       case "P":
         return [
           [1, 1, 1],
           [1, 0, 1],
           [1, 1, 1],
           [0, 0, 1],
           [0, 0, 1]
         ];
       case "A":
         return [
           [0, 1, 0],
           [1, 0, 1],
           [1, 1, 1],
           [1, 0, 1],
           [1, 0, 1]
         ];
       case "R":
         return [
           [1, 1, 1],
           [1, 0, 1],
           [0, 1, 1],
           [1, 0, 1],
           [1, 0, 1]
         ];
       case "T":
         return [
           [1, 1, 1],
           [0, 1, 0],
           [0, 1, 0],
           [0, 1, 0],
           [0, 1, 0]
         ];
       case "Y":
         return [
           [1, 0, 1],
           [1, 0, 1],
           [0, 1, 0],
           [0, 1, 0],
           [0, 1, 0]
         ];
       default:
         return []; // Empty array for unsupported letters
     }
   }

   // Function to scale the tetromino
   function scaleTetromino(shape, scale) {
     let scaledTetromino = [];

     for (let i = 0; i < shape.length; i++) {
       let newRow = [];

       // Scale horizontally
       for (let j = 0; j < shape[i].length; j++) {
         // If the original cell is occupied (1), replicate it 'scale' times horizontally
         for (let x = 0; x < scale; x++) {
           newRow.push(shape[i][j]); // Keep the same value (either 0 or 1)
         }
       }

       // Add the row 'scale' times vertically to scale the tetromino
       for (let y = 0; y < scale; y++) {
         scaledTetromino.push(newRow.slice()); // Use .slice() to avoid reference issues
       }
     }

     return scaledTetromino;
   }
    const width = 310;
    const height = 600;
   // Setup function to initialize grid dimensions and create canvas



   p5.setup = () => {






     p5.createCanvas(310, 600);  // Set the size of the canvas
     p5.colorMode(p5.HSB); // Use HSB for colorful pieces
     cols = p5.width / w;
     rows = p5.height / w;
     grid = make2DArray(cols, rows); // Initialize grid
     velocityGrid = make2DArray(cols, rows); // Initialize velocity grid
     createNewTetromino(); // Create the first Tetromino
     visited = new Array(cols).fill(null).map(() => new Array(rows).fill(false)); // Initialize visited grid
     startButton = { x: width / 2 - 50, y: height / 2 - 25, width: 100, height: 50 };




   };

   function applySandPhysics() {
     let nextGrid = make2DArray(cols, rows);
     let nextVelocityGrid = make2DArray(cols, rows);

     for (let i = 0; i < cols; i++) {
       for (let j = rows - 1; j >= 0; j--) {
         if (grid[i][j].occupied) {
           let state = grid[i][j];
           let velocity = 1; // Adjust for vertical velocity, if needed
           let moved = false;

           // Check if the block can fall further down
           let newPos = j + 1;
           if (newPos < rows && !grid[i][newPos].occupied) {
             // Move block down
             nextGrid[i][newPos] = {
               occupied: true,
               color: state.color
             };
             nextVelocityGrid[i][newPos] = velocity + gravity;
             moved = true;
           } else {
             // Check adjacent cells (left or right) for possible movement
             let dir = Math.random() < 0.5 ? -1 : 1; // Randomize direction (left or right)
             let belowA = -1, belowB = -1;

             // Check neighboring columns for available space, but also ensure j+1 is within bounds
             if (withinCols(i + dir) && j + 1 < rows) belowA = grid[i + dir][j + 1];
             if (withinCols(i - dir) && j + 1 < rows) belowB = grid[i - dir][j + 1];

             if (belowA === undefined || belowA.occupied === false) {
               nextGrid[i + dir][j + 1] = {
                 occupied: true,
                 color: state.color
               };
               nextVelocityGrid[i + dir][j + 1] = velocity + gravity;
               moved = true;
             } else if (belowB === undefined || belowB.occupied === false) {
               nextGrid[i - dir][j + 1] = {
                 occupied: true,
                 color: state.color
               };
               nextVelocityGrid[i - dir][j + 1] = velocity + gravity;
               moved = true;
             }
           }

           // If no movement occurred, keep the block in place
           if (!moved) {
             nextGrid[i][j] = grid[i][j];
             nextVelocityGrid[i][j] = velocity + gravity;
           }
         }
       }
     }

     // Update the grid and velocity grid after the physics simulation
     grid = nextGrid;
     velocityGrid = nextVelocityGrid;
   }

   // Helper function to check if the column index is valid
   function withinCols(index) {
     return index >= 0 && index < cols;
   }
    //---------------------------------------
     // Draw the start button
     function drawStartButton() {
       p5.fill(0, 0, 0); // Green color for the button
       p5.rect(startButton.x, startButton.y, startButton.width, startButton.height);
       p5.fill(255); // White text color
       p5.textSize(18);
       p5.textAlign(p5.CENTER, p5.CENTER);

       if (gameOver) {
         // If game is over, display Game Over and Final Score on top of the start text
         p5.textSize(24); // Larger text for the Game Over and final score
         p5.text('Game Over', width / 2, height / 2.6);
         p5.textSize(18); // Reset text size for the score
         p5.text('Final Score: ' + finalScore, width / 2, height / 2.3);
         p5.text('ENTER/PRESS TO START', width / 2, height / 2);

       } else {
         // If the game is not over, display the "Press to Start" text
         p5.text('ENTER/PRESS TO START', width / 2, height / 2);
       }
     }

      // Detect mouse press on the start button
      p5.mousePressed = () => {
        if (!gameStarted && p5.mouseX > startButton.x && p5.mouseX < startButton.x + startButton.width &&
          p5.mouseY > startButton.y && p5.mouseY < startButton.y + startButton.height) {
          gameStarted = true; // Start the game
          gameOver=false
        }
      };
      p5.touchStarted = () => {
        if (!gameStarted && p5.mouseX > startButton.x && p5.mouseX < startButton.x + startButton.width &&
          p5.mouseY > startButton.y && p5.mouseY < startButton.y + startButton.height) {
          gameStarted = true; // Start the game
          gameOver=false
        }
        // Return true to prevent default touch behavior
        return false;
      };









    //---------------------------------------







  // Draw function to update and render the grid and tetromino
  p5.draw = () => {






    p5.background(0); // Clear the canvas each frame
    // Display score at the top-left corner
            p5.fill(255); // White text color
            p5.textSize(16);
            p5.textAlign(p5.LEFT, p5.TOP);
            p5.text(`Score: ${score}`, 10, 10); // Position it at the top-left corner
     if (gameStarted) {

    let now = p5.millis();
    if (now - timeSinceLastDrop > dropInterval) {
      moveTetromino(0, 1); // Move down
      timeSinceLastDrop = now;

      // Only check chains after a set number of frames
      if (framesSinceLastChainCheck >= chainCheckInterval) {
        findChains();
        framesSinceLastChainCheck = 0; // Reset the frame counter
      }
      framesSinceLastChainCheck++;
    }

    // Handle key presses for movement
    if (p5.keyIsPressed) {
      if (p5.keyCode === p5.LEFT_ARROW) {
        moveTetromino(-1, 0);
      } else if (p5.keyCode === p5.RIGHT_ARROW) {
        moveTetromino(1, 0);
      } else if (p5.keyCode === p5.DOWN_ARROW) {
        moveTetromino(0, 1);
      }
    }

    drawGrid();
    drawTetromino();
    applySandPhysics()
    }else {
           drawStartButton(); // Show the start button
         }
  };

  // Function to draw the grid
  function drawGrid() {
    for (let i = 0; i < cols; i++) {
      for (let j = 0; j < rows; j++) {
        if (grid[i][j].occupied) {
          p5.fill(grid[i][j].color, 255, 255); // Use the stored hue value for color
          p5.noStroke();
          p5.square(i * w, j * w, w);
        }
      }
    }
  }

  // Function to draw the tetromino
  function drawTetromino() {
    p5.fill(hueValue, 255, 255);
    p5.noStroke();
    for (let i = 0; i < tetromino.length; i++) {
      for (let j = 0; j < tetromino[i].length; j++) {
        if (tetromino[i][j] === 1) {
          p5.square((position.x + i) * w, (position.y + j) * w, w);
        }
      }
    }
  }

  // Function to move the tetromino
  function moveTetromino(dx, dy) {
    position.x += dx;
    position.y += dy;

    // Check for collision
    if (isColliding()) {
      position.x -= dx;
      position.y -= dy;
      if (dy > 0) {
        placeTetromino();
      }
    }
  }

  // Function to rotate the tetromino
function rotateTetromino() {
  if (!tetromino || tetromino.length === 0) return; // Safeguard for undefined or empty tetromino

  let newTetromino = tetromino[0].map((_, index) =>
    tetromino.map(row => row[index]).reverse()
  );

  let oldTetromino = tetromino;
  tetromino = newTetromino;

  if (isColliding()) {
    tetromino = oldTetromino; // Revert rotation on collision
  }
}

  // Function to check for collision
  function isColliding() {
    for (let i = 0; i < tetromino.length; i++) {
      for (let j = 0; j < tetromino[i].length; j++) {
        if (tetromino[i][j] === 1) {
          let x = position.x + i;
          let y = position.y + j;
          if (x < 0 || x >= cols || y >= rows || grid[x][y].occupied) {
            return true;
          }
        }
      }
    }
    return false;
  }

  function findChains() {
    visited = new Array(cols).fill(null).map(() => new Array(rows).fill(false));

    // Loop through each row to find chains starting from the leftmost column
    for (let j = 0; j < rows; j++) {
      // Start BFS from each leftmost column cell that is occupied
      if (grid[0][j].occupied && !visited[0][j]) {
        //console.log(`Attempting chain starting at (0, ${j})`);
        let result = bfs(0, j);

        // Log all connected blocks (chain) after BFS finishes
        if (result.success) {
          //console.log("Success! Chain spanning from left to right:");
          deleteChainParticles(result.chain);
          score+= Object.keys(result.chain).length;
        } else {
          //console.log("Chain did not span from left to right, but here are all connected blocks:");
        }
        //console.log(result.chain);
      }
    }
  }

  function bfs(startX, startY) {
    let queue = [];
    let chain = [];
    let startColor = grid[startX][startY].color; // Get the color of the starting cell
    let spansLeftToRight = false;

    queue.push({ x: startX, y: startY });
    visited[startX][startY] = true;

    while (queue.length > 0) {
      let { x, y } = queue.shift();
      chain.push({ x, y });

      // Check if the current block is in the rightmost column
      if (x === cols - 1) {
        spansLeftToRight = true;
      }

      // Explore neighbors (up, down, left, right, and diagonals)
      let neighbors = [
        { x: x + 1, y: y }, // Right
        { x: x - 1, y: y }, // Left
        { x: x, y: y + 1 }, // Down
        { x: x, y: y - 1 }, // Up
        { x: x + 1, y: y + 1 }, // Bottom-right diagonal
        { x: x - 1, y: y - 1 }, // Top-left diagonal
        { x: x + 1, y: y - 1 }, // Top-right diagonal
        { x: x - 1, y: y + 1 }, // Bottom-left diagonal
      ];

      for (let neighbor of neighbors) {
        let nx = neighbor.x;
        let ny = neighbor.y;

        if (
          nx >= 0 &&
          nx < cols &&
          ny >= 0 &&
          ny < rows &&
          !visited[nx][ny] &&
          grid[nx][ny].occupied &&
          grid[nx][ny].color === startColor // Compare the color with the starting cell
        ) {
          queue.push(neighbor);
          visited[nx][ny] = true;
        }
      }
    }

    // Return the chain along with whether it spans from left to right
    return { success: spansLeftToRight, chain };
  }

  function deleteChainParticles(chain) {
    for (let i = 0; i < chain.length; i++) {
      let { x, y } = chain[i];

      // Reset the grid cell to its initial state (empty cell)
      grid[x][y] = { occupied: false, color: 0 };
    }
  }









  // Function to place the tetromino in the grid
  function placeTetromino() {
    for (let i = 0; i < tetromino.length; i++) {
      for (let j = 0; j < tetromino[i].length; j++) {
        if (tetromino[i][j] === 1) {
          grid[position.x + i][position.y + j] = {
            occupied: true, // Mark the cell as occupied
            color: hueValue, // Store the color in the cell
          };
        }
      }
    }

    checkGameOver(); // Check for game over after placing the tetromino
    createNewTetromino(); // Spawn a new tetromino
  }

  // Function to check if the game is over
  function checkGameOver() {




    finalScore=score;










    for (let i = 0; i < cols; i++) {
      if (grid[i][0].occupied) { // If any cell in the top row is occupied
      gameOver = true;
          //------------------------------------
      const user = auth.currentUser;  // Get the current user

          if (user) {
              const userId = user.uid;
              const userRef = ref(database, 'users/' + userId);
              console.log(userId)
              // Fetch the current highscore
              get(userRef).then((snapshot) => {
                  if (snapshot.exists()) {
                      const currentHighscore = snapshot.val().highscore;

                      // If the final score is higher than the current highscore, update the database
                      if (finalScore > currentHighscore) {
                          update(userRef, {
                              highscore: finalScore
                          }).then(() => {
                              console.log('Highscore updated successfully');
                          }).catch((error) => {
                              console.error('Error updating highscore:', error);
                          });
                      } else {
                          console.log('No new highscore to update.');
                      }
                  } else {
                      console.log('No user data found');
                  }
              }).catch((error) => {
                  console.error('Error fetching user data:', error);
              });
          }





          //------------------------------------



        resetGame();




        break;
      }
    }
  }
  function resetGame() {
    // Reset game state variables
    gameStarted = false;  // Ensure the game is marked as not started
    grid = make2DArray(cols, rows);  // Reset the grid
    velocityGrid = make2DArray(cols, rows);  // Reset velocity grid
    visited = new Array(cols).fill(null).map(() => new Array(rows).fill(false)); // Reset visited grid
    createNewTetromino();  // Create a new Tetromino for the next round
    timeSinceLastDrop = 0;  // Reset the drop timer
    framesSinceLastChainCheck = 0;  // Reset chain check timer
    score=0;
  }













  // The function to handle key press events
  p5.keyPressed = () => {
    if (p5.keyCode === p5.UP_ARROW) {
      rotateTetromino(); // Rotate the tetromino when UP_ARROW is pressed
    }
    if (!gameStarted && p5.keyCode === p5.ENTER) {
              gameStarted = true; // Start the game
              gameOver=false
            }
            if (p5.key === 'R' || p5.key === 'r') {
                  resetGame();  // Reset the game when the user presses "R"
                }
  };
};

export default function App() {
  return (
    <div>
      <ReactP5Wrapper sketch={sketch} />
    </div>
  );
}