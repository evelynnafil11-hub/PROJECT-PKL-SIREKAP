// Ganti dengan ID Folder Induk Google Drive kamu (contoh: PROJECT REKAPAN PETUGAS)
const PARENT_FOLDER_ID = "1glt1Suh_QBwrV14n2x_VZH7oM1mxC8Zn";

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const namaPetugas = data.nama; 
    const filename = data.filename;
    const filedata = data.filedata; // Format Base64

    // 1. Cari atau buat folder petugas di dalam Drive
    const parentFolder = DriveApp.getFolderById(PARENT_FOLDER_ID);
    const subFolders = parentFolder.getFolders();
    let targetFolder = null;

    while (subFolders.hasNext()) {
      let folder = subFolders.next();
      if (folder.getName().toUpperCase().includes(namaPetugas.toUpperCase())) {
        targetFolder = folder;
        break;
      }
    }

    if (!targetFolder) {
      targetFolder = parentFolder.createFolder(namaPetugas);
    }

    // 2. Simpan file foto ke Google Drive
    const splitData = filedata.split(',');
    const contentType = splitData[0].match(/:(.*?);/)[1];
    const decodedBytes = Utilities.base64Decode(splitData[1]);
    const blob = Utilities.newBlob(decodedBytes, contentType, filename);
    targetFolder.createFile(blob);

    // 3. Hitung jumlah file HANYA untuk minggu ini (Senin - Minggu)
    const now = new Date();
    const dayOfWeek = now.getDay(); // 0 = Minggu, 1 = Senin, dst.
    const distanceToMonday = (dayOfWeek === 0 ? -6 : 1) - dayOfWeek;
    const startOfWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() + distanceToMonday);
    startOfWeek.setHours(0, 0, 0, 0);

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);

    const files = targetFolder.getFiles();
    let weeklyCount = 0;

    while (files.hasNext()) {
      let file = files.next();
      let uploadDate = file.getDateCreated();
      
      if (uploadDate >= startOfWeek && uploadDate <= endOfWeek) {
        weeklyCount++;
      }
    }

    // 4. Update Google Sheets secara otomatis
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    const rows = sheet.getDataRange().getValues();

    for (let i = 1; i < rows.length; i++) {
      let namaDiSheet = String(rows[i][1]).trim().toUpperCase();
      if (namaDiSheet.includes(namaPetugas.toUpperCase())) {
        sheet.getRange(i + 1, 3).setValue(weeklyCount); // Kolom C (Jumlah Upload Minggu Ini)
        break;
      }
    }

    return ContentService.createTextOutput(JSON.stringify({ status: "success", totalMingguIni: weeklyCount }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ status: "error", message: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
