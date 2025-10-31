// Global variables
let svgPath = null;
let pathPoints = [];
let epicycles = [];
let time = 0;
let animationId = null;
let epicycleCount = 100;
let animationSpeed = 1;
let canvas, ctx;
let tracedPath = [];

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    canvas = document.getElementById('animation-canvas');
    ctx = canvas.getContext('2d');
    
    // Set canvas size
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    // Set up event listeners
    document.getElementById('svg-upload').addEventListener('change', handleFileUpload);
    document.getElementById('generate-btn').addEventListener('click', generateEpicycles);
    document.getElementById('epicycle-count').addEventListener('input', (e) => {
        epicycleCount = parseInt(e.target.value);
        document.getElementById('count-value').textContent = epicycleCount;
    });
    document.getElementById('animation-speed').addEventListener('input', (e) => {
        animationSpeed = parseFloat(e.target.value);
        document.getElementById('speed-value').textContent = animationSpeed.toFixed(1) + 'x';
    });
});

function resizeCanvas() {
    const container = canvas.parentElement;
    const width = Math.min(container.clientWidth - 40, 800);
    const height = Math.min(500, width * 0.75);
    canvas.width = width;
    canvas.height = height;
}

function handleFileUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    if (!file.name.endsWith('.svg')) {
        showStatus('Please upload a valid SVG file', 'error');
        return;
    }
    
    document.getElementById('file-name').textContent = file.name;
    
    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            parseSVG(e.target.result);
            document.getElementById('generate-btn').disabled = false;
            showStatus('SVG loaded successfully! Click "Generate Epicycles" to start.', 'success');
        } catch (error) {
            showStatus('Error parsing SVG: ' + error.message, 'error');
            console.error(error);
        }
    };
    reader.readAsText(file);
}

function parseSVG(svgContent) {
    const parser = new DOMParser();
    const svgDoc = parser.parseFromString(svgContent, 'image/svg+xml');
    
    // Find path elements
    const paths = svgDoc.querySelectorAll('path');
    if (paths.length === 0) {
        throw new Error('No path elements found in SVG');
    }
    
    // Use the first path for simplicity
    const pathElement = paths[0];
    const pathData = pathElement.getAttribute('d');
    
    if (!pathData) {
        throw new Error('Path element has no "d" attribute');
    }
    
    // Extract points from the path
    pathPoints = extractPointsFromPath(pathData);
    
    if (pathPoints.length === 0) {
        throw new Error('Could not extract points from path');
    }
    
    console.log(`Extracted ${pathPoints.length} points from SVG path`);
}

function extractPointsFromPath(pathData) {
    const points = [];
    const svgNS = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(svgNS, "svg");
    const path = document.createElementNS(svgNS, "path");
    path.setAttribute("d", pathData);
    svg.appendChild(path);
    
    const totalLength = path.getTotalLength();
    const numSamples = 500; // Sample 500 points from the path
    
    for (let i = 0; i < numSamples; i++) {
        const point = path.getPointAtLength((i / numSamples) * totalLength);
        points.push({ x: point.x, y: point.y });
    }
    
    return points;
}

function generateEpicycles() {
    if (pathPoints.length === 0) {
        showStatus('No SVG path loaded', 'error');
        return;
    }
    
    showStatus('Generating epicycles...', 'info');
    
    // Stop any existing animation
    if (animationId) {
        cancelAnimationFrame(animationId);
    }
    
    // Compute Discrete Fourier Transform
    epicycles = dft(pathPoints, epicycleCount);
    
    // Sort epicycles by amplitude (radius) for better visual effect
    epicycles.sort((a, b) => b.amp - a.amp);
    
    // Reset time
    time = 0;
    tracedPath = [];
    
    // Start animation
    showStatus('Animation started! The epicycles will loop continuously.', 'success');
    animate();
}

