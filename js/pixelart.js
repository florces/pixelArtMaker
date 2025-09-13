let rows = 16, cols = 16, currentColor = "#000000";
let mouseDown = false;
let pixelData = [];
let eraserMode = false;

const pixelart = document.getElementById('pixelart');
const colorPicker = document.getElementById('colorPicker');
const rowsInput = document.getElementById('rows');
const colsInput = document.getElementById('cols');
const eraserBtn = document.getElementById('eraserBtn');
const langSelect = document.getElementById('langSelect');
let currentLang = langSelect ? langSelect.value : 'es';

const translations = {
    es: {
        rows: 'Alto:',
        cols: 'Ancho:',
        color: 'Color:',
        create: 'Crear lienzo',
        eraser: 'Goma',
        clear: 'Limpiar',
        save: 'Guardar',
        export: 'Exportar PNG',
        saved: '¡Dibujo guardado para continuardespués!'
    },
    en: {
        rows: 'Rows:',
        cols: 'Cols:',
        color: 'Color:',
        create: 'Create grid',
        eraser: 'Eraser',
        clear: 'Clear',
        save: 'Save',
        export: 'Export PNG',
        saved: 'Drawing saved to continue later!'
    }
};

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

function setLanguage(lang) {
    currentLang = lang;
    document.querySelectorAll('.sidebar label')[0].childNodes[0].textContent = translations[lang].rows + ' ';
    document.querySelectorAll('.sidebar label')[1].childNodes[0].textContent = translations[lang].cols + ' ';
    document.querySelectorAll('.sidebar label')[2].childNodes[0].textContent = translations[lang].color + ' ';
    document.querySelectorAll('.sidebar button')[0].textContent = translations[lang].create;
    document.querySelectorAll('.sidebar button')[1].textContent = translations[lang].eraser;
    document.querySelectorAll('.sidebar button')[2].textContent = translations[lang].clear;
    document.querySelectorAll('.sidebar button')[3].textContent = translations[lang].save;
    document.querySelectorAll('.sidebar button')[4].textContent = translations[lang].export;
}

if (langSelect) {
    langSelect.addEventListener('change', function() {
        setLanguage(langSelect.value);
    });
    setLanguage(langSelect.value);
}

// Sobrescribir alert en saveDrawing para multi-idioma
function saveDrawing() {
    localStorage.setItem('pixelArtData', JSON.stringify({
        rows,
        cols,
        pixelData
    }));
    alert(translations[currentLang].saved);
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
setLanguage('es');
