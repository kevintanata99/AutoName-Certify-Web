// --- FULL PREVIEW (TRUE RENDER) ---
document.getElementById('preview-btn').addEventListener('click', async () => {
    const templateFile = document.getElementById('template-upload').files[0];
    if (!templateFile) return alert("Template sertifikat belum di input!");

    const color = document.getElementById('font-color-hex').value;
    const fontSize = document.getElementById('font-size').value; 
    const fontWeight = document.getElementById('font-weight').value;
    let fontFamily = document.getElementById('font-family').value;
    if (fontFamily === 'custom') fontFamily = document.getElementById('draggable-name').style.fontFamily;
    
    const outlineColor = document.getElementById('outline-color').value;
    const outlineWidth = parseInt(document.getElementById('outline-width').value) || 0;
    const xPercent = parseFloat(document.getElementById('input-x').value) / 100;
    const yPercent = parseFloat(document.getElementById('input-y').value) / 100;

    const imgURL = URL.createObjectURL(templateFile);
    const img = await loadImage(imgURL);
    
    const canvas = document.createElement('canvas');
    canvas.width = img.width; canvas.height = img.height;
    const ctx = canvas.getContext('2d');

    const xPos = img.width * xPercent;
    const yPos = img.height * yPercent;

    const container = document.getElementById('certificate-container');
    const exactScreenWidth = container.getBoundingClientRect().width / window.currentScale;
    const scaleRatio = img.width / exactScreenWidth; 
    
    const actualFontSize = fontSize * scaleRatio;
    const actualOutlineWidth = outlineWidth * scaleRatio;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    ctx.font = `${fontWeight} ${actualFontSize}px ${fontFamily}`;
    ctx.textAlign = "center"; 
    ctx.textBaseline = "middle";

    const sampleName = document.getElementById('draggable-name').innerText;

    if (actualOutlineWidth > 0) {
        ctx.strokeStyle = outlineColor;
        ctx.lineWidth = actualOutlineWidth;
        ctx.lineJoin = "round";
        ctx.strokeText(sampleName, xPos, yPos);
    }
    ctx.fillStyle = color;
    ctx.fillText(sampleName, xPos, yPos);

    document.getElementById('preview-image').src = canvas.toDataURL('image/png');
    document.getElementById('preview-modal').style.display = 'flex';
});

document.getElementById('close-modal').addEventListener('click', () => { document.getElementById('preview-modal').style.display = 'none'; });
document.getElementById('preview-modal').addEventListener('click', (e) => {
    if (e.target.id === 'preview-modal') document.getElementById('preview-modal').style.display = 'none';
});

// --- GENERATOR ZIP ---
document.getElementById('generate-btn').addEventListener('click', async () => {
// --- CEK SUMBER DATA (UPLOAD ATAU GFORM) ---
    const sourceType = document.getElementById('data-source-type').value;
    const gformLink = document.getElementById('gform-link').value.trim();
    
    // Validasi input berdasarkan sumber yang dipilih
    if (sourceType === 'upload' && !dataFile) return alert("File data namanya belum di-upload ya!");
    if (sourceType === 'gform' && !gformLink) return alert("Link Google Sheets-nya jangan lupa diisi dong! 💕");

    const btn = document.getElementById('generate-btn');
    const statusText = document.getElementById('status-text');
    btn.disabled = true; statusText.style.display = 'block'; 
    statusText.innerText = "Mengambil data nama...";

    // Fungsi pemanggil proses ZIP (tidak berubah)
    const startProcessing = async (names) => {
        try {
            if (names.length === 0) throw new Error("Datanya kosong atau kolom nama tidak ditemukan!");
            await processAndZip(names, templateFile, { filePrefix, color, fontSize, fontFamily, fontWeight, outlineColor, outlineWidth, xPercent, yPercent, outputFormat });
        } catch (err) {
            console.error(err); alert("Error: " + err.message); statusText.innerText = "Terjadi kesalahan.";
        } finally {
            btn.disabled = false; setTimeout(() => statusText.style.display = 'none', 5000);
        }
    };

    // --- LOGIKA CABANG PEMBACAAN DATA ---
    if (sourceType === 'gform') {
        // JALUR 1: Tarik data otomatis dari Google Sheets URL
        try {
            const response = await fetch(gformLink);
            if (!response.ok) throw new Error("Gagal akses link. Pastikan link-nya benar dan formatnya CSV ya!");
            const csvText = await response.text();
            
            // Ambil urutan kolom dari input UI
            const colIndex = parseInt(document.getElementById('gform-column').value) || 1;

            Papa.parse(csvText, {
                skipEmptyLines: true,
                complete: function(results) {
                    const names = results.data.slice(1).map(row => row[colIndex]).filter(name => name && String(name).trim() !== "");
                    startProcessing(names);
                }
            });
        } catch (error) {
            alert("Gagal menarik data dari Google: " + error.message);
            btn.disabled = false; statusText.style.display = 'none';
        }

    } else {
        // JALUR 2: Baca dari File Lokal (Upload)
        const fileExt = dataFile.name.split('.').pop().toLowerCase();
        
        if (fileExt === 'csv') {
            Papa.parse(dataFile, { skipEmptyLines: true, complete: function(results) {
                // Untuk file lokal, kita asumsikan nama ada di kolom pertama (index 0) tanpa header
                const names = results.data.map(row => row[0]).filter(name => name && String(name).trim() !== "");
                startProcessing(names);
            }});
        } else if (fileExt === 'xls' || fileExt === 'xlsx') {
            const reader = new FileReader();
            reader.onload = function(e) {
                try {
                    const data = new Uint8Array(e.target.result);
                    const workbook = XLSX.read(data, {type: 'array'});
                    const json = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]], {header: 1});
                    // File excel lokal, asumsikan nama di kolom pertama (index 0)
                    const names = json.map(row => row[0]).filter(name => name && String(name).trim() !== "");
                    startProcessing(names);
                } catch (error) { alert("Gagal membaca file Excel!"); btn.disabled = false; statusText.style.display = 'none'; }
            };
            reader.readAsArrayBuffer(dataFile);
        } else { 
            alert("Format file harus CSV, XLS, atau XLSX ya!"); btn.disabled = false; statusText.style.display = 'none';
        }
    }
});

