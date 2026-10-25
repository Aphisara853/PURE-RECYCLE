require('dotenv').config();

const express = require('express');
const cors = require('cors');
const { ethers } = require('ethers');
const crypto = require('node:crypto');
const db = require('./db');

const app = express();

app.use(cors());
app.use(express.json({ limit: "15mb" }));

// =====================================================
// ตั้งค่า
// =====================================================

const RPC_URL =
  process.env.RPC_URL ||
  "https://data-seed-prebsc-1-s1.bnbchain.org:8545";

const TOKEN_ADDRESS =
  process.env.TOKEN_ADDRESS ||
  process.env.CONTRACT_ADDRESS ||
  "0x2ee52F62DEf3D0Fa3F15Ac4F45b898C93f11A308";

const PRIVATE_KEY = process.env.PRIVATE_KEY;

if (!PRIVATE_KEY) {
  console.error("❌ ไม่พบ PRIVATE_KEY ในไฟล์ .env");
  process.exit(1);
}

const TOKEN_ABI = [
  "function transfer(address to, uint256 amount) returns (bool)",
  "function decimals() view returns (uint8)"
];

// =====================================================
// ค่ารางวัล
// =====================================================

const COIN_PER_ACCEPTED_ITEM = 10;

// รับสูงสุด 20 ขวด/กระป๋องต่อรูป
const MAX_ACCEPTED_ITEMS_PER_IMAGE = 20;

// สแกนสูงสุด 20 ครั้งต่อวัน
const MAX_SCANS_PER_DAY = 20;

// โบนัสเมื่อสแกนครบทุก 5 ครั้ง
const BONUS_SCAN_INTERVAL = 5;
const BONUS_COIN = 10;

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODEL =
  process.env.GEMINI_MODEL || "gemini-3.8-flash";

// 100 Coin = 1 PURE
const COIN_PER_TOKEN = 100;

// =====================================================
// Blockchain
// =====================================================

const provider = new ethers.JsonRpcProvider(RPC_URL);

const wallet = new ethers.Wallet(
  PRIVATE_KEY,
  provider
);

const tokenContract = new ethers.Contract(
  TOKEN_ADDRESS,
  TOKEN_ABI,
  wallet
);

// กันกดแลกซ้อนกันจากกระเป๋าเดียวกัน
const busy = new Set();

// =====================================================
// Helper
// =====================================================

function bad(res, code, error) {
  return res.status(code).json({
    ok: false,
    error
  });
}

// =====================================================
// ดูยอด Coin
// =====================================================

app.get('/balance/:address', (req, res) => {
  const { address } = req.params;

  if (!ethers.isAddress(address)) {
    return bad(
      res,
      400,
      "ที่อยู่กระเป๋าไม่ถูกต้อง"
    );
  }

  const scansToday = db.countScansToday(address);

  res.json({
    ok: true,

    // Coin ที่หาได้ทั้งหมด
    earned: db.totalEarned(address),

    // Coin ที่แลกไปแล้ว
    redeemed: db.totalRedeemed(address),

    // Coin ที่ยังสามารถแลกได้
    coinAvailable: db.availableCoin(address),

    // จำนวนครั้งที่สแกนวันนี้
    scansToday: scansToday,

    // จำนวนครั้งที่เหลือก่อนถึง 20 ครั้ง
    scansRemaining: Math.max(
      0,
      MAX_SCANS_PER_DAY - scansToday
    )
  });
});

// =====================================================
// SCAN
// =====================================================

