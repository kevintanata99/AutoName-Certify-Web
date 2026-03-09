// --- FITUR TOGGLE SUMBER DATA ---
const dataSourceType = document.getElementById('data-source-type');
const sectionUpload = document.getElementById('section-upload');
const sectionGform = document.getElementById('section-gform');

dataSourceType.addEventListener('change', (e) => {
    if (e.target.value === 'upload') {
        sectionUpload.style.display = 'block';
        sectionGform.style.display = 'none';
    } else {
        sectionUpload.style.display = 'none';
        sectionGform.style.display = 'block';
    }
});

window.currentScale = 1; // Variabel global untuk skala Zoom
const dragItem = document.getElementById('draggable-name');
const uploadInput = document.getElementById('template-upload');
const container = document.getElementById('certificate-container');
const previewArea = document.querySelector('.preview-area');

// --- UPLOAD PREVIEW ---
uploadInput.addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(event) {
            const img = new Image();
            img.onload = function() {
                container.style.aspectRatio = `${img.width} / ${img.height}`;
                container.style.width = "100%";
                container.style.height = "auto";
                container.style.backgroundImage = `url('${event.target.result}')`;
                container.style.backgroundSize = '100% 100%';
                container.style.border = 'none';
            }
            img.src = event.target.result;
        }
        reader.readAsDataURL(file);
    }
});


// --- PENGATURAN TEKS ---
const colorPicker = document.getElementById('font-color-picker');
const colorHex = document.getElementById('font-color-hex');
const sizeInput = document.getElementById('font-size');
const familyInput = document.getElementById('font-family');
const weightSelect = document.getElementById('font-weight');
const outlineColor = document.getElementById('outline-color');
const outlineWidth = document.getElementById('outline-width');
const sampleNameInput = document.getElementById('sample-name-input');

colorPicker.addEventListener('input', (e) => { colorHex.value = e.target.value; dragItem.style.color = e.target.value; });
colorHex.addEventListener('input', (e) => {
    let val = e.target.value;
    if (/^#[0-9A-F]{6}$/i.test(val) || /^#[0-9A-F]{3}$/i.test(val)) { colorPicker.value = val; dragItem.style.color = val; }
});
sizeInput.addEventListener('input', (e) => { dragItem.style.fontSize = e.target.value + 'px'; });
weightSelect.addEventListener('change', (e) => { dragItem.style.fontWeight = e.target.value; });

familyInput.addEventListener('change', (e) => {
    if (e.target.value === 'custom') {
        document.getElementById('custom-font-container').style.display = 'block';
    } else {
        document.getElementById('custom-font-container').style.display = 'none';
        dragItem.style.fontFamily = e.target.value;
    }
});

document.getElementById('custom-font-upload').addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const fontName = 'CustomFont_' + Date.now();
    try {
        const fontData = await file.arrayBuffer();
        const customFont = new FontFace(fontName, fontData);
        await customFont.load();
        document.fonts.add(customFont);
        dragItem.style.fontFamily = fontName;
        familyInput.querySelector('option[value="custom"]').text = "Custom: " + file.name;
    } catch (error) { alert('Gagal memuat font!'); }
});

function updateOutline() {
    const width = outlineWidth.value;
    const color = outlineColor.value;
    dragItem.style.webkitTextStroke = width > 0 ? `${width}px ${color}` : "0px transparent";
}
outlineColor.addEventListener('input', updateOutline);
outlineWidth.addEventListener('input', updateOutline);

sampleNameInput.addEventListener('input', (e) => {
    const val = e.target.value.trim();
    dragItem.innerText = val === '' ? "NAMA MAHASISWA" : val;
    if (typeof updateOutline === 'function') updateOutline();
});

// --- LOGIKA DRAG & DROP & MAGNET SNAPPING ---
const inputX = document.getElementById('input-x');
const inputY = document.getElementById('input-y');
const guideV = document.getElementById('guide-v');
const guideH = document.getElementById('guide-h');
let isDragging = false, dragOffsetX = 0, dragOffsetY = 0;

inputX.addEventListener('input', (e) => { dragItem.style.left = Math.max(0, Math.min(100, e.target.value)) + '%'; });
inputY.addEventListener('input', (e) => { dragItem.style.top = Math.max(0, Math.min(100, e.target.value)) + '%'; });

dragItem.addEventListener('mousedown', function(e) {
    if (e.button === 0) {
        isDragging = true;
        dragItem.style.cursor = 'grabbing';
        const rectContainer = container.getBoundingClientRect();
        const rectText = dragItem.getBoundingClientRect();
        let mouseX = e.clientX - rectContainer.left;
        let mouseY = e.clientY - rectContainer.top;
        let textCenterX = (rectText.left - rectContainer.left) + (rectText.width / 2);
        let textCenterY = (rectText.top - rectContainer.top) + (rectText.height / 2);
        dragOffsetX = mouseX - textCenterX;
        dragOffsetY = mouseY - textCenterY;
    }
});

document.addEventListener('mouseup', function() {
    isDragging = false;
    dragItem.style.cursor = 'grab';
    guideV.style.display = 'none';
    guideH.style.display = 'none';
});

