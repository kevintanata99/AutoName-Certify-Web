# 🎓 AutoName-Certify-Web

![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-323330?style=for-the-badge&logo=javascript&logoColor=F7DF1E)

**AutoName-Certify-Web** adalah aplikasi web *client-side* murni yang dirancang untuk men-*generate* ratusan sertifikat secara otomatis dalam hitungan detik. Dibangun tanpa *backend*, aplikasi ini sangat aman karena semua pemrosesan gambar dan data dilakukan langsung di browser pengguna.

Aplikasi ini dilengkapi dengan editor visual interaktif bergaya *software* desain profesional (seperti fitur *Magnetic Snapping* dan *Pan/Zoom*) serta dapat terhubung langsung dengan *database* Google Forms.

## ✨ Fitur Utama

* **🎨 Advanced Visual Editor**
    * **Drag & Drop:** Posisikan teks nama dengan kursor secara *real-time*.
    * **Magnetic Snapping (Smart Guides):** Garis bantu neon akan muncul dan mengunci teks tepat di tengah sertifikat secara magnetis (ala Adobe Photoshop).
    * **Pan & Zoom:** Mendukung *Zoom In/Out* (Ctrl + Scroll) dan *Panning* (Klik Kanan + Drag / Alt + Scroll) untuk akurasi tingkat milimeter.
* **🔗 Google Forms Integration**
    * Tarik data nama peserta secara *real-time* langsung dari Google Sheets (via *Publish to Web* CSV).
    * Pilih urutan kolom pertanyaan secara dinamis.
* **⚡ Bulk Processing & Export**
    * Proses ratusan nama dari file lokal (`.csv`, `.xls`, `.xlsx`).
    * *Auto-bundle* hasil akhir ke dalam satu file `.zip`.
    * Pilihan output gambar resolusi tinggi (PNG) atau dokumen cetak (PDF).
* **💅 Custom Typography & Styling**
    * Upload *font* kustom Anda sendiri (`.ttf`, `.otf`).
    * Pengaturan warna teks, ketebalan *font*, dan garis tepi (*outline*) presisi tinggi.
    * **True Render Preview:** Fitur untuk mengintip hasil *render* resolusi asli sebelum mengeksekusi *download* massal.

## 🚀 Cara Penggunaan

### Mode Lokal (Upload File)
1. Buka `index.html` di browser Anda.
2. Upload *template* sertifikat kosong (JPG/PNG).
3. Atur desain, gaya tulisan, dan posisikan teks dummy di layar *preview*.
4. Upload file data nama (.csv / .xlsx). Pastikan daftar nama berada di kolom pertama.
5. Klik **Download ZIP** dan biarkan aplikasi bekerja!

### Mode Otomatis (Google Forms)
1. Buka Google Sheets yang menampung jawaban Google Form Anda.
2. Klik **File > Share > Publish to Web**. Pilih format **CSV** dan *copy link* yang diberikan.
3. Di web aplikasi, ubah Sumber Data menjadi **Link Google Form**.
4. *Paste link* tersebut dan tentukan di urutan ke-berapa pertanyaan "Nama" berada.
5. Klik **Download ZIP**.

## 🛠️ Tech Stack & Libraries
Aplikasi ini dibangun menggunakan Vanilla JavaScript dengan bantuan *library* *open-source* berikut:
* [JSZip](https://stuk.github.io/jszip/) - Untuk membungkus file ke dalam format `.zip`.
* [jsPDF](https://parall.ax/products/jspdf) - Untuk men-*generate* output PDF.
* [PapaParse](https://www.papaparse.com/) - Untuk membaca data dari CSV (Lokal & GForm).
* [SheetJS](https://sheetjs.com/) - Untuk membaca file Excel (`.xls`, `.xlsx`).
* [FileSaver.js](https://github.com/eligrey/FileSaver.js/) - Untuk memicu unduhan file di sisi *client*.

## 👨‍💻 Author
Created with ❤️ by **Kevin Leonardo Tanata**.
