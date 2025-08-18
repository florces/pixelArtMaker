let rows = 16, cols = 16, currentColor = "#000000";
let mouseDown = false;
let pixelData = [];
let eraserMode = false;

const pixelart = document.getElementById('pixelart');
const colorPicker = document.getElementById('colorPicker');
const rowsInput = document.getElementById('rows');
const colsInput = document.getElementById('cols');
const eraserBtn = document.getElementById('eraserBtn');

function createGrid() {
    rows = parseInt(rowsInput.value);
    cols = parseInt(colsInput.value);
    pixelart.innerHTML = '';
    pixelart.style.gridTemplateRows = `repeat(${rows}, 1fr)`;
    pixelart.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
    pixelData = [];
    for (let r = 0; r < rows; r++) {
        let row = [];
        for (let c = 0; c < cols; c++) {
            const pixel = document.createElement('div');
            pixel.className = 'pixel';
            pixel.style.background = 'transparent';
            pixel.dataset.row = r;
            pixel.dataset.col = c;
            pixel.addEventListener('mousedown', paintPixel);
            pixel.addEventListener('mouseover', paintPixelDrag);
            pixel.addEventListener('contextmenu', e => {
                e.preventDefault();
                erasePixel(pixel);
            });
            pixelart.appendChild(pixel);
            row.push(null);
        }
        pixelData.push(row);
    }
}

function paintPixel(e) {
    if (e.buttons !== 1) return;
    mouseDown = true;
    const pixel = e.target;
    if (eraserMode) {
        erasePixel(pixel);
    } else {
        pixel.style.background = currentColor;
        pixelData[pixel.dataset.row][pixel.dataset.col] = currentColor;
    }
}

function paintPixelDrag(e) {
    if (!mouseDown) return;
    const pixel = e.target;
    if (eraserMode) {
        erasePixel(pixel);
    } else {
        pixel.style.background = currentColor;
        pixelData[pixel.dataset.row][pixel.dataset.col] = currentColor;
    }
}

function erasePixel(pixel) {
    pixel.style.background = 'transparent';
    pixelData[pixel.dataset.row][pixel.dataset.col] = null;
}

document.body.addEventListener('mousedown', () => mouseDown = true);
document.body.addEventListener('mouseup', () => mouseDown = false);

colorPicker.addEventListener('input', e => {
    currentColor = e.target.value;
});

function clearGrid() {
    document.querySelectorAll('.pixel').forEach(pixel => {
        pixel.style.background = 'transparent';
    });
    for (let r = 0; r < rows; r++)
        for (let c = 0; c < cols; c++)
            pixelData[r][c] = null;
}

function exportPNG() {
    const canvas = document.createElement('canvas');
    canvas.width = cols;
    canvas.height = rows;
    const ctx = canvas.getContext('2d');

    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            const color = pixelData[r][c];
            if (color) {
                ctx.fillStyle = color;
                ctx.fillRect(c, r, 1, 1);
            }
        }
    }
    const exportCanvas = document.createElement('canvas');
    const scale = 24;
    exportCanvas.width = cols * scale;
    exportCanvas.height = rows * scale;
    const exportCtx = exportCanvas.getContext('2d');
    exportCtx.imageSmoothingEnabled = false;
    exportCtx.drawImage(canvas, 0, 0, exportCanvas.width, exportCanvas.height);

    exportCanvas.toBlob(function(blob) {
        if (window.navigator.msSaveOrOpenBlob) {
            window.navigator.msSaveOrOpenBlob(blob, 'pixelart.png');
        } else {
            const link = document.createElement('a');
            link.download = 'pixelart.png';
            link.href = URL.createObjectURL(blob);
            document.body.appendChild(link);
            link.click();
            setTimeout(function() {
                URL.revokeObjectURL(link.href);
                document.body.removeChild(link);
            }, 100);
        }
    }, 'image/png');
}

eraserBtn.addEventListener('click', () => {
    eraserMode = !eraserMode;
    eraserBtn.classList.toggle('active', eraserMode);
});

eraserBtn.classList.remove('active');
createGrid();

function saveDrawing() {
    localStorage.setItem('pixelArtData', JSON.stringify({
        rows,
        cols,
        pixelData
    }));
    alert('¡Dibujo guardado para continuar después!');
}

function loadDrawing() {
    const data = localStorage.getItem('pixelArtData');
    if (data) {
        const obj = JSON.parse(data);
        rowsInput.value = obj.rows;
        colsInput.value = obj.cols;
        createGrid();
        for (let r = 0; r < obj.rows; r++) {
            for (let c = 0; c < obj.cols; c++) {
                const color = obj.pixelData[r][c];
                if (color) {
                    const idx = r * obj.cols + c;
                    const pixel = pixelart.children[idx];
                    pixel.style.background = color;
                    pixelData[r][c] = color;
                }
            }
        }
    }
}

window.addEventListener('DOMContentLoaded', loadDrawing);