document.addEventListener('mousemove', function(e) {
    if (!isDragging) return;
    const rect = container.getBoundingClientRect();
    let x = (e.clientX - rect.left) - dragOffsetX;
    let y = (e.clientY - rect.top) - dragOffsetY;

    x = Math.max(0, Math.min(x, rect.width));
    y = Math.max(0, Math.min(y, rect.height));

    const snapDistance = 15; 
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    let snappedX = false, snappedY = false;

    if (Math.abs(x - centerX) < snapDistance) { x = centerX; snappedX = true; }
    if (Math.abs(y - centerY) < snapDistance) { y = centerY; snappedY = true; }

    guideV.style.display = snappedX ? 'block' : 'none';
    guideH.style.display = snappedY ? 'block' : 'none';

    const percentX = ((x / rect.width) * 100).toFixed(4);
    const percentY = ((y / rect.height) * 100).toFixed(4);

    dragItem.style.left = percentX + '%';
    dragItem.style.top = percentY + '%';
    inputX.value = percentX;
    inputY.value = percentY;
});

// --- ZOOM & PANNING MOUSE ---
previewArea.addEventListener('wheel', function(e) {
    if (e.ctrlKey) {
        e.preventDefault();
        window.currentScale += e.deltaY < 0 ? 0.1 : -0.1;
        window.currentScale = Math.max(0.5, Math.min(window.currentScale, 4));
        container.style.transform = `scale(${window.currentScale})`;
    } else if (e.altKey) {
        e.preventDefault();
        previewArea.scrollLeft += (e.deltaY * 1.5);
    }
}, { passive: false });

let isPanning = false, startX, startY, scrollLeft, scrollTop;
previewArea.addEventListener('contextmenu', (e) => e.preventDefault());
previewArea.addEventListener('mousedown', (e) => {
    if (e.button === 2) {
        isPanning = true;
        previewArea.style.cursor = 'grabbing';
        startX = e.pageX - previewArea.offsetLeft;
        startY = e.pageY - previewArea.offsetTop;
        scrollLeft = previewArea.scrollLeft;
        scrollTop = previewArea.scrollTop;
    }
});
previewArea.addEventListener('mousemove', (e) => {
    if (!isPanning) return;
    e.preventDefault();
    previewArea.scrollLeft = scrollLeft - ((e.pageX - previewArea.offsetLeft) - startX);
    previewArea.scrollTop = scrollTop - ((e.pageY - previewArea.offsetTop) - startY);
});
const stopPan = (e) => { if (e.button === 2 || e.type === 'mouseleave') { isPanning = false; previewArea.style.cursor = 'default'; } };
previewArea.addEventListener('mouseup', stopPan);
previewArea.addEventListener('mouseleave', stopPan);

// --- RESET FUNGSI ---
function resetToDefault() {
    // 1. Reset Pilihan Sumber Data ke Upload CSV
    const dataSourceType = document.getElementById('data-source-type');
    const sectionUpload = document.getElementById('section-upload');
    const sectionGform = document.getElementById('section-gform');
    const gformLink = document.getElementById('gform-link');

    if (dataSourceType) dataSourceType.value = 'upload';
    if (sectionUpload) sectionUpload.style.display = 'block';
    if (sectionGform) sectionGform.style.display = 'none';
    if (gformLink) gformLink.value = '';

    // 2. Kosongkan file upload lainnya
    document.getElementById('template-upload').value = "";
    document.getElementById('data-upload').value = "";
    document.getElementById('custom-font-upload').value = "";
    if (typeof sampleNameInput !== 'undefined' && sampleNameInput) sampleNameInput.value = "";
    
    // 3. Kembalikan gambar dan posisi teks ke awal
    container.style.backgroundImage = "none";
    container.style.border = "2px dashed #9CA3AF";
    dragItem.style.left = "50%";
    dragItem.style.top = "50%";
    dragItem.innerText = "NAMA MAHASISWA";
    
    // 4. Reset semua nilai input di Panel Kiri
    document.getElementById('file-prefix').value = "Seminar_AI";
    colorPicker.value = "#000000"; colorHex.value = "#000000"; dragItem.style.color = "#000000";
    sizeInput.value = "48"; dragItem.style.fontSize = "48px";
    weightSelect.value = "bold"; dragItem.style.fontWeight = "bold";
    familyInput.value = "Arial, sans-serif"; dragItem.style.fontFamily = "Arial, sans-serif";
    document.getElementById('custom-font-container').style.display = "none";
    
    outlineColor.value = "#FFFFFF"; outlineWidth.value = "0"; dragItem.style.webkitTextStroke = "0px transparent";
    inputX.value = "50.00"; inputY.value = "50.00"; document.getElementById('output-format').value = "pdf";
    
    // 5. Reset zoom gambar
    window.currentScale = 1;
    container.style.transform = `scale(1)`;
    previewArea.scrollLeft = 0; previewArea.scrollTop = 0;
    document.getElementById('gform-column').value = "1";
}

document.getElementById('reset-btn').addEventListener('click', () => {
    if(confirm("Yakin mau mereset semua pengaturan dan menghapus gambar?")) resetToDefault();
});
window.addEventListener('load', resetToDefault);