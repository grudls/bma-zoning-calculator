# BMA Zoning & Building Code Calculator
### เครื่องมือคำนวณกฎหมายอาคารและผังเมืองรวม กรุงเทพมหานคร (FAR, OSR, BCR & Envelope)

ระบบคำนวณสิทธิการก่อสร้างอาคารสูงสุดตามข้อบัญญัติกรุงเทพมหานคร เรื่อง ควบคุมอาคาร พ.ศ. 2544 และผังเมืองรวมกรุงเทพมหานคร พ.ศ. 2556 พร้อมตัวตรวจจับความกว้างถนน (Road Gatekeeper) และแผนภาพจำลองระนาบระยะร่น 2D

---

## ฟีเจอร์หลัก (Key Features)

1. **Dual Input Mode:**
   - กรอกขนาดพื้นที่ดินตามมาตราวัดไทย (ไร่ - งาน - ตารางวา)
   - กรอกมิติรูปทรงแปลงที่ดิน (หน้ากว้างติดถนน x ความลึกแปลงที่ดิน)
2. **Comprehensive Zoning Database (22 โซนผังเมือง กทม. 2556):**
   - โซนที่อยู่อาศัย (ย.1 - ย.10)
   - โซนพาณิชยกรรม (พ.1 - พ.5)
   - โซนอุตสาหกรรม (อ.1 - อ.3)
   - โซนชนบทและเกษตรกรรม (ก.1 - ก.5)
3. **Two-Tier Engine Calculation:**
   - **Tier 1 (ตามทฤษฎี):** คำนวณ FAR, OSR, และ BCR พื้นฐานตามผังเมือง
   - **Tier 2 (ตามระยะร่นและเขตทางถนน):** 
     - ข้อบัญญัติ กทม. 2544 ข้อ 54: ระยะร่นกึ่งกลางถนนสาธารณะตาม 4 ระดับความกว้างเขตทาง
     - ข้อบัญญัติ กทม. 2544 ข้อ 44: ความสูงอาคารสูงสุดริมเขตทาง (อัตราส่วน 1:2)
     - ตัดทอน Footprint จริงตามระยะร่นรอบแปลง (Side & Rear Setbacks)
4. **Road Width Gatekeeper & Instant Warning:**
   - ตรวจสอบเกณฑ์ถนนขั้นต่ำอัตโนมัติ (เช่น อาคารสูง/ขนาดใหญ่พิเศษ ต้องติดถนน $\ge 10$ ม. ตามกฎกระทรวง ฉบับที่ 33)
   - แจ้งเตือนข้อจำกัดพื้นที่อาคารรวม 2,000 ตร.ม. สำหรับคอนโดในซอยแคบ (< 6 ม.)
5. **Interactive 2D Envelope Schematic:**
   - แผนภาพเวกเตอร์จำลองแนวเขตที่ดิน, แนวร่นถนนสาธารณะ, กึ่งกลางถนน, และกรอบ Footprint อาคารจริง
6. **Full Legal Traceability:**
   - กล่องแสดงมาตราและบทบัญญัติกฎหมายอ้างอิงทุกจุด

---

## คำสั่งการใช้งาน (Development & Testing)

```bash
# รันชุดทดสอบ Unit Tests ทั้งหมด (14 tests)
npm test

# รัน Development Server (เปิดดูบนบราวเซอร์ที่ http://127.0.0.1:3000)
npm run dev

# บิลด์สำหรับ Production
npm run build
```

---

## โครงสร้างโปรเจกต์ (Project Structure)

```text
bma-zoning-calculator/
├── src/
│   ├── core/
│   │   ├── types.ts              # Data Models & Schemas
│   │   ├── unit-converter.ts     # การแปลงหน่วย ไร่-งาน-วา <-> ตร.ม.
│   │   ├── theoretical-calc.ts   # การคำนวณ Tier 1 (FAR, OSR, BCR)
│   │   ├── envelope-calc.ts      # การคำนวณ Tier 2 (ระยะร่น ข้อ 54, ความสูง ข้อ 44)
│   │   ├── gatekeeper.ts         # กฎคัดกรองความกว้างถนน
│   │   └── calculator.ts         # Pipeline Orchestrator
│   ├── data/
│   │   ├── bma-zoning-2556.json   # ฐานข้อมูลผังเมืองรวม กทม.
│   │   ├── building-typologies.json # ข้อมูลเกณฑ์ประเภทอาคาร
│   │   └── legal-citations.json    # ข้อกฎหมายอ้างอิง
│   ├── components/
│   │   ├── Header.tsx
│   │   ├── InputForm.tsx
│   │   ├── GatekeeperAlert.tsx
│   │   ├── ResultsDashboard.tsx
│   │   ├── LandVisualizer.tsx
│   │   └── LegalCitationsDrawer.tsx
│   ├── App.tsx
│   └── main.tsx
└── tests/
    └── calculator.test.ts        # Unit Test Suite
```