// Discrete Fourier Transform
function dft(points, maxFreq) {
    const N = points.length;
    const epicycles = [];
    
    // Use only a subset of frequencies for performance
    const freqCount = Math.min(maxFreq, Math.floor(N / 2));
    
    for (let k = -Math.floor(freqCount / 2); k <= Math.floor(freqCount / 2); k++) {
        let re = 0;
        let im = 0;
        
        for (let n = 0; n < N; n++) {
            const phi = (2 * Math.PI * k * n) / N;
            re += points[n].x * Math.cos(phi) + points[n].y * Math.sin(phi);
            im += -points[n].x * Math.sin(phi) + points[n].y * Math.cos(phi);
        }
        
        re /= N;
        im /= N;
        
        const freq = k;
        const amp = Math.sqrt(re * re + im * im);
        const phase = Math.atan2(im, re);
        
        epicycles.push({ freq, amp, phase });
    }
    
    return epicycles;
}

function animate() {
    // Clear canvas
    ctx.fillStyle = '#0f0f1e';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Center the drawing
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    
    // Calculate scale to fit the drawing
    const scale = calculateScale();
    
    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.scale(scale, scale);
    
    // Draw epicycles
    let x = 0;
    let y = 0;
    
    for (let i = 0; i < epicycles.length; i++) {
        const prevX = x;
        const prevY = y;
        
        const { freq, amp, phase } = epicycles[i];
        const angle = freq * time + phase;
        
        x += amp * Math.cos(angle);
        y += amp * Math.sin(angle);
        
        // Draw circle
        ctx.strokeStyle = 'rgba(102, 126, 234, 0.3)';
        ctx.lineWidth = 1 / scale;
        ctx.beginPath();
        ctx.arc(prevX, prevY, amp, 0, Math.PI * 2);
        ctx.stroke();
        
        // Draw line
        ctx.strokeStyle = 'rgba(118, 75, 162, 0.5)';
        ctx.beginPath();
        ctx.moveTo(prevX, prevY);
        ctx.lineTo(x, y);
        ctx.stroke();
    }
    
    // Draw the current point
    ctx.fillStyle = '#ff6b6b';
    ctx.beginPath();
    ctx.arc(x, y, 3 / scale, 0, Math.PI * 2);
    ctx.fill();
    
    // Add point to traced path
    tracedPath.push({ x, y });
    
    // Draw traced path
    if (tracedPath.length > 1) {
        ctx.strokeStyle = '#00ffff';
        ctx.lineWidth = 2 / scale;
        ctx.beginPath();
        ctx.moveTo(tracedPath[0].x, tracedPath[0].y);
        for (let i = 1; i < tracedPath.length; i++) {
            ctx.lineTo(tracedPath[i].x, tracedPath[i].y);
        }
        ctx.stroke();
    }
    
    ctx.restore();
    
    // Update time
    const dt = (2 * Math.PI) / pathPoints.length;
    time += dt * animationSpeed;
    
    // Loop the animation
    if (time > 2 * Math.PI) {
        time = 0;
        tracedPath = []; // Clear the traced path for the next loop
    }
    
    // Continue animation
    animationId = requestAnimationFrame(animate);
}

function calculateScale() {
    if (pathPoints.length === 0) return 1;
    
    // Find bounding box of the path
    let minX = Infinity, minY = Infinity;
    let maxX = -Infinity, maxY = -Infinity;
    
    for (const point of pathPoints) {
        minX = Math.min(minX, point.x);
        minY = Math.min(minY, point.y);
        maxX = Math.max(maxX, point.x);
        maxY = Math.max(maxY, point.y);
    }
    
    const width = maxX - minX;
    const height = maxY - minY;
    const padding = 50;
    
    const scaleX = (canvas.width - padding * 2) / width;
    const scaleY = (canvas.height - padding * 2) / height;
    
    return Math.min(scaleX, scaleY, 1);
}

function showStatus(message, type) {
    const statusElement = document.getElementById('status');
    statusElement.textContent = message;
    statusElement.className = 'status ' + type;
}
