# ♻️ PURE RECYCLE

**เว็บแอปพลิเคชันส่งเสริมการรีไซเคิลด้วย AI และ Blockchain**

PURE RECYCLE เป็นเว็บแอปพลิเคชันที่ส่งเสริมการคัดแยกขยะ โดยผู้ใช้สามารถถ่ายภาพหรืออัปโหลดภาพขยะให้ AI ช่วยตรวจสอบ เมื่อผ่านเงื่อนไขของระบบ ผู้ใช้จะได้รับ Coin สะสม และสามารถแลก Coin เป็น Token เพื่อโอนไปยังกระเป๋า MetaMask ผ่านเทคโนโลยี Blockchain ได้

โปรเจกต์นี้พัฒนาขึ้นเพื่อศึกษาและทดลองประยุกต์ใช้ AI และ Blockchain ในการสร้างแรงจูงใจให้ผู้คนคัดแยกขยะอย่างถูกต้อง

## ✨ 1. คุณสมบัติของระบบ

- 🔗 เชื่อมต่อกระเป๋า MetaMask
- 📸 ถ่ายภาพหรืออัปโหลดภาพขยะเพื่อสแกน
- 🤖 ใช้ AI ช่วยตรวจสอบภาพขยะ
- 🪙 รับและสะสม Coin เมื่อผ่านเงื่อนไขของระบบ
- 🎁 รับโบนัสภารกิจเมื่อสแกนครบทุก 5 ครั้ง รับเพิ่ม 10 Coin ตามกติกาที่กำหนด
- 💱 แลก Coin เป็น Token ในอัตรา 100 Coin = 1 Token
- ⛓️ โอน Token ไปยังกระเป๋าผู้ใช้ผ่าน Blockchain
- 📋 แสดงข้อมูลสรุปและประวัติการสแกน

### หน้าหลักของระบบ

1. **Home** — แสดงข้อมูลสรุปและยอด Coin
2. **Recycle Scan** — ถ่ายภาพหรืออัปโหลดภาพขยะเพื่อรับ Coin
3. **History** — แสดงประวัติการสแกนตามที่ระบบออกแบบไว้

## 🛠️ 2. เทคโนโลยีที่ใช้

| เทคโนโลยี | หน้าที่ |
|---|---|
| HTML | โครงสร้างหน้าเว็บ |
| CSS | ออกแบบและจัดรูปแบบหน้าเว็บ |
| JavaScript | ควบคุมการทำงานของ Frontend |
| Node.js | ทำงานฝั่งเซิร์ฟเวอร์ |
| Express.js | สร้าง API สำหรับรับส่งข้อมูล |
| SQLite | จัดเก็บข้อมูลการสแกนและ Coin |
| Google Gemini API | ช่วยตรวจสอบภาพด้วย AI |
| Ethers.js | เชื่อมต่อ Blockchain และจัดการธุรกรรม |
| MetaMask | เชื่อมต่อกระเป๋าของผู้ใช้ |
| BNB Chain Testnet | เครือข่าย Blockchain สำหรับทดสอบ |

## 📦 3. สิ่งที่ต้องเตรียม

- คอมพิวเตอร์ Windows และอินเทอร์เน็ต
- Git หรือใช้วิธีดาวน์โหลด ZIP จาก GitHub
- Node.js และ npm
- Visual Studio Code
- MetaMask
- ค่า API Key, RPC URL และตัวแปรสภาพแวดล้อมที่โปรเจกต์ต้องใช้

**GitHub Repository:**  
https://github.com/Aphisara853/PURE-RECYCLE

## 💻 4. ตรวจสอบและติดตั้งเครื่องมือ

### 4.1 ตรวจสอบ Node.js และ npm

เปิด PowerShell หรือ Terminal ใน VS Code แล้วรันคำสั่งทีละบรรทัด

```powershell
node -v
```

```powershell
npm.cmd -v
```

หากแสดงหมายเลขเวอร์ชัน แสดงว่าพร้อมใช้งาน หากยังไม่มี Node.js ให้ดาวน์โหลดรุ่น LTS จาก https://nodejs.org/

### 4.2 ตรวจสอบ Git

```powershell
git --version
```

หากยังไม่มี Git ให้ติดตั้งจาก https://git-scm.com/downloads

### 4.3 ติดตั้ง Visual Studio Code

ดาวน์โหลดจาก https://code.visualstudio.com/

## 📥 5. ดาวน์โหลดโปรเจกต์

เลือกทำเพียงวิธีเดียว

### วิธีที่ 1: ดาวน์โหลดด้วย Git

เปิด Terminal ในโฟลเดอร์ที่ต้องการเก็บโปรเจกต์ แล้วรัน

```powershell
git clone https://github.com/Aphisara853/PURE-RECYCLE.git
cd PURE-RECYCLE
```

### วิธีที่ 2: ดาวน์โหลด ZIP

