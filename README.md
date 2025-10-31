# epicycles-
Creating an animation with epicycles to trace an svg file.

## Overview
This project creates beautiful animations of epicycles (rotating circles) that trace paths from SVG files. The epicycles use Fourier Transform mathematics to recreate any SVG path through the motion of rotating circles.

## Features
- **SVG File Upload**: Upload any SVG file containing path elements
- **Interactive Controls**: Adjust the number of epicycles (10-200) and animation speed (0.5x-5x)
- **Real-time Animation**: Watch as epicycles trace the path in a continuous loop
- **Path Visualization**: See both the epicycles and the traced path in cyan color
- **Responsive Design**: Works on different screen sizes

## How to Use

1. **Open the Application**
   - Open `index.html` in a web browser, or
   - Serve the files using a local web server:
     ```bash
     python3 -m http.server 8080
     ```
   - Navigate to `http://localhost:8080`

2. **Upload an SVG File**
   - Click the "Choose SVG File" button
   - Select an SVG file from your computer
   - The file will be parsed and you'll see a success message

3. **Generate the Animation**
   - Click the "Generate Epicycles" button
   - The animation will start automatically and loop continuously

4. **Adjust Settings** (optional)
   - Use the "Number of Epicycles" slider to control detail (more epicycles = more accurate tracing)
   - Use the "Animation Speed" slider to control how fast the animation plays

## Sample Files
Two sample SVG files are included:
- `sample-heart.svg` - A heart shape
- `sample-star.svg` - A star shape

## Technical Details
- Uses **Discrete Fourier Transform (DFT)** to decompose the SVG path into circular components
- Each epicycle represents a frequency component of the path
- Canvas-based rendering for smooth 60fps animation
- Pure JavaScript implementation with no external dependencies

## Browser Compatibility
Works in all modern browsers that support:
- HTML5 Canvas
- ES6 JavaScript
- SVG DOM API

## How It Works
1. **SVG Parsing**: The path data is extracted from the uploaded SVG file
2. **Point Sampling**: 500 points are sampled along the path
3. **Fourier Transform**: DFT converts the points into frequency components (epicycles)
4. **Animation**: Each frame, the epicycles rotate at their respective frequencies, and their combined position traces the original path

## Files
- `index.html` - Main application page
- `style.css` - Styling and layout
- `script.js` - Core logic for SVG parsing, DFT calculation, and animation
- `sample-heart.svg` - Sample heart-shaped SVG
- `sample-star.svg` - Sample star-shaped SVG

## Credits
Based on the mathematical concept of Fourier epicycles, popularized by 3Blue1Brown's video on the Fourier Transform.