app.post('/scan', async (req, res) => {

  const {
    address,
    imageBase64,
    mimeType
  } = req.body || {};

  // ---------------------------------------------------
  // ตรวจสอบ Address
  // ---------------------------------------------------

  if (
    !address ||
    !ethers.isAddress(address)
  ) {
    return bad(
      res,
      400,
      "ที่อยู่กระเป๋าไม่ถูกต้อง"
    );
  }

  // ---------------------------------------------------
  // ตรวจ Gemini API
  // ---------------------------------------------------

  if (!GEMINI_API_KEY) {
    return bad(
      res,
      503,
      "กรุณาตั้งค่า GEMINI_API_KEY ในไฟล์ .env ก่อนใช้ AI"
    );
  }

  // ---------------------------------------------------
  // ตรวจรูป
  // ---------------------------------------------------

  if (
    typeof imageBase64 !== 'string' ||
    !imageBase64 ||
    imageBase64.length > 12_000_000
  ) {
    return bad(
      res,
      400,
      "ไม่พบรูปภาพหรือไฟล์ใหญ่เกินไป"
    );
  }

  if (
    ![
      'image/jpeg',
      'image/png',
      'image/webp'
    ].includes(mimeType)
  ) {
    return bad(
      res,
      400,
      "รองรับเฉพาะ JPG, PNG และ WEBP"
    );
  }

  // ---------------------------------------------------
  // สร้าง Hash ของรูป
  // ---------------------------------------------------

  const actualHash =
    crypto
      .createHash('sha256')
      .update(
        Buffer.from(imageBase64, 'base64')
      )
      .digest('hex');

  // ---------------------------------------------------
  // จำกัดจำนวนสแกนต่อวัน
  // ---------------------------------------------------

  const currentScans =
    db.countScansToday(address);

  if (currentScans >= MAX_SCANS_PER_DAY) {

    return bad(
      res,
      429,
      `คุณสแกนครบ ${MAX_SCANS_PER_DAY} ครั้งของวันนี้แล้ว`
    );
  }

  // อนุญาตให้ใช้รูปเดิมสแกนซ้ำได้

  try {

    // =================================================
    // Gemini Vision
    // =================================================

    const prompt = `
วิเคราะห์ภาพและนับ "เฉพาะขวดและกระป๋อง" เท่านั้น

สิ่งที่ต้องนับ:

1) water_bottle =
ขวดทุกแบบ ทุกสี ทุกขนาด และทุกวัสดุ
หากมีลักษณะเป็น "ขวด" อย่างชัดเจน ให้นับทั้งหมด

ตัวอย่าง:
ขวดน้ำ
ขวดน้ำอัดลม
ขวดน้ำผลไม้
ขวดนม
ขวดซอส
ขวดเครื่องปรุง
ขวดแชมพู
ขวดสบู่
ขวดน้ำยาทำความสะอาด
ขวดยา
ขวดเครื่องสำอาง
ขวดแก้ว
ขวดพลาสติก
ขวดโลหะ
ฯลฯ

2) can =
กระป๋องทุกแบบที่เป็นกระป๋องจริง

ตัวอย่าง:
กระป๋องเครื่องดื่ม
กระป๋องอาหาร
กระป๋องอลูมิเนียม
กระป๋องเหล็ก
กระป๋องโลหะอื่น ๆ

สิ่งที่ห้ามนับ:

แก้วน้ำ
แก้วดื่ม
ถ้วย
จาน
ถุง
กล่อง
กระดาษ
อาหาร
รองเท้า
ของเล่น
กระปุกที่ไม่ใช่ขวด
กระบอกน้ำที่ไม่ใช่ขวด
และสิ่งของอื่น ๆ ที่ไม่ใช่ขวดหรือกระป๋อง

กติกาการนับ:

- นับขวดและกระป๋องที่มองเห็นเป็นวัตถุแยกกันทีละชิ้น
- ขวด 1 ใบ = count 1
- กระป๋อง 1 ใบ = count 1
- ถ้ามี 3 ขวด + 2 กระป๋อง ให้รวมเป็น 5 ชิ้น
- ห้ามนับวัตถุเดียวซ้ำ
- ไม่นับรูปวาด
- ไม่นับรูปบนหน้าจอ
- ไม่นับสิ่งที่ไม่ใช่วัตถุจริง
- ถ้าวัตถุถูกบังจนไม่สามารถยืนยันว่าเป็นขวดหรือกระป๋องจริง ๆ ได้ ให้ไม่นับ
- สี รูปแบบ ฉลาก ยี่ห้อ และวัสดุไม่ใช่เหตุผลในการตัดออก หากยังมีลักษณะเป็นขวดหรือกระป๋องอย่างชัดเจน
- จำกัดจำนวนที่รับรางวัลสูงสุด 20 ชิ้นต่อภาพ

ตอบ JSON เท่านั้นตามรูปแบบ:

{
  "accepted_items": [
    {
      "type": "water_bottle",
      "count": integer
    },
    {
      "type": "can",
      "count": integer
    }
  ],
  "confidence": number
}

count ต้องเป็นจำนวนเต็มไม่ติดลบ
confidence อยู่ระหว่าง 0 ถึง 1
`;

    // =================================================
    // เรียก Gemini
    // =================================================

    const ai = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`,
      {
        method: 'POST',

        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': GEMINI_API_KEY
        },

        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt
                },
                {
                  inline_data: {
                    mime_type: mimeType,
                    data: imageBase64
                  }
                }
              ]
            }
          ],

          generationConfig: {
            responseMimeType: 'application/json'
          }
        })
      }
    );

    // =================================================
    // อ่านผล Gemini
    // =================================================

    const data = await ai.json();

    if (!ai.ok) {

      console.error(
        'Gemini:',
        data?.error?.message || ai.status
      );

      return bad(
        res,
        502,
        "AI ตรวจภาพไม่สำเร็จ กรุณาลองใหม่"
      );
    }

    const raw =
      data?.candidates?.[0]?.content?.parts
        ?.map(x => x.text || '')
        .join('') || '';

    let verdict;

    try {

      verdict = JSON.parse(
        raw
          .replace(/^```json\s*|```$/g, '')
          .trim()
      );

    } catch {

      return bad(
        res,
        502,
        "AI ส่งผลตรวจสอบไม่ถูกต้อง"
      );
    }

    // =================================================
    // ตรวจประเภทที่อนุญาต
    // =================================================

    const allowedTypes = [
      'water_bottle',
      'can'
    ];

    const rawItems =
      Array.isArray(verdict.accepted_items)
        ? verdict.accepted_items
        : [];

    const acceptedItems =
      allowedTypes.map(type => {

        const found =
          rawItems.find(
            item =>
              item &&
              item.type === type
          );

        const count =
          Math.max(
            0,
            Math.min(
              MAX_ACCEPTED_ITEMS_PER_IMAGE,
              Math.floor(
                Number(found?.count) || 0
              )
            )
          );

        return {
          type,
          count
        };
      });

    // =================================================
    // รวมจำนวนขวด + กระป๋อง
    // =================================================

    const totalCount =
      Math.min(
        MAX_ACCEPTED_ITEMS_PER_IMAGE,
        acceptedItems.reduce(
          (sum, item) =>
            sum + item.count,
          0
        )
      );

    // -------------------------------------------------
    // ถ้าไม่ผ่าน
    // -------------------------------------------------

    if (
      totalCount < 1 ||
      Number(verdict.confidence || 0) < 0.65
    ) {

      return res.status(422).json({
        ok: false,
        passed: false,
        error:
          'ไม่พบขวดหรือกระป๋องที่ชัดเจน จึงไม่ได้รับ Coin'
      });
    }

    // =================================================
    // ปรับจำนวนไม่ให้เกิน 20 ชิ้น
    // =================================================

    let remaining = totalCount;

    for (const item of acceptedItems) {

      item.count =
        Math.min(
          item.count,
          remaining
        );

      remaining -= item.count;
    }

    // =================================================
    // Coin จากการสแกนปกติ
    // =================================================

    const coin =
      totalCount *
      COIN_PER_ACCEPTED_ITEM;

    // =================================================
    // บันทึกการสแกน
    // =================================================

    db.recordScan(
      address,
      coin,
      actualHash,
      totalCount
    );

    // =================================================
    // จำนวนสแกนหลังจากสแกนครั้งนี้
    // =================================================

    const scansToday =
      db.countScansToday(address);

    // =================================================
    // โบนัสทุกครบ 5 ครั้ง
    //
    // ครั้งที่ 5  = +10
    // ครั้งที่ 10 = +10
    // ครั้งที่ 15 = +10
    // ครั้งที่ 20 = +10
    // =================================================

    let bonusCoin = 0;

    if (
      scansToday % BONUS_SCAN_INTERVAL === 0
    ) {

      bonusCoin = BONUS_COIN;

      db.recordBonus(
        address,
        BONUS_COIN,
        `ครบ ${scansToday} ครั้ง`
      );
    }

    // =================================================
    // Coin ที่ได้รับในรอบนี้ทั้งหมด
    // =================================================

    const totalCoin =
      coin + bonusCoin;

    // =================================================
    // Coin ที่ยังสามารถแลกได้
    // =================================================

    const coinAvailable =
      db.availableCoin(address);

    // =================================================
    // ส่งผลกลับหน้าเว็บ
    // =================================================

    return res.json({

      ok: true,

      passed: true,

      acceptedItems,

      totalCount,

      // Coin จากขวด/กระป๋อง
      coin,

      // โบนัสครบ 5 ครั้ง
      bonusCoin,

      // รวม Coin รอบนี้
      totalCoin,

      // จำนวนครั้งที่สแกนวันนี้
      scansToday,

      // Coin ที่เหลือให้แลก
      coinAvailable
    });

  } catch (e) {

    console.error(
      'Scan error:',
      e.message
    );

    return bad(
      res,
      500,
      "เกิดข้อผิดพลาดระหว่างตรวจภาพ กรุณาลองใหม่"
    );
  }
});

// =====================================================
// แลก Coin เป็น PURE
// =====================================================

app.post('/redeem', async (req, res) => {

  const {
    address,
    coinAmount
  } = req.body || {};

  const amount =
    Number(coinAmount);

  // ---------------------------------------------------
  // ตรวจ Address
  // ---------------------------------------------------

  if (
    !address ||
    !ethers.isAddress(address)
  ) {
    return bad(
      res,
      400,
      "ที่อยู่กระเป๋าไม่ถูกต้อง"
    );
  }

  // ---------------------------------------------------
  // ตรวจจำนวน Coin
  // ---------------------------------------------------

  if (
    !Number.isInteger(amount) ||
    amount < COIN_PER_TOKEN ||
    amount % COIN_PER_TOKEN !== 0
  ) {

    return bad(
      res,
      400,
      `จำนวน Coin ต้องมีอย่างน้อย ${COIN_PER_TOKEN} และเพิ่มทีละ ${COIN_PER_TOKEN}`
    );
  }

  // ---------------------------------------------------
  // ตรวจยอด Coin
  // ---------------------------------------------------

  if (
    amount >
    db.availableCoin(address)
  ) {

    return bad(
      res,
      400,
      "Coin ไม่พอสำหรับแลก"
    );
  }

  // ---------------------------------------------------
  // ป้องกันกดแลกซ้อน
  // ---------------------------------------------------

  const key =
    address.toLowerCase();

  if (busy.has(key)) {

    return bad(
      res,
      429,
      "มีคำขอแลกที่กำลังประมวลผลอยู่ กรุณารอสักครู่"
    );
  }

  busy.add(key);

  try {

    // -------------------------------------------------
    // คำนวณจำนวน PURE
    // -------------------------------------------------

    const pureAmount =
      amount / COIN_PER_TOKEN;

    // -------------------------------------------------
    // โอน Token จาก Wallet กลาง
    // -------------------------------------------------

    const tx =
      await tokenContract.transfer(
        address,
        ethers.parseUnits(
          pureAmount.toString(),
          18
        )
      );

    // -------------------------------------------------
    // รอ Transaction ยืนยัน
    // -------------------------------------------------

    const receipt =
      await tx.wait();

    // -------------------------------------------------
    // บันทึกประวัติการแลก
    // -------------------------------------------------

    db.recordRedemption(
      address,
      amount,
      pureAmount,
      receipt.hash
    );

    // -------------------------------------------------
    // ส่งผลกลับ
    // -------------------------------------------------

    res.json({

      ok: true,

      txHash: receipt.hash,

      explorerUrl:
        "https://testnet.bscscan.com/tx/" +
        receipt.hash
    });

  } catch (e) {

    console.error(
      "❌ [Redeem Error]:",
      e.message
    );

    bad(
      res,
      500,
      "โอนเหรียญไม่สำเร็จ: " +
      e.message
    );

  } finally {

    busy.delete(key);
  }
});

// =====================================================
// START SERVER
// =====================================================

const PORT =
  process.env.PORT || 3000;

app.listen(PORT, () => {

  console.log(
    `🔥 relayer พร้อมทำงานที่พอร์ต ${PORT}`
  );

  console.log(
    `💼 Wallet กลาง: ${wallet.address}`
  );

  console.log(
    `🪙 Token: ${TOKEN_ADDRESS}`
  );

  console.log(
    `🎁 โบนัส: สแกนครบทุก ${BONUS_SCAN_INTERVAL} ครั้ง = +${BONUS_COIN} Coin`
  );

});