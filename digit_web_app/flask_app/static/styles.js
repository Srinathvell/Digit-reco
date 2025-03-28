// script.js - Combined Mouse & Touchscreen Support
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const predictBtn = document.getElementById('predict-btn');
const clearBtn = document.getElementById('clear-btn');
const resultDiv = document.getElementById('result');
const uploadBtn = document.getElementById('upload-btn');
const fileUpload = document.getElementById('file-upload');

// Initialize canvas
ctx.fillStyle = 'white';
ctx.fillRect(0, 0, canvas.width, canvas.height);
ctx.strokeStyle = 'black';
ctx.lineWidth = 15;
ctx.lineCap = 'round';

// Drawing state
let isDrawing = false;
let lastX = 0;
let lastY = 0;

// Mouse Event Handlers
function startDrawing(e) {
    isDrawing = true;
    [lastX, lastY] = getPosition(e);
}

function draw(e) {
    if (!isDrawing) return;
    
    const [x, y] = getPosition(e);
    
    ctx.beginPath();
    ctx.moveTo(lastX, lastY);
    ctx.lineTo(x, y);
    ctx.stroke();
    
    [lastX, lastY] = [x, y];
}

function stopDrawing() {
    isDrawing = false;
}

// Touch Event Handlers
function handleTouchStart(e) {
    e.preventDefault();
    const touch = e.touches[0];
    const mouseEvent = new MouseEvent('mousedown', {
        clientX: touch.clientX,
        clientY: touch.clientY
    });
    canvas.dispatchEvent(mouseEvent);
}

function handleTouchMove(e) {
    e.preventDefault();
    const touch = e.touches[0];
    const mouseEvent = new MouseEvent('mousemove', {
        clientX: touch.clientX,
        clientY: touch.clientY
    });
    canvas.dispatchEvent(mouseEvent);
}

function handleTouchEnd() {
    const mouseEvent = new MouseEvent('mouseup', {});
    canvas.dispatchEvent(mouseEvent);
}

// Helper function to get position (works for both mouse and touch)
function getPosition(e) {
    const rect = canvas.getBoundingClientRect();
    return [
        e.clientX - rect.left,
        e.clientY - rect.top
    ];
}

// Image Upload Handler
function handleImageUpload() {
    const file = fileUpload.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        const img = new Image();
        img.onload = function() {
            // Clear canvas and draw uploaded image
            ctx.fillStyle = 'white';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        };
        img.src = e.target.result;
    };
    reader.readAsDataURL(file);
}

// Prediction Function
function predictDigit() {
    const imageData = canvas.toDataURL();
    
    fetch('/predict', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ image: imageData })
    })
    .then(response => response.json())
    .then(data => {
        resultDiv.innerHTML = `
            <p>Predicted Digit: <strong>${data.digit}</strong></p>
            <p>Confidence: ${(data.confidence * 100).toFixed(2)}%</p>
        `;
    });
}

// Clear Canvas
function clearCanvas() {
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    resultDiv.innerHTML = '<p>Draw a digit and click Predict</p>';
}

// Event Listeners
// Mouse events
canvas.addEventListener('mousedown', startDrawing);
canvas.addEventListener('mousemove', draw);
canvas.addEventListener('mouseup', stopDrawing);
canvas.addEventListener('mouseout', stopDrawing);

// Touch events
canvas.addEventListener('touchstart', handleTouchStart);
canvas.addEventListener('touchmove', handleTouchMove);
canvas.addEventListener('touchend', handleTouchEnd);

// Buttons
predictBtn.addEventListener('click', predictDigit);
clearBtn.addEventListener('click', clearCanvas);
uploadBtn?.addEventListener('click', handleImageUpload);
fileUpload?.addEventListener('change', handleImageUpload);