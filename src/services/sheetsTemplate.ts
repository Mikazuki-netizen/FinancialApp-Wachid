export const GOOGLE_APPS_SCRIPT_SOURCE = `/**
 * =========================================================================
 * FinancialApp Wachid — Google Sheets Headless Database Web App
 * Backend Script for Google Apps Script (script.google.com)
 * =========================================================================
 * 
 * PANDUAN DEPLOYMENT (PENTING AGAR TIDAK GAGAL):
 * 1. Buka spreadsheet baru di Google Sheets (https://sheets.new).
 * 2. Klik menu "Ekstensi" (Extensions) > "Apps Script".
 * 3. Hapus semua kode yang ada di Code.gs, lalu paste seluruh file ini dan klik Simpan (Ctrl+S / Cmd+S).
 * 4. OTORISASI PERTAMA KALI (WAJIB):
 *    - Di toolbar atas Apps Script, pilih fungsi "initDatabase", lalu klik tombol "Jalankan" (Run).
 *    - Google akan memunculkan popup "Otorisasi Diperlukan" (Authorization Required).
 *    - Klik "Tinjau Izin" (Review Permissions) > Pilih Akun Google Anda.
 *    - Klik "Lanjutan" (Advanced) di kiri bawah > Klik "Buka FinancialApp Wachid (tidak aman)" / "Go to ... (unsafe)".
 *    - Klik "Izinkan" (Allow).
 * 5. DEPLOY SEBAGAI WEB APP:
 *    - Klik tombol biru "Deploy" (Terapkan) di kanan atas > "Deployment baru" (New deployment).
 *    - Klik ikon gerigi jenis deployment, pilih "Aplikasi web" (Web app).
 *    - Deskripsi: "FinancialApp Wachid v1"
 *    - Jalankan sebagai (Execute as): "Saya" / "Me" (email Anda)
 *    - Yang memiliki akses (Who has access): "Siapa saja" / "Anyone"
 *    - Klik "Deploy", lalu SALIN Web App URL yang berakhiran "/exec".
 * 6. Masukkan URL tersebut ke Pengaturan aplikasi FinancialApp Wachid!
 */

const SHEET_NAMES = {
  TRANSACTIONS: 'Transactions',
  FIXED_BUDGETS: 'FixedBudgets',
  INVESTMENTS: 'Investments',
  USERS: 'Users'
};

const SCHEMAS = {
  Transactions: ['id', 'timestamp', 'userId', 'type', 'category', 'amount', 'description'],
  FixedBudgets: ['id', 'userId', 'name', 'amount', 'dueDate', 'isPaid'],
  Investments: ['id', 'userId', 'name', 'type', 'principal', 'apyPercent', 'netMonthlyYield', 'startDate'],
  Users: ['id', 'name', 'avatar', 'baseSalary', 'targetSavings']
};

function getDatabaseSpreadsheet(e) {
  let ss = SpreadsheetApp.getActiveSpreadsheet();
  if (ss) return ss;

  if (e && e.parameter && e.parameter.sheetId) {
    try {
      return SpreadsheetApp.openById(e.parameter.sheetId);
    } catch (err) {}
  }

  const props = PropertiesService.getScriptProperties();
  const savedId = props.getProperty('DB_SPREADSHEET_ID');
  if (savedId) {
    try {
      return SpreadsheetApp.openById(savedId);
    } catch (err) {}
  }

  try {
    ss = SpreadsheetApp.create('FinancialApp_Wachid_Database');
    props.setProperty('DB_SPREADSHEET_ID', ss.getId());
    return ss;
  } catch (err) {
    throw new Error('Gagal mengakses Google Spreadsheet. Pastikan sudah memberi izin akses.');
  }
}

function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('🚀 FinancialApp Wachid DB')
    .addItem('Inisialisasi Tabel Database', 'initDatabase')
    .addItem('Isi Data Contoh (Seed)', 'seedDatabase')
    .addToUi();
}

function initDatabase(e) {
  const ss = getDatabaseSpreadsheet(e);

  Object.entries(SCHEMAS).forEach(([sheetName, headers]) => {
    let sheet = ss.getSheetByName(sheetName);
    if (!sheet) {
      sheet = ss.insertSheet(sheetName);
    }
    
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(headers);
      const headerRange = sheet.getRange(1, 1, 1, headers.length);
      headerRange.setFontWeight('bold');
      headerRange.setBackground('#007AFF');
      headerRange.setFontColor('#FFFFFF');
      sheet.setFrozenRows(1);
    }
  });

  return { 
    status: 'success', 
    message: 'Semua tabel database berhasil diinisialisasi!',
    spreadsheetUrl: ss.getUrl()
  };
}

function seedDatabase(e) {
  initDatabase(e);
  const ss = getDatabaseSpreadsheet(e);

  const userSheet = ss.getSheetByName(SHEET_NAMES.USERS);
  if (userSheet.getLastRow() <= 1) {
    userSheet.appendRow(['user_1', 'Wachid', '👨‍💼', 0, 0]);
  }

  return { status: 'success', message: 'Tabel database bersih siap digunakan dari awal!' };
}

function doGet(e) {
  try {
    const action = (e && e.parameter && e.parameter.action) ? e.parameter.action : 'getAll';
    const ss = getDatabaseSpreadsheet(e);

    if (action === 'init') {
      const res = initDatabase(e);
      return jsonResponse(res);
    }

    if (action === 'seed') {
      const res = seedDatabase(e);
      return jsonResponse(res);
    }

    if (action === 'getAll') {
      const data = {
        users: readSheetData(ss, SHEET_NAMES.USERS),
        transactions: readSheetData(ss, SHEET_NAMES.TRANSACTIONS),
        fixedBudgets: readSheetData(ss, SHEET_NAMES.FIXED_BUDGETS),
        investments: readSheetData(ss, SHEET_NAMES.INVESTMENTS),
        spreadsheetUrl: ss.getUrl(),
        timestamp: new Date().toISOString()
      };
      return jsonResponse({ status: 'success', data: data });
    }

    return jsonResponse({ status: 'error', message: 'Action tidak dikenal: ' + action });
  } catch (error) {
    return jsonResponse({ status: 'error', message: error.toString() });
  }
}

function doPost(e) {
  try {
    let payload = {};
    if (e && e.postData && e.postData.contents) {
      try {
        payload = JSON.parse(e.postData.contents);
      } catch(err) {
        payload = e.parameter || {};
      }
    } else if (e && e.parameter) {
      payload = e.parameter;
    }

    if (payload && typeof payload.data === 'string') {
      try {
        payload.data = JSON.parse(payload.data);
      } catch(err) {}
    }

    const action = payload.action;
    const ss = getDatabaseSpreadsheet(e);

    switch (action) {
      case 'addTransaction': {
        const tx = payload.data;
        const sheet = ss.getSheetByName(SHEET_NAMES.TRANSACTIONS);
        sheet.appendRow([
          tx.id || ('tx_' + Date.now()),
          tx.timestamp || new Date().toISOString(),
          tx.userId,
          tx.type,
          tx.category,
          Number(tx.amount),
          tx.description || ''
        ]);
        SpreadsheetApp.flush();
        return jsonResponse({ status: 'success', message: 'Transaksi berhasil disimpan ke Google Sheets' });
      }

      case 'toggleFixedBudget': {
        const { id, isPaid } = payload.data;
        const sheet = ss.getSheetByName(SHEET_NAMES.FIXED_BUDGETS);
        const data = sheet.getDataRange().getValues();
        for (let i = 1; i < data.length; i++) {
          if (String(data[i][0]) === String(id)) {
            sheet.getRange(i + 1, 6).setValue(isPaid);
            SpreadsheetApp.flush();
            return jsonResponse({ status: 'success', message: 'Status pembayaran tagihan diperbarui' });
          }
        }
        return jsonResponse({ status: 'error', message: 'ID tagihan tidak ditemukan: ' + id });
      }

      case 'addInvestment': {
        const inv = payload.data;
        const sheet = ss.getSheetByName(SHEET_NAMES.INVESTMENTS);
        sheet.appendRow([
          inv.id || ('inv_' + Date.now()),
          inv.userId,
          inv.name || 'Deposito',
          inv.type || 'deposito',
          Number(inv.principal),
          Number(inv.apyPercent),
          Number(inv.netMonthlyYield),
          inv.startDate || new Date().toISOString()
        ]);
        SpreadsheetApp.flush();
        return jsonResponse({ status: 'success', message: 'Investasi berhasil disimpan ke Google Sheets' });
      }

      case 'syncAll': {
        if (payload.data && payload.data.transactions) {
          replaceSheetData(ss, SHEET_NAMES.TRANSACTIONS, SCHEMAS.Transactions, payload.data.transactions);
        }
        if (payload.data && payload.data.fixedBudgets) {
          replaceSheetData(ss, SHEET_NAMES.FIXED_BUDGETS, SCHEMAS.FixedBudgets, payload.data.fixedBudgets);
        }
        if (payload.data && payload.data.investments) {
          replaceSheetData(ss, SHEET_NAMES.INVESTMENTS, SCHEMAS.Investments, payload.data.investments);
        }
        if (payload.data && payload.data.users) {
          replaceSheetData(ss, SHEET_NAMES.USERS, SCHEMAS.Users, payload.data.users);
        }
        SpreadsheetApp.flush();
        return jsonResponse({ 
          status: 'success', 
          message: 'Semua data (' + (payload.data.transactions ? payload.data.transactions.length : 0) + ' transaksi) berhasil ditulis ke spreadsheet!',
          spreadsheetUrl: ss.getUrl()
        });
      }

      default:
        return jsonResponse({ status: 'error', message: 'Action POST tidak didukung: ' + action });
    }
  } catch (err) {
    return jsonResponse({ status: 'error', message: err.toString() });
  }
}

function readSheetData(ss, sheetName) {
  let sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    initDatabase();
    sheet = ss.getSheetByName(sheetName);
  }
  const rows = sheet.getDataRange().getValues();
  if (rows.length <= 1) return [];

  const headers = rows[0];
  const items = [];
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const item = {};
    headers.forEach((h, colIdx) => {
      item[h] = row[colIdx];
    });
    items.push(item);
  }
  return items;
}

function replaceSheetData(ss, sheetName, headers, dataArray) {
  let sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
  }
  sheet.clearContents();
  const rowsToAppend = (dataArray || []).map(item => headers.map(h => item[h] !== undefined ? item[h] : ''));
  const allRows = [headers, ...rowsToAppend];

  // Pastikan sheet memiliki baris yang cukup
  const currentMax = sheet.getMaxRows();
  if (currentMax < allRows.length) {
    sheet.insertRowsAfter(currentMax, allRows.length - currentMax);
  }

  sheet.getRange(1, 1, allRows.length, headers.length).setValues(allRows);

  // Format header row
  const headerRange = sheet.getRange(1, 1, 1, headers.length);
  headerRange.setFontWeight('bold');
  headerRange.setBackground('#007AFF');
  headerRange.setFontColor('#FFFFFF');
  sheet.setFrozenRows(1);
}

function jsonResponse(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
`;