async function processAndZip(names, templateFile, config) {
    const zip = new JSZip();
    const { jsPDF } = window.jspdf;

    const imgURL = URL.createObjectURL(templateFile);
    const img = await loadImage(imgURL);
    
    const canvas = document.createElement('canvas');
    canvas.width = img.width; canvas.height = img.height;
    const ctx = canvas.getContext('2d');

    const xPos = img.width * config.xPercent;
    const yPos = img.height * config.yPercent;

    const container = document.getElementById('certificate-container');
    const exactScreenWidth = container.getBoundingClientRect().width / window.currentScale;
    const scaleRatio = img.width / exactScreenWidth;
    
    const actualFontSize = config.fontSize * scaleRatio;
    const actualOutlineWidth = config.outlineWidth * scaleRatio;

    for (let i = 0; i < names.length; i++) {
        const nama = String(names[i]).trim();
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        ctx.font = `${config.fontWeight} ${actualFontSize}px ${config.fontFamily}`;
        ctx.textAlign = "center"; ctx.textBaseline = "middle";

        if (actualOutlineWidth > 0) {
            ctx.strokeStyle = config.outlineColor;
            ctx.lineWidth = actualOutlineWidth;
            ctx.lineJoin = "round";
            ctx.strokeText(nama, xPos, yPos);
        }
        ctx.fillStyle = config.color;
        ctx.fillText(nama, xPos, yPos);

        const dataUrl = canvas.toDataURL('image/png');
        const base64Data = dataUrl.replace(/^data:image\/(png|jpg);base64,/, "");
        const finalFileName = `${nama} - ${config.filePrefix}`;

        if (config.outputFormat === 'png') {
            zip.file(`${finalFileName}.png`, base64Data, {base64: true});
        } else if (config.outputFormat === 'pdf') {
            const orientasi = img.width > img.height ? 'l' : 'p';
            const pdf = new jsPDF({ orientation: orientasi, unit: 'px', format: [img.width, img.height] });
            pdf.addImage(dataUrl, 'PNG', 0, 0, img.width, img.height);
            zip.file(`${finalFileName}.pdf`, pdf.output('arraybuffer'));
        }
        document.getElementById('status-text').innerText = `Memproses... ${i + 1} dari ${names.length} nama`;
    }

    document.getElementById('status-text').innerText = "Sedang membungkus file ke .ZIP... Mohon tunggu!";
    const content = await zip.generateAsync({type: "blob"});
    saveAs(content, `Batch_${config.filePrefix}.zip`);
    document.getElementById('status-text').innerText = "File ZIP berhasil didownload!";
}

function loadImage(url) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = url;
    });
}