1. เปิด [GitHub Repository](https://github.com/Aphisara853/PURE-RECYCLE)
2. กดปุ่ม **Code**
3. เลือก **Download ZIP**
4. แตกไฟล์ ZIP ไปยังโฟลเดอร์ที่ต้องการ
5. เปิดโฟลเดอร์โปรเจกต์ด้วย Visual Studio Code

ตรวจสอบชื่อไฟล์และโฟลเดอร์จริงก่อนดำเนินการต่อ เนื่องจากโครงสร้างอาจเปลี่ยนไปตามเวอร์ชันของโปรเจกต์

## 📚 6. ติดตั้ง Dependencies

เปิด Terminal ใน VS Code และเข้าไปยังโฟลเดอร์ที่มีไฟล์ `package.json` ของ Backend จากนั้นรัน

```powershell
npm.cmd install
```

รอจนติดตั้งเสร็จ หากพบข้อผิดพลาด ให้ตรวจสอบข้อความใน Terminal ก่อนแก้ไขไฟล์

## 🔐 7. ตั้งค่าไฟล์ .env

สร้างไฟล์ชื่อ `.env` ในตำแหน่งที่ Backend ใช้อ่านค่าตัวแปร โดยตรวจสอบชื่อที่ถูกต้องจาก `Server.js` หรือ `.env.example`

ตัวอย่างรูปแบบตัวแปรที่อาจต้องใช้

```env
RPC_URL=YOUR_BNB_TESTNET_RPC_URL
CONTRACT_ADDRESS=YOUR_TOKEN_CONTRACT_ADDRESS
PRIVATE_KEY=YOUR_TEST_WALLET_PRIVATE_KEY
GEMINI_API_KEY=YOUR_GEMINI_API_KEY
GEMINI_MODEL=YOUR_CONFIGURED_GEMINI_MODEL
```

**หมายเหตุ:** ค่า `YOUR_...` เป็นเพียงตัวอย่าง ต้องแทนด้วยค่าที่ถูกต้องของโปรเจกต์ ห้ามนำข้อความตัวอย่างไปใช้โดยตรง

- ห้ามเผยแพร่ Private Key หรือ API Key
- ห้ามอัปโหลดไฟล์ `.env` ขึ้น GitHub
- ตรวจสอบว่า `.gitignore` ละเว้นไฟล์ `.env`
- ใช้เฉพาะกระเป๋าทดสอบ ห้ามใช้ Private Key ของกระเป๋าที่มีเงินจริง

## 🖥️ 8. เปิด Backend

ตรวจสอบชื่อไฟล์เซิร์ฟเวอร์ในโฟลเดอร์โปรเจกต์ก่อน

หากชื่อไฟล์เป็น `Server.js` ให้รัน

```powershell
node Server.js
```

หากชื่อไฟล์เป็น `server.js` ให้ใช้

```powershell
node server.js
```

ปล่อย Terminal ที่กำลังรันเซิร์ฟเวอร์เปิดไว้ และตรวจสอบข้อความสถานะหรือพอร์ตที่แสดงใน Terminal

## 🌐 9. เปิด Frontend

1. เปิดไฟล์ HTML หลักของ PURE RECYCLE ใน VS Code
2. ค้นหาตัวแปร `RELAYER_URL` หรือ URL ที่ใช้เรียก Backend
3. ตรวจสอบว่า URL ชี้ไปยัง Backend ที่ใช้งานจริง

ตัวอย่าง หาก Backend เปิดที่พอร์ต 3000 ในเครื่อง

```javascript
const RELAYER_URL = "http://localhost:3000";
```

ใช้ตัวอย่างนี้เฉพาะเมื่อชื่อตัวแปรและพอร์ตตรงกับโค้ดจริง หากใช้ Backend ที่ Deploy ไว้ ให้ใช้ URL ของบริการนั้นแทน

4. เปิดไฟล์ HTML ผ่าน **Live Server** หรือเว็บเซิร์ฟเวอร์ที่โปรเจกต์กำหนด
5. ตรวจสอบว่า Frontend สามารถเรียก API จาก Backend ได้

ควรเปิดเว็บผ่าน `localhost` หรือ HTTPS แทนการเปิดไฟล์ด้วย `file://` โดยตรง โดยเฉพาะเมื่อใช้งานกล้องหรือเรียก API

## 🦊 10. ตั้งค่า MetaMask

1. ติดตั้ง MetaMask จาก https://metamask.io/
2. เปิด MetaMask และเลือกเครือข่าย **BNB Chain Testnet**
3. เปิดเว็บ PURE RECYCLE
4. กด **Connect MetaMask**
5. อนุญาตการเชื่อมต่อกระเป๋า
6. หากต้องการดู Token ให้เลือก **Import tokens** และใส่ Contract Address ที่ถูกต้อง

Contract Address ที่เคยใช้ในการทดสอบ

```text
0x2ee52F62DEf3D0Fa3F15Ac4F45b898C93f11A308
```

ตรวจสอบให้แน่ใจว่าที่อยู่สัญญาตรงกับการตั้งค่าใน Backend ก่อนใช้งาน

## 🧪 11. วิธีทดลองใช้งาน

1. เปิด Backend และ Frontend
2. เชื่อมต่อ MetaMask บน BNB Chain Testnet
3. ไปที่หน้า Recycle Scan
4. ทดลองถ่ายภาพหรืออัปโหลดภาพขยะ
5. ตรวจสอบผลการสแกนและ Coin ที่ได้รับ
6. ทดลองแลก Coin เป็น Token
7. ตรวจสอบว่ายอด Coin ลดลงตามจำนวนที่แลก
8. ตรวจสอบ Token ใน MetaMask
9. ตรวจสอบธุรกรรมบน BscScan Testnet
10. ตรวจสอบหน้า History ว่าบันทึกประวัติการสแกนตามที่ออกแบบไว้

### ตัวอย่างการแลก Coin

| รายการ | จำนวน |
|---|---:|
| Coin ก่อนแลก | 200 Coin |
| Coin ที่ใช้แลก | 200 Coin |
| Token ที่ได้รับ | 2 Token |
| Coin หลังแลก | 0 Coin จากยอดตั้งต้น 200 Coin |

ตัวอย่างนี้สมมติว่าไม่มี Coin เพิ่มหรือรายการอื่นระหว่างการทดสอบ และไม่มีเงื่อนไขเพิ่มเติมที่เปลี่ยนยอดคงเหลือ

## 🛠️ 12. การแก้ปัญหาเบื้องต้น

### กด Connect MetaMask แล้วไม่มีอะไรเกิดขึ้น

- ตรวจสอบว่า MetaMask ติดตั้งและปลดล็อกแล้ว
- ตรวจสอบว่าเว็บเปิดผ่าน `localhost` หรือ HTTPS
- รีเฟรชหน้าเว็บและลองเชื่อมต่ออีกครั้ง
- กด F12 แล้วดูแท็บ Console ว่ามีข้อความ Error หรือไม่

### แลก Token ไม่สำเร็จ

- ตรวจสอบว่า Backend ยังทำงานอยู่
- ตรวจสอบ `RELAYER_URL` และ `RPC_URL`
- ตรวจสอบ Contract Address และยอด Token ของกระเป๋าที่ใช้โอน
- ตรวจสอบการตั้งค่า `.env`
- อ่านข้อความ Error จาก Terminal และ Console

### ธุรกรรมสำเร็จแต่ไม่เห็น Token

- ตรวจสอบว่ากระเป๋า MetaMask เป็นที่อยู่ผู้รับจริง
- ตรวจสอบเครือข่าย BNB Chain Testnet
- เพิ่ม Token ด้วย Contract Address ที่ถูกต้อง
- ตรวจสอบรายการ Token Transfers บน BscScan Testnet

### ข้อมูล SQLite หายหลัง Deploy หรือ Restart

บริการโฮสต์บางประเภทอาจใช้พื้นที่เก็บข้อมูลชั่วคราว ควรตรวจสอบว่าบริการรองรับ Persistent Disk หรือไม่ และวางแผนสำรองฐานข้อมูลก่อนใช้งานจริง

## 🔒 13. ความปลอดภัย

- ห้ามเปิดเผย Seed Phrase, Private Key หรือ API Key
- ห้ามบันทึกข้อมูลลับไว้ใน Frontend
- ห้าม Commit ไฟล์ `.env` ขึ้น GitHub
- ใช้กระเป๋าทดสอบสำหรับธุรกรรมบน Testnet
- ตรวจสอบที่อยู่ผู้รับและ Smart Contract ก่อนทำธุรกรรม
- ตรวจสอบความถูกต้องของผลลัพธ์ AI ก่อนนำระบบไปใช้งานจริง

## 🔗 14. ลิงก์ที่เกี่ยวข้อง

- **GitHub Repository:** https://github.com/Aphisara853/PURE-RECYCLE
- **Node.js:** https://nodejs.org/
- **Git:** https://git-scm.com/downloads
- **Visual Studio Code:** https://code.visualstudio.com/
- **MetaMask:** https://metamask.io/
- **BNB Chain Testnet Explorer:** https://testnet.bscscan.com/

## 🎯 วัตถุประสงค์

1. ส่งเสริมการคัดแยกขยะและการรีไซเคิล
2. สร้างแรงจูงใจผ่านระบบสะสม Coin และแลก Token
3. ประยุกต์ใช้ AI ในการช่วยตรวจสอบภาพขยะ
4. ศึกษาการใช้ Blockchain ในระบบรางวัลดิจิทัล
5. ส่งเสริมความเข้าใจเกี่ยวกับธุรกรรมดิจิทัล

## 📄 หมายเหตุ

PURE RECYCLE เป็นโปรเจกต์เพื่อการศึกษาและทดลองพัฒนา ระบบใช้ BNB Chain Testnet ดังนั้น Token ที่ได้รับไม่มีมูลค่าเป็นเงินจริง การติดตั้งและใช้งานอาจต้องปรับค่าตัวแปรให้ตรงกับเวอร์ชันล่าสุดของโปรเจกต์

---

**PURE RECYCLE — Recycle for a Better Future ♻️🌱**
