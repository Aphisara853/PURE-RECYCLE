// db.js — ตัวจัดการฐานข้อมูล SQLite
// เก็บยอด Coin จริงของแต่ละกระเป๋าไว้บนเซิร์ฟเวอร์
// ไม่เชื่อตัวเลข Coin ที่หน้าเว็บส่งมา
//
// ใช้ node:sqlite ที่มากับ Node.js เอง (Node 22.5+)

const { DatabaseSync } = require("node:sqlite");

const db = new DatabaseSync("pure_recycle.db");

// =====================================================
// สร้างตาราง
// =====================================================

db.exec(`
  CREATE TABLE IF NOT EXISTS scans (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    address TEXT NOT NULL,
    coin INTEGER NOT NULL DEFAULT 10,
    scan_hash TEXT,
    bottle_count INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS redemptions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    address TEXT NOT NULL,
    coin INTEGER NOT NULL,
    pure_amount REAL NOT NULL,
    tx_hash TEXT,
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS bonuses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    address TEXT NOT NULL,
    coin INTEGER NOT NULL,
    reason TEXT NOT NULL,
    created_at TEXT NOT NULL
  );
`);

// =====================================================
// ตรวจสอบฐานข้อมูลเดิม
// =====================================================

// เพิ่มคอลัมน์ให้ฐานข้อมูลเดิม
// โดยไม่ลบข้อมูลเก่า

const scanColumns = db
  .prepare("PRAGMA table_info(scans)")
  .all()
  .map(c => c.name);

if (!scanColumns.includes("scan_hash")) {
  db.exec("ALTER TABLE scans ADD COLUMN scan_hash TEXT");
}

if (!scanColumns.includes("bottle_count")) {
  db.exec(
    "ALTER TABLE scans ADD COLUMN bottle_count INTEGER NOT NULL DEFAULT 1"
  );
}

// อนุญาตให้รูปเดิมถูกสแกนซ้ำได้
// จึงไม่ใช้ UNIQUE index กับ scan_hash

db.exec("DROP INDEX IF EXISTS idx_scans_address_hash");

// =====================================================
// วันที่ปัจจุบันตามเวลาไทย
// =====================================================

function todayStr() {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Bangkok",
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).formatToParts(new Date());

  const v = Object.fromEntries(
    parts.map(p => [p.type, p.value])
  );

  return `${v.year}-${v.month}-${v.day}`;
}

// =====================================================
// นับจำนวนสแกนสำเร็จของวันนี้
// =====================================================

function countScansToday(address) {
  const row = db
    .prepare(`
      SELECT COUNT(*) AS c
      FROM scans
      WHERE address = ?
      AND date(datetime(created_at, '+7 hours')) = ?
    `)
    .get(
      address.toLowerCase(),
      todayStr()
    );

  return row.c;
}

// =====================================================
// ตรวจว่ารูปนี้เคยถูกสแกนหรือยัง
// =====================================================

function hasScanHash(address, hash) {
  if (!hash) return false;

  return !!db
    .prepare(`
      SELECT 1
      FROM scans
      WHERE address = ?
      AND scan_hash = ?
      LIMIT 1
    `)
    .get(
      address.toLowerCase(),
      hash.toLowerCase()
    );
}

// =====================================================
// บันทึกการสแกน
// =====================================================

function recordScan(
  address,
  coin = 10,
  hash = null,
  bottleCount = 1
) {
  db.prepare(`
    INSERT INTO scans (
      address,
      coin,
      scan_hash,
      bottle_count,
      created_at
    )
    VALUES (?, ?, ?, ?, ?)
  `).run(
    address.toLowerCase(),
    coin,
    hash ? hash.toLowerCase() : null,
    bottleCount,
    new Date().toISOString()
  );
}

// =====================================================
// โบนัสจากการสแกนครบ 5 ครั้ง
// =====================================================
//
// ตัวอย่าง
//
// ครั้งที่ 1 → +10 Coin
// ครั้งที่ 2 → +10 Coin
// ครั้งที่ 3 → +10 Coin
// ครั้งที่ 4 → +10 Coin
// ครั้งที่ 5 → +10 Coin + โบนัส 10 Coin
//
// ครั้งที่ 10 → โบนัสอีก 10 Coin
// ครั้งที่ 15 → โบนัสอีก 10 Coin
// ครั้งที่ 20 → โบนัสอีก 10 Coin
//
// โบนัสจะถูกเก็บในตาราง bonuses
// และถูกนำไปรวมกับยอด Coin จริง

function recordBonus(
  address,
  coin = 10,
  reason = "five_scan_bonus"
) {
  db.prepare(`
    INSERT INTO bonuses (
      address,
      coin,
      reason,
      created_at
    )
    VALUES (?, ?, ?, ?)
  `).run(
    address.toLowerCase(),
    coin,
    reason,
    new Date().toISOString()
  );
}

// =====================================================
// Coin ที่ได้รับทั้งหมด
// =====================================================
//
// รวมจาก
// 1. Coin จากการสแกน
// 2. Coin โบนัสจากครบ 5 ครั้ง

function totalEarned(address) {
  const row = db
    .prepare(`
      SELECT
        (
          SELECT COALESCE(SUM(coin), 0)
          FROM scans
          WHERE address = ?
        )
        +
        (
          SELECT COALESCE(SUM(coin), 0)
          FROM bonuses
          WHERE address = ?
        )
        AS total
    `)
    .get(
      address.toLowerCase(),
      address.toLowerCase()
    );

  return row.total;
}

// =====================================================
// Coin ที่แลกไปแล้ว
// =====================================================

function totalRedeemed(address) {
  const row = db
    .prepare(`
      SELECT
        COALESCE(SUM(coin), 0) AS total
      FROM redemptions
      WHERE address = ?
    `)
    .get(
      address.toLowerCase()
    );

  return row.total;
}

// =====================================================
// Coin ที่เหลือให้แลกได้
// =====================================================

function availableCoin(address) {
  return totalEarned(address) - totalRedeemed(address);
}

// =====================================================
// บันทึกการแลก Coin → Token
// =====================================================

function recordRedemption(
  address,
  coin,
  pureAmount,
  txHash
) {
  db.prepare(`
    INSERT INTO redemptions (
      address,
      coin,
      pure_amount,
      tx_hash,
      created_at
    )
    VALUES (?, ?, ?, ?, ?)
  `).run(
    address.toLowerCase(),
    coin,
    pureAmount,
    txHash,
    new Date().toISOString()
  );
}

// =====================================================
// Export
// =====================================================

module.exports = {
  countScansToday,

  recordScan,
  hasScanHash,

  // โบนัสครบทุก 5 ครั้ง
  recordBonus,

  // ยอด Coin
  totalEarned,
  totalRedeemed,
  availableCoin,

  // การแลกเหรียญ
  recordRedemption
};