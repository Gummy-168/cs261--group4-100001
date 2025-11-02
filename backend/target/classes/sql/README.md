# 📁 SQL Scripts Directory

## 📋 รายการไฟล์ทั้งหมด

### 🆕 ไฟล์ใหม่ (สำคัญ!)

#### 1. `create_notification_queue_table.sql`
**วัตถุประสงค์:** สร้างตาราง notification_queue สำหรับระบบแจ้งเตือนกิจกรรม

**เมื่อไหร่ต้องรัน:**
- เมื่อเจอ Error: `Invalid column name 'eventId'`
- เมื่อไม่สามารถบันทึก/ยกเลิกกิจกรรมที่สนใจได้

**วิธีรัน:**
```sql
-- เปิด SQL Server Management Studio
-- เลือกฐานข้อมูล EventDB
-- รันไฟล์นี้
```

---

### 📦 ไฟล์เดิม (อัปเดตแล้ว)

#### 2. `setup_all_tables.sql` ⚠️ อัปเดตแล้ว!
**วัตถุประสงค์:** สร้างตารางทั้งหมดในครั้งเดียว

**⚠️ คำเตือน:** จะลบตารางเก่าและข้อมูลทั้งหมด!

**ตารางที่สร้าง:**
1. `users` - ข้อมูลผู้ใช้
2. `login_history` - ประวัติการ login
3. `notification_queue` - ระบบแจ้งเตือน (เพิ่มใหม่!)

**เมื่อไหร่ต้องรัน:**
- Setup ฐานข้อมูลครั้งแรก
- Reset ฐานข้อมูลใหม่ทั้งหมด

#### 3. `create_users_table.sql`
**วัตถุประสงค์:** สร้างตาราง users

#### 4. `create_login_history_table.sql`
**วัตถุประสงค์:** สร้างตาราง login_history

#### 5. `update_events_table.sql`
**วัตถุประสงค์:** อัปเดตโครงสร้างตาราง events

#### 6. `fix_favorite_column.sql`
**วัตถุประสงค์:** แก้ไข column ใน favorite table (เปลี่ยน activityId เป็น eventId)

#### 7. `verify_system.sql`
**วัตถุประสงค์:** ตรวจสอบระบบหลัง setup เสร็จ

**ใช้เพื่อ:**
- ตรวจสอบว่าตารางถูกสร้างครบหรือไม่
- ดูข้อมูลในแต่ละตาราง
- เช็คความสัมพันธ์ (Foreign Keys)

---

## 🚀 Quick Start Guide

### สถานการณ์ที่ 1: เจอ Error "Invalid column name 'eventId'"

**แก้ไขแบบรวดเร็ว:**
```sql
-- รันไฟล์นี้เท่านั้น
create_notification_queue_table.sql
```

### สถานการณ์ที่ 2: Setup ฐานข้อมูลครั้งแรก

**ขั้นตอน:**
1. รัน `setup_all_tables.sql` (สร้างตารางหลักทั้งหมด)
2. รัน `update_events_table.sql` (ถ้าต้องการอัปเดต events table)
3. รัน `verify_system.sql` (ตรวจสอบว่าทุกอย่างพร้อม)

### สถานการณ์ที่ 3: ตรวจสอบระบบ

**ขั้นตอน:**
```sql
-- รันไฟล์นี้
verify_system.sql
```

---

## 📊 โครงสร้างตารางที่สร้าง

### 1. users
```
id, username, displayname_th, email, faculty, department, created_at, updated_at
```

### 2. login_history
```
id, user_id, username, ip_address, login_time, status
```

### 3. notification_queue (ใหม่!)
```
id, user_id, event_id, send_at, status, created_at, updated_at
```

### 4. events (ต้องมีอยู่แล้ว)
```
id, title, description, location, startTime, endTime, imageUrl, category, ...
```

### 5. favorites (ต้องมีอยู่แล้ว)
```
id, user_id, event_id
```

---

## 🔗 ความสัมพันธ์ระหว่างตาราง

```
users (1) ──< (*) notification_queue (*) >── (1) events
  │                                             │
  └─────────< favorites >───────────────────────┘
```

**Foreign Keys:**
- `notification_queue.user_id` → `users.id` (CASCADE DELETE)
- `notification_queue.event_id` → `events.id` (CASCADE DELETE)
- `favorites.user_id` → `users.id`
- `favorites.event_id` → `events.id`
- `login_history.user_id` → `users.id` (SET NULL on DELETE)

---

## 📝 วิธีใช้ไฟล์ SQL

### 1. ใน SQL Server Management Studio

```
1. เปิด SSMS
2. Connect ไปที่ Server
3. เลือกฐานข้อมูล EventDB
4. File → Open → File...
5. เลือกไฟล์ .sql ที่ต้องการ
6. กดปุ่ม Execute (F5) หรือ ▶️
7. ดูผลลัพธ์ใน Messages tab
```

### 2. ใน Command Line (sqlcmd)

```bash
sqlcmd -S localhost -d EventDB -i create_notification_queue_table.sql
```

---

## ⚠️ คำเตือนสำคัญ

### ก่อนรัน setup_all_tables.sql
- ⚠️ จะลบข้อมูลทั้งหมดในตาราง users, login_history, notification_queue
- ⚠️ Backup ข้อมูลก่อนถ้าจำเป็น
- ⚠️ ใช้เฉพาะตอน development เท่านั้น

### ก่อนรัน create_notification_queue_table.sql
- ✅ ตาราง users ต้องมีอยู่ก่อน
- ✅ ตาราง events ต้องมีอยู่ก่อน
- ✅ ถ้าไม่มี จะเกิด Foreign Key constraint error

---

## 🔍 คำสั่งที่มีประโยชน์

