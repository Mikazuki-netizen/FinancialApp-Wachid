# FinancialApp Wachid — Personal Financial Tracker

Aplikasi finansial personal modern dengan desain Apple iOS Liquid Glassmorphism, kalkulasi arus kas bulanan (*Net Cashflow*), target tabungan dinamis, pencatatan tagihan tetap, kalkulator imbal hasil deposito, serta sinkronisasi headless database langsung ke **Google Spreadsheet**.

---

## 🚀 Fitur Utama
1. **Profil Personal (Wachid)**: Dikhususkan untuk pencatatan keuangan mandiri ayah dengan fresh start tanpa data masa lalu.
2. **Formula Arus Kas Presisi**:
   - Gaji Pokok & Pemasukan Rutin
   - Tagihan & Beban Tetap (*Fixed Obligations*)
   - Pengeluaran Harian & Kategori (*Daily Expenses*)
   - Target Tabungan Fleksibel Bulanan (*Monthly Target*)
   - Akumulasi Sisa Kas Bersih (*Net Cashflow Surplus*)
3. **Kalkulator Deposito & Investasi**: Menghitung bunga kotor, pajak bunga 20%, dan *net yield* per bulan.
4. **Sinkronisasi Otomatis Google Sheets**: Menggunakan Google Apps Script sebagai REST API database tanpa biaya server.
5. **Dukungan Mobile Android & PWA**: Siap dipasang di smartphone Android via PWA (Add to Home Screen) atau build APK via Capacitor.

---

## 💻 Cara Menjalankan Lokal

```bash
# Jalankan development server
npm run dev
```

Aplikasi dapat diakses di browser: `http://localhost:5173`.

---

## 🌐 Panduan Hubungkan ke Vercel App Baru (Continuous Deployment)

Agar setiap kali Anda menjalankan `git push`, aplikasi otomatis ter-update di alamat Vercel yang baru:

### Langkah 1: Buat Repository Baru di GitHub
1. Buka [github.com/new](https://github.com/new).
2. Isi nama repository: `FinancialApp-Wachid`.
3. Pilih **Private** atau **Public** sesuai kebutuhan.
4. Jangan centang "Add a README file" (karena sudah ada di lokal).
5. Klik **Create repository**.

### Langkah 2: Hubungkan Git Lokal & Push ke GitHub
Jalankan perintah berikut di terminal:
```bash
cd "/Users/yahya/App Financial Ayah"
git remote add origin https://github.com/Mikazuki-netizen/FinancialApp-Wachid.git
git push -u origin main
```
*(Ganti URL di atas jika username GitHub Anda berbeda).*

### Langkah 3: Hubungkan Repository ke Vercel Baru
1. Buka dashboard Vercel di [vercel.com/dashboard](https://vercel.com/dashboard).
2. Klik tombol **"Add New..."** di kanan atas $\rightarrow$ Pilih **"Project"**.
3. Di daftar repository GitHub, cari **`FinancialApp-Wachid`** lalu klik **"Import"**.
4. Di bagian **Configure Project**:
   - **Project Name**: `financialapp-wachid` (atau nama custom sesuai selera). Alamat Vercel Anda nantinya adalah: `financialapp-wachid.vercel.app`.
   - **Framework Preset**: Vite (terdeteksi otomatis).
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Klik **"Deploy"**.
6. Selesai! Mulai saat ini, setiap kali Anda melakukan perubahan dan `git push`, Vercel akan otomatis melakukan build dan deploy ke alamat Vercel baru tersebut.

---

## 📊 Panduan Menghubungkan ke Google Spreadsheet Baru

### Langkah 1: Buat Spreadsheet Baru
1. Buka browser dan buka [sheets.new](https://sheets.new) di akun Google Ayah.
2. Beri judul spreadsheet: **FinancialApp Wachid Database**.

### Langkah 2: Pasang Skrip Backend
1. Di menu spreadsheet, klik **Ekstensi (Extensions)** > **Apps Script**.
2. Hapus seluruh kode bawaan di `Code.gs`.
3. Buka file [`google-apps-script/Code.gs`](file:///Users/yahya/App%20Financial%20Ayah/google-apps-script/Code.gs) di proyek ini (atau salin langsung dari popup **Pengaturan ⚙️ > Salin Kode Apps Script** di web).
4. Paste seluruh kode tersebut ke editor Apps Script, lalu klik icon **Simpan (Save)**.

### Langkah 3: Inisialisasi Database (Wajib 1x di Awal)
1. Di toolbar atas Apps Script, pilih fungsi **`initDatabase`** dari dropdown pilihan fungsi (di sebelah tombol Jalankan/Debug).
2. Klik tombol **Jalankan (Run)**.
3. Google akan memunculkan verifikasi izin:
   - Klik **Tinjau Izin (Review Permissions)** $\rightarrow$ Pilih akun Google.
   - Klik teks **Lanjutan (Advanced)** di kiri bawah.
   - Klik **Buka FinancialApp Wachid (tidak aman)** / *Go to ... (unsafe)*.
   - Klik **Izinkan (Allow)**.
4. Periksa Google Sheets: Otomatis telah terbentuk 4 tab: `Transactions`, `FixedBudgets`, `Investments`, dan `Users`.

### Langkah 4: Publikasikan (Deploy) Sebagai Web App
1. Di pojok kanan atas Apps Script, klik tombol biru **Deploy (Terapkan)** $\rightarrow$ **Deployment baru (New deployment)**.
2. Klik ikon gerigi jenis deployment $\rightarrow$ Pilih **Aplikasi web (Web app)**.
3. Atur konfigurasi berikut:
   - **Deskripsi**: `FinancialApp Wachid v1`
   - **Jalankan sebagai (Execute as)**: `Saya (email Anda/ayah)`
   - **Yang memiliki akses (Who has access)**: **`Siapa saja (Anyone)`** *(Wajib 'Anyone' agar aplikasi web dapat bertukar data tanpa terhalang login OAuth Google)*.
4. Klik **Deploy**.
5. Salin **URL Aplikasi Web (Web App URL)** yang berakhiran `/exec`.

### Langkah 5: Masukkan URL ke Aplikasi
1. Buka aplikasi FinancialApp Wachid (baik di lokal maupun di alamat Vercel baru).
2. Klik icon **Pengaturan ⚙️** di pojok kanan atas.
3. Di bagian **Integrasi Google Sheets**, paste URL `/exec` yang tadi disalin.
4. Klik **Tes Koneksi & Simpan**.
5. Klik **Tarik dari Sheets** untuk mengambil data atau **Kirim ke Sheets** untuk sinkronisasi.
