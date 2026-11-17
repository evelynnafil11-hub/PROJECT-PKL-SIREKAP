# Portal Rekap Perolehan Foto Petugas - PLN

## Cara Menjalankan Project:
1. Extract file ZIP ini dan buka foldernya di **VS Code**.
2. Buka terminal di VS Code (`Ctrl + ~`), lalu install semua library dengan perintah:
   ```bash
   npm install
   ```
3. Buka file `src/App.jsx`, lalu ganti `'URL_WEB_APP_GOOGLE_APPS_SCRIPT_KAMU'` pada baris 12 dengan URL Web App hasil deploy Google Apps Script kamu.
4. Jalankan aplikasi dengan perintah:
   ```bash
   npm run dev
   ```
5. Buka link `http://localhost:5173` di browser.

## Catatan Backend (`backend-google-apps-script/Code.gs`):
- Salin isi file `Code.gs` ke editor Apps Script pada Google Sheets rekap milikmu.
- Pastikan `PARENT_FOLDER_ID` sesuai dengan ID folder induk Google Drive kamu.
- Klik **Deploy > New deployment > Web app** (Execute as: Me, Who has access: Anyone).
