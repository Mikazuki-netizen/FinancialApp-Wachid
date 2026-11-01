# FinTrack Ayah — Pencatat Keuangan Pribadi (Wachid)

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

## 💻 Cara Menjalankan Aplikasi

```bash
# Jalankan development server
npm run dev
```

Aplikasi dapat diakses di browser: `http://localhost:5173`.

Untuk mengakses dari HP Android di jaringan Wi-Fi yang sama:
```bash
npm run dev -- --host
```
Lalu buka alamat IP Mac Anda yang tertera di terminal (contoh: `http://192.168.1.xxx:5173`).

---

## 📊 Panduan Menghubungkan ke Google Spreadsheet Ayah

Aplikasi ini menggunakan skrip backend ringan **Google Apps Script** yang ditautkan ke Google Spreadsheet.

### Langkah 1: Siapkan Spreadsheet
1. Buka browser dan buat spreadsheet baru di akun Google Ayah: [sheets.new](https://sheets.new) (atau buka spreadsheet yang sudah ada).
2. Beri nama file spreadsheet, misalnya: **FinTrack Ayah Database**.

### Langkah 2: Pasang Skrip Backend
1. Di menu Google Sheets, klik **Ekstensi (Extensions)** > **Apps Script**.
2. Hapus seluruh isi di tab `Code.gs`.
3. Buka file [`google-apps-script/Code.gs`](file:///Users/yahya/App%20Financial%20Ayah/google-apps-script/Code.gs) di project ini (atau salin langsung dari menu **Pengaturan ⚙️ > Salin Kode Apps Script** di dalam aplikasi).
4. Paste seluruh kode tersebut ke editor Apps Script, lalu klik icon **Simpan** (Ctrl+S / Cmd+S).

### Langkah 3: Inisialisasi Tabel & Izin Google (Wajib Sekali di Awal)
1. Di toolbar atas Apps Script, pilih fungsi **`initDatabase`** dari dropdown pilihan fungsi (di sebelah tombol Jalankan/Debug).
2. Klik tombol **Jalankan (Run)**.
3. Google akan memunculkan jendela *"Otorisasi Diperlukan"*:
   - Klik **Tinjau Izin (Review Permissions)** > Pilih Akun Google.
   - Klik **Lanjutan (Advanced)** di pojok kiri bawah.
   - Klik **Buka FinTrack Ayah (tidak aman)** / *Go to ... (unsafe)*.
   - Klik **Izinkan (Allow)**.
4. Periksa Google Sheets Anda: Otomatis telah terbentuk 4 tab rapi: `Transactions`, `FixedBudgets`, `Investments`, dan `Users`.

### Langkah 4: Terapkan (Deploy) Sebagai Web App
1. Di pojok kanan atas Apps Script, klik tombol biru **Deploy (Terapkan)** > **Deployment baru (New deployment)**.
2. Klik ikon gerigi jenis deployment, pilih **Aplikasi web (Web app)**.
3. Isi konfigurasi berikut:
   - **Deskripsi**: `FinTrack Ayah v1`
   - **Jalankan sebagai (Execute as)**: `Saya (email Anda)`
   - **Yang memiliki akses (Who has access)**: **`Siapa saja (Anyone)`** *(PENTING: Harus dipilih "Siapa saja" agar aplikasi web dapat membaca & menulis data tanpa login pop-up Google OAuth)*.
4. Klik **Deploy**.
5. Salin **URL Aplikasi Web (Web App URL)** yang berakhiran `/exec`.

### Langkah 5: Hubungkan ke Aplikasi FinTrack Ayah
1. Buka aplikasi FinTrack Ayah di browser atau HP.
2. Ketuk icon **Pengaturan ⚙️** di pojok kanan atas.
3. Di bagian **Integrasi Google Sheets**, paste URL `/exec` yang tadi disalin.
4. Klik **Tes Koneksi & Simpan**.
5. Klik tombol **Tarik dari Sheets** untuk membaca data atau **Kirim ke Sheets** untuk mencadangkan data lokal.