### ตรวจสอบว่าตารางมีหรือยัง
```sql
SELECT name FROM sys.tables WHERE name = 'notification_queue';
```

### ดูโครงสร้างตาราง
```sql
SELECT 
    COLUMN_NAME,
    DATA_TYPE,
    CHARACTER_MAXIMUM_LENGTH,
    IS_NULLABLE,
    COLUMN_DEFAULT
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_NAME = 'notification_queue'
ORDER BY ORDINAL_POSITION;
```

### ดู Foreign Keys
```sql
SELECT 
    fk.name AS foreign_key_name,
    OBJECT_NAME(fk.parent_object_id) AS table_name,
    COL_NAME(fkc.parent_object_id, fkc.parent_column_id) AS column_name,
    OBJECT_NAME(fk.referenced_object_id) AS referenced_table,
    COL_NAME(fkc.referenced_object_id, fkc.referenced_column_id) AS referenced_column
FROM sys.foreign_keys fk
INNER JOIN sys.foreign_key_columns fkc ON fk.object_id = fkc.constraint_object_id
WHERE OBJECT_NAME(fk.parent_object_id) = 'notification_queue';
```

### นับจำนวนระเบียนในแต่ละตาราง
```sql
SELECT 
    'users' AS table_name, 
    COUNT(*) AS record_count 
FROM users
UNION ALL
SELECT 
    'login_history', 
    COUNT(*) 
FROM login_history
UNION ALL
SELECT 
    'notification_queue', 
    COUNT(*) 
FROM notification_queue;
```

---

## 🎯 Checklist หลังรัน SQL

- [ ] ตารางถูกสร้างเรียบร้อย
- [ ] Foreign Keys ถูกสร้างครบ
- [ ] Indexes ถูกสร้างครบ
- [ ] Triggers (updated_at) ทำงานได้
- [ ] Restart Backend Spring Boot
- [ ] ทดสอบการทำงาน

---

## 📚 เอกสารเพิ่มเติม

### ไฟล์ที่เกี่ยวข้อง
```
backend/
├── QUICK_FIX.md                          ← คู่มือแก้ไขด่วน 5 นาที
├── NOTIFICATION_QUEUE_FIX.md             ← คู่มือแก้ไขแบบละเอียด
├── PROJECT_INSPECTION_REPORT.md          ← รายงานการตรวจสอบโครงการ
└── src/main/resources/sql/
    ├── create_notification_queue_table.sql  ← รันไฟล์นี้!
    ├── setup_all_tables.sql                 ← หรือไฟล์นี้
    ├── verify_system.sql                    ← ตรวจสอบระบบ
    └── README.md                            ← ไฟล์นี้
```

---

## 🐛 Troubleshooting

### Error: Cannot create foreign key constraint
```
สาเหตุ: ไม่มีตาราง users หรือ events
แก้ไข: สร้างตารางเหล่านี้ก่อน หรือรัน setup_all_tables.sql
```

### Error: There is already an object named 'notification_queue'
```
สาเหตุ: ตารางมีอยู่แล้ว
แก้ไข: 
1. ลบตารางเดิม: DROP TABLE notification_queue;
2. รันสคริปต์ใหม่อีกครั้ง
```

### Error: The DELETE statement conflicted with the REFERENCE constraint
```
สาเหตุ: พยายามลบตาราง users/events แต่มีข้อมูลใน notification_queue
แก้ไข:
1. ลบข้อมูลใน notification_queue ก่อน
2. หรือ DROP ตาราง notification_queue ก่อน
```

---

## 💡 Tips

### ทำให้ส่ง notification ทันที (สำหรับทดสอบ)
```sql
-- แก้ไข send_at เป็นเวลาปัจจุบัน
UPDATE notification_queue 
SET send_at = GETDATE() 
WHERE status = 'PENDING';
```

### ดู notifications ที่ครบกำหนดส่งแล้ว
```sql
SELECT 
    nq.*,
    u.username,
    e.title
FROM notification_queue nq
JOIN users u ON nq.user_id = u.id
JOIN events e ON nq.event_id = e.id
WHERE nq.send_at <= GETDATE() 
  AND nq.status = 'PENDING'
ORDER BY nq.send_at;
```

### จำลองการส่ง notification
```sql
-- อัปเดตสถานะเป็น SENT
UPDATE notification_queue 
SET status = 'SENT' 
WHERE send_at <= GETDATE() 
  AND status = 'PENDING';
```

---

## 🎉 สรุป

| ไฟล์ | วัตถุประสงค์ | เมื่อไหร่ใช้ |
|------|-------------|------------|
| `create_notification_queue_table.sql` | สร้างตาราง notification_queue | เจอ error eventId |
| `setup_all_tables.sql` | สร้างตารางทั้งหมด | Setup ครั้งแรก / Reset |
| `verify_system.sql` | ตรวจสอบระบบ | หลัง setup เสร็จ |
| `update_events_table.sql` | อัปเดต events table | ต้องการเพิ่ม columns |
| `fix_favorite_column.sql` | แก้ไข favorites table | เปลี่ยน activityId → eventId |

**แนะนำ:** รัน `create_notification_queue_table.sql` ก่อนเสมอ หากเจอปัญหา

---

## 📞 ต้องการความช่วยเหลือ?

1. อ่าน `QUICK_FIX.md` สำหรับวิธีแก้ไขด่วน
2. อ่าน `NOTIFICATION_QUEUE_FIX.md` สำหรับรายละเอียดเพิ่มเติม
3. อ่าน `PROJECT_INSPECTION_REPORT.md` สำหรับภาพรวมโครงการ

---

**อัปเดตล่าสุด:** October 20, 2025
**จัดทำโดย:** Claude AI Assistant
