import React, { useState } from 'react';
import { 
  Upload, 
  Camera, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  User,
  Image as ImageIcon,
  X,
  ShieldCheck,
  Lock,
  ExternalLink,
  FolderOpen,
  FileSpreadsheet,
  LogOut,
  ArrowLeft,
  KeyRound
} from 'lucide-react';

export default function App() {
  // State navigasi halaman: 'petugas' | 'login' | 'admin'
  const [activeView, setActiveView] = useState('petugas');

  // State form petugas
  const [namaPetugas, setNamaPetugas] = useState('');
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({ current: 0, total: 0 });

  // State modal notifikasi
  const [modalMessage, setModalMessage] = useState(null);
  const [modalType, setModalType] = useState('success');

  // State login admin
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  // Konfigurasi Kredensial Admin & Tautan Penting
  const ADMIN_CREDENTIALS = {
    username: 'admin-sirekap',
    password: 'sirekap@pln'
  };

  const GAS_URL = "https://script.google.com/macros/s/AKfycbxnkQlJoL0V55MhpdoW4oNaK1HRCS5aAUV8EMrswiBiR2nSOaVTuQDzbJDi_ShOaXAK/exec";
  const GOOGLE_SHEETS_URL = "https://docs.google.com/spreadsheets/d/1hPqeWYXWN6kJXHBhDHPhRoDEt-B5RTOWgIeDRDhThOw/edit?usp=sharing";
  const GOOGLE_DRIVE_URL = "https://drive.google.com/drive/folders/1gIt1Suh_QBwrV14n2x_VZh7oM1mxC8Zn?usp=sharing";

  // Handler file foto (mendukung banyak foto sekaligus)
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      files.forEach((file) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setSelectedFiles((prev) => [
            ...prev,
            {
              id: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
              file,
              previewUrl: reader.result
            }
          ]);
        };
        reader.readAsDataURL(file);
      });
    }
    e.target.value = '';
  };

  const handleRemoveFile = (idToRemove) => {
    setSelectedFiles((prev) => prev.filter((item) => item.id !== idToRemove));
  };

  const handleClearAllFiles = () => {
    setSelectedFiles([]);
  };

  // Handler kirim semua foto petugas ke Google Apps Script secara berurutan
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!namaPetugas.trim()) {
      setModalType('error');
      setModalMessage('Silakan isi nama petugas terlebih dahulu!');
      return;
    }

    if (selectedFiles.length === 0) {
      setModalType('error');
      setModalMessage('Silakan pilih atau ambil minimal satu foto dokumentasi!');
      return;
    }

    setLoading(true);
    const totalFiles = selectedFiles.length;
    setUploadProgress({ current: 0, total: totalFiles });
    const cleanName = namaPetugas.trim().toUpperCase();

    try {
      for (let i = 0; i < totalFiles; i++) {
        setUploadProgress({ current: i + 1, total: totalFiles });
        const item = selectedFiles[i];

        const payload = {
          nama: cleanName,
          filename: `${cleanName}_${Date.now()}_${i + 1}.jpg`,
          filedata: item.previewUrl,
        };

        await fetch(GAS_URL, {
          method: 'POST',
          mode: 'no-cors',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      }

      setLoading(false);
      setUploadProgress({ current: 0, total: 0 });
      setModalType('success');
      setModalMessage(`${totalFiles} foto lapangan atas nama ${cleanName} berhasil disimpan ke Google Drive dan direkap otomatis ke Google Sheets!`);
      setSelectedFiles([]);
      setNamaPetugas('');

    } catch (err) {
      setLoading(false);
      setUploadProgress({ current: 0, total: 0 });
      setModalType('error');
      setModalMessage('Terjadi kesalahan saat mengirim data: ' + err.toString());
    }
  };

  // Handler Login Admin
  const handleAdminLogin = (e) => {
    e.preventDefault();
    if (
      username.trim().toLowerCase() === ADMIN_CREDENTIALS.username &&
      password === ADMIN_CREDENTIALS.password
    ) {
      setLoginError('');
      setUsername('');
      setPassword('');
      setActiveView('admin');
    } else {
      setLoginError('Username atau password admin tidak sesuai.');
    }
  };

  // Handler Logout Admin
  const handleLogout = () => {
    setActiveView('petugas');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-blue-50 to-slate-100 font-sans text-slate-800 flex flex-col">
      
      {/* Top Navbar Modern */}
      <header className="bg-[#0F5298] text-white shadow-md sticky top-0 z-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div 
            onClick={() => setActiveView('petugas')}
            className="flex items-center gap-3 cursor-pointer"
          >
            {/* Logo Gambar Bersih Tanpa Kotak */}
            <img 
              src="logoplnremove.png" 
              alt="Logo PLN" 
              className="h-10 w-auto object-contain" 
            />
            <div>
              <h1 className="font-bold text-base sm:text-lg tracking-tight leading-none">
                PT PLN ULP TULUNGAGUNG
              </h1>
              <p className="text-[11px] text-sky-200 font-medium mt-0.5">
                Rekapan Dokumentasi Petugas
              </p>
            </div>
          </div>

          {/* Tombol Navigasi Admin / Kembali */}
          <div>
            {activeView === 'petugas' && (
              <button
                onClick={() => {
                  setLoginError('');
                  setActiveView('login');
                }}
                className="flex items-center gap-1.5 bg-[#1665B8] hover:bg-[#1E75D1] text-sky-50 text-xs font-semibold px-3.5 py-2 rounded-xl border border-sky-400/30 transition-all shadow-xs"
              >
                <Lock className="w-3.5 h-3.5 text-yellow-300" />
                <span>Admin</span>
              </button>
            )}

            {activeView === 'login' && (
              <button
                onClick={() => setActiveView('petugas')}
                className="flex items-center gap-1.5 bg-[#1665B8] hover:bg-[#1E75D1] text-sky-50 text-xs font-semibold px-3.5 py-2 rounded-xl border border-sky-400/30 transition-all"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Kembali</span>
              </button>
            )}

            {activeView === 'admin' && (
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 bg-rose-600/90 hover:bg-rose-600 text-white text-xs font-semibold px-3.5 py-2 rounded-xl transition-all shadow-xs"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Keluar</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-xl">
          
          {/* ========================================================= */}
          {/* VIEW 1: HALAMAN UPLOAD PETUGAS                            */}
          {/* ========================================================= */}
          {activeView === 'petugas' && (
            <div className="bg-white rounded-3xl shadow-xl shadow-blue-900/5 border border-blue-100/80 overflow-hidden">
              <div className="bg-gradient-to-r from-[#1665B8] to-[#2B7FD9] px-6 sm:px-8 py-6 text-white relative overflow-hidden">
                <div className="relative z-10">
                  <span className="inline-block bg-yellow-400 text-[#0F5298] text-[11px] font-bold px-2.5 py-0.5 rounded-full mb-2 shadow-sm">
                    UNGGAH HARIAN
                  </span>
                  <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
                    Laporan Foto Lapangan
                  </h2>
                  <p className="text-sky-100 text-xs sm:text-sm mt-1">
                    Input nama petugas dan unggah bukti foto untuk rekap otomatis ke Drive &amp; Sheets.
                  </p>
                </div>
                <div className="absolute -right-8 -bottom-10 w-36 h-36 rounded-full bg-white/10 pointer-events-none"></div>
                <div className="absolute right-12 -top-10 w-24 h-24 rounded-full bg-yellow-400/15 pointer-events-none"></div>
              </div>

              <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Nama Petugas
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-[#1665B8] transition-colors">
                      <User className="w-5 h-5" />
                    </div>
                    <input
                      type="text"
                      value={namaPetugas}
                      onChange={(e) => setNamaPetugas(e.target.value)}
                      placeholder="Ketik nama lengkap petugas..."
                      className="w-full pl-11 pr-4 py-3.5 bg-slate-50/70 border border-slate-200 rounded-2xl text-slate-800 font-medium placeholder:text-slate-400 placeholder:font-normal focus:bg-white focus:border-[#1665B8] focus:ring-4 focus:ring-blue-500/10 outline-none transition-all uppercase"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-semibold text-slate-700">
                      Foto Dokumentasi {selectedFiles.length > 0 && `(${selectedFiles.length} foto)`}
                    </label>
                    <span className="text-xs text-slate-400">Bisa upload lebih dari satu foto</span>
                  </div>

                  {selectedFiles.length === 0 ? (
                    <label className="group cursor-pointer flex flex-col items-center justify-center p-8 border-2 border-dashed border-sky-200 bg-sky-50/40 hover:bg-sky-50 hover:border-[#1665B8] rounded-2xl transition-all text-center">
                      <div className="w-14 h-14 rounded-2xl bg-white text-[#1665B8] shadow-sm border border-sky-100 flex items-center justify-center mb-3 group-hover:scale-105 group-hover:bg-[#1665B8] group-hover:text-white transition-all">
                        <Camera className="w-7 h-7" />
                      </div>
                      <span className="text-sm font-semibold text-slate-700 group-hover:text-[#1665B8] transition-colors">
                        Klik untuk pilih atau ambil beberapa foto
                      </span>
                      <span className="text-xs text-slate-400 mt-1">
                        Otomatis tersimpan ke folder bulan aktif
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleFileChange}
                        className="hidden"
                      />
                    </label>
                  ) : (
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3.5 shadow-inner space-y-3">
                      {/* Grid Pratinjau Banyak Foto */}
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-72 overflow-y-auto pr-1">
                        {selectedFiles.map((item, idx) => (
                          <div key={item.id} className="relative group aspect-square rounded-xl overflow-hidden bg-slate-900 border border-slate-200">
                            <img
                              src={item.previewUrl}
                              alt={`Pratinjau ${idx + 1}`}
                              className="w-full h-full object-cover"
                            />
                            <span className="absolute bottom-1.5 left-1.5 bg-slate-900/70 text-white text-[10px] font-bold px-2 py-0.5 rounded-md backdrop-blur-xs">
                              #{idx + 1}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleRemoveFile(item.id)}
                              title="Hapus foto ini"
                              className="absolute top-1.5 right-1.5 bg-slate-900/75 hover:bg-red-600 text-white p-1.5 rounded-full backdrop-blur-xs transition-colors shadow-sm"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>

                      {/* Baris Kontrol Tambah & Hapus Semua */}
                      <div className="flex items-center justify-between pt-2 border-t border-slate-200/80 text-xs">
                        <button
                          type="button"
                          onClick={handleClearAllFiles}
                          className="text-rose-600 hover:underline font-medium"
                        >
                          Hapus Semua
                        </button>
                        <label className="inline-flex items-center gap-1.5 bg-sky-100/80 hover:bg-sky-200/80 text-[#0F5298] font-semibold px-3 py-1.5 rounded-lg cursor-pointer transition-colors">
                          <ImageIcon className="w-3.5 h-3.5" />
                          <span>+ Tambah Foto Lagi</span>
                          <input
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={handleFileChange}
                            className="hidden"
                          />
                        </label>
                      </div>
                    </div>
                  )}
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-[#1665B8] hover:bg-[#0F5298] active:scale-[0.99] text-white font-bold py-4 px-6 rounded-2xl shadow-lg shadow-blue-600/20 transition-all flex items-center justify-center gap-2.5 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin text-yellow-300" />
                        <span>
                          Mengunggah Foto {uploadProgress.current} dari {uploadProgress.total}...
                        </span>
                      </>
                    ) : (
                      <>
                        <Upload className="w-5 h-5 text-yellow-300" />
                        <span>
                          Kirim {selectedFiles.length > 0 ? `${selectedFiles.length} ` : ''}Laporan Foto
                        </span>
                      </>
                    )}
                  </button>
                </div>
              </form>

              <div className="bg-slate-50/80 px-6 py-3.5 border-t border-slate-100 flex items-center justify-center gap-2 text-xs text-slate-500">
                <ShieldCheck className="w-4 h-4 text-[#1665B8]" />
                <span>Terhubung langsung dengan Google Drive &amp; Sheets Rekapan</span>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* VIEW 2: HALAMAN LOGIN ADMIN                               */}
          {/* ========================================================= */}
          {activeView === 'login' && (
            <div className="bg-white rounded-3xl shadow-xl shadow-blue-900/5 border border-blue-100/80 overflow-hidden max-w-md mx-auto">
              <div className="bg-gradient-to-r from-[#0F5298] to-[#1665B8] px-6 py-6 text-white text-center">
                <div className="w-12 h-12 rounded-2xl bg-yellow-400 text-[#0F5298] flex items-center justify-center mx-auto mb-3 shadow-md">
                  <KeyRound className="w-6 h-6" />
                </div>
                <h2 className="text-xl font-bold tracking-tight">Login Administrator</h2>
                <p className="text-sky-100 text-xs mt-1">
                  Masuk untuk mengakses tautan rekapan Sheets &amp; Drive
                </p>
              </div>

              <form onSubmit={handleAdminLogin} className="p-6 sm:p-8 space-y-5">
                {loginError && (
                  <div className="bg-rose-50 border border-rose-200 text-rose-600 text-xs font-medium px-4 py-3 rounded-xl flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{loginError}</span>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Username
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <User className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="Masukkan username admin"
                      required
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:bg-white focus:border-[#1665B8] focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Masukkan password"
                      required
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:bg-white focus:border-[#1665B8] focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-[#1665B8] hover:bg-[#0F5298] text-white font-bold py-3.5 px-6 rounded-xl shadow-lg shadow-blue-600/20 transition-all text-sm mt-2"
                >
                  Masuk ke Panel Admin
                </button>
              </form>
            </div>
          )}

          {/* ========================================================= */}
          {/* VIEW 3: DASHBOARD ADMIN (LINK SHEETS & DRIVE)             */}
          {/* ========================================================= */}
          {activeView === 'admin' && (
            <div className="bg-white rounded-3xl shadow-xl shadow-blue-900/5 border border-blue-100/80 overflow-hidden">
              <div className="bg-gradient-to-r from-[#0F5298] to-[#1665B8] px-6 sm:px-8 py-6 text-white">
                <span className="inline-block bg-yellow-400 text-[#0F5298] text-[11px] font-bold px-2.5 py-0.5 rounded-full mb-2">
                  PANEL ADMINISTRATOR
                </span>
                <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
                  Pusat Akses Rekapan
                </h2>
                <p className="text-sky-100 text-xs sm:text-sm mt-1">
                  Akses langsung dokumen Google Sheets rekapitulasi dan folder penyimpanan Google Drive.
                </p>
              </div>

              <div className="p-6 sm:p-8 space-y-4">
                
                {/* Card Link Google Sheets */}
                <a
                  href={GOOGLE_SHEETS_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center justify-between p-5 rounded-2xl border border-emerald-200 bg-emerald-50/40 hover:bg-emerald-50 hover:border-emerald-400 transition-all"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
                      <FileSpreadsheet className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-800 group-hover:text-emerald-800 transition-colors">
                        Google Sheets Rekapan
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Lihat tabel jumlah upload &amp; waktu pengiriman petugas
                      </p>
                    </div>
                  </div>
                  <div className="w-9 h-9 rounded-full bg-white border border-emerald-200 flex items-center justify-center text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                    <ExternalLink className="w-4 h-4" />
                  </div>
                </a>

                {/* Card Link Google Drive */}
                <a
                  href={GOOGLE_DRIVE_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center justify-between p-5 rounded-2xl border border-sky-200 bg-sky-50/40 hover:bg-sky-50 hover:border-[#1665B8] transition-all"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-[#1665B8] text-white flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
                      <FolderOpen className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-800 group-hover:text-[#0F5298] transition-colors">
                        Folder Google Drive Induk
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Buka arsip foto dokumentasi per tahun, bulan &amp; petugas
                      </p>
                    </div>
                  </div>
                  <div className="w-9 h-9 rounded-full bg-white border border-sky-200 flex items-center justify-center text-[#1665B8] group-hover:bg-[#1665B8] group-hover:text-white transition-colors">
                    <ExternalLink className="w-4 h-4" />
                  </div>
                </a>

              </div>

              <div className="bg-slate-50 px-6 py-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span>Login sebagai: <strong className="text-slate-700">Admin PLN</strong></span>
                <button
                  onClick={() => setActiveView('petugas')}
                  className="text-[#1665B8] hover:underline font-semibold"
                >
                  Ke Halaman Upload Petugas &rarr;
                </button>
              </div>
            </div>
          )}

        </div>
      </main>

        {/* Footer Hak Cipta */}
      <footer className="py-4 text-center text-xs text-slate-400 border-t border-slate-200/60 bg-transparent">
        <p>&copy; {new Date().getFullYear()} PT PLN ULP TULUNGAGUNG. SI-REKAP <br />Developed by PKL SKOMDA 2026. All rights reserved.</p>
      </footer>

      {/* Modal Notifikasi */}
      {modalMessage && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-sm w-full p-6 text-center space-y-4 border border-slate-100">
            <div className={`w-14 h-14 mx-auto rounded-2xl flex items-center justify-center ${
              modalType === 'success' 
                ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' 
                : 'bg-rose-50 text-rose-600 border border-rose-100'
            }`}>
              {modalType === 'success' ? (
                <CheckCircle2 className="w-8 h-8" />
              ) : (
                <AlertCircle className="w-8 h-8" />
              )}
            </div>
            
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                {modalType === 'success' ? 'Berhasil Terkirim!' : 'Perhatian'}
              </h3>
              <p className="text-sm text-slate-600 mt-1.5 leading-relaxed">
                {modalMessage}
              </p>
            </div>

            <button
              onClick={() => setModalMessage(null)}
              className="w-full bg-[#1665B8] hover:bg-[#0F5298] text-white font-semibold py-3 rounded-xl transition-colors text-sm shadow-md shadow-blue-600/15"
            >
              Selesai
            </button>
          </div>
        </div>
      )}

    </div>
  );
}