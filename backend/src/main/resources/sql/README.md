# 📁 SQL Scripts - คำอธิบายการใช้งาน

## 📋 รายการไฟล์ SQL

### 1️⃣ `setup_all_tables.sql` ⭐ **แนะนำ**
**วัตถุประสงค์:** สร้างตารางทั้งหมดพร้อมกัน (users + login_history)

**เมื่อไหร่ควรใช้:**
- ✅ ครั้งแรกที่ setup โปรเจกต์
- ✅ ต้องการสร้างตารางใหม่ทั้งหมด
- ✅ ต้องการ reset ระบบทั้งหมด

**วิธีใช้:**
```sql
-- เปิด SQL Server Management Studio
-- เลือก Database: EventDB
-- เปิดไฟล์นี้และกด Execute (F5)
```

**คำเตือน:** ⚠️ จะลบตารางเก่าและข้อมูลทั้งหมด!

---

### 2️⃣ `create_users_table.sql`
**วัตถุประสงค์:** สร้างตาราง users เท่านั้น

**เมื่อไหร่ควรใช้:**
- ✅ ต้องการสร้างเฉพาะตาราง users
- ✅ ต้องการ reset ตาราง users เท่านั้น

**โครงสร้างตาราง:**
- `id` - Primary Key (Auto Increment)
- `username` - รหัสนักศึกษา/บุคลากร (Unique)
- `displayname_th` - ชื่อภาษาไทย
- `email` - อีเมล์
- `faculty` - คณะ
- `department` - สาขา/หน่วยงาน
- `created_at` - วันที่สร้าง
- `updated_at` - วันที่อัพเดทล่าสุด

---

### 3️⃣ `create_login_history_table.sql`
**วัตถุประสงค์:** สร้างตาราง login_history เท่านั้น

**เมื่อไหร่ควรใช้:**
- ✅ ต้องการสร้างเฉพาะตาราง login_history
- ✅ ต้องการ reset ตาราง login_history เท่านั้น

**โครงสร้างตาราง:**
- `id` - Primary Key (Auto Increment)
- `user_id` - Foreign Key → users(id) (NULL ได้)
- `username` - รหัสนักศึกษา/บุคลากร
- `ip_address` - IP Address ของผู้ Login
- `login_time` - เวลาที่ Login
- `status` - สถานะ (SUCCESS/FAILED)

**หมายเหตุ:** ต้องสร้างตาราง `users` ก่อน!

---

### 4️⃣ `verify_system.sql`
**วัตถุประสงค์:** ตรวจสอบว่าระบบพร้อมใช้งานหรือไม่

**เมื่อไหร่ควรใช้:**
- ✅ หลังจากสร้างตารางเสร็จ
- ✅ เมื่อมีปัญหาการ Login
- ✅ ต้องการดูข้อมูลและสถิติ

**สิ่งที่ตรวจสอบ:**
1. ✅ ตารางมีครบหรือไม่
2. ✅ โครงสร้างตารางถูกต้องหรือไม่
3. ✅ Foreign Key ถูกต้องหรือไม่
4. ✅ จำนวนข้อมูลในแต่ละตาราง
5. ✅ ข้อมูล Users และ Login History ล่าสุด
6. ✅ สถิติการ Login
7. ✅ ตรวจสอบข้อมูลผิดปกติ

**วิธีใช้:**
```sql
-- รันไฟล์นี้ทุกครั้งหลังจาก Login
-- เพื่อดูว่าข้อมูลบันทึกถูกต้องหรือไม่
```

---

## 🚀 ขั้นตอนการ Setup ครั้งแรก

### วิธีที่ 1: ใช้ไฟล์เดียว (แนะนำ) ⭐
```
1. เปิด SQL Server Management Studio
2. เลือก Database: EventDB
3. เปิดไฟล์: setup_all_tables.sql
4. กด Execute (F5)
5. รัน verify_system.sql เพื่อตรวจสอบ
```

### วิธีที่ 2: รันทีละไฟล์
```
1. รัน create_users_table.sql ก่อน
2. รัน create_login_history_table.sql ทีหลัง
3. รัน verify_system.sql เพื่อตรวจสอบ
```

---

## 🔍 วิธีตรวจสอบว่าสร้างตารางสำเร็จ

### ตรวจสอบแบบง่าย:
```sql
-- ดูว่ามีตารางหรือยัง
SELECT name FROM sys.tables 
WHERE name IN ('users', 'login_history');

-- ต้องเห็น 2 ตาราง
```

### ตรวจสอบแบบละเอียด:
```sql
-- รันไฟล์ verify_system.sql
-- จะแสดงข้อมูลครบทุกอย่าง
```

---

## 📊 Query ที่มีประโยชน์

### ดูข้อมูล Users ทั้งหมด:
```sql
SELECT * FROM dbo.users ORDER BY created_at DESC;
```

### ดูประวัติ Login ล่าสุด:
```sql
SELECT TOP 10
    lh.*,
    u.displayname_th
FROM dbo.login_history lh
LEFT JOIN dbo.users u ON lh.user_id = u.id
ORDER BY lh.login_time DESC;
```

### นับจำนวนครั้งที่ Login ของแต่ละคน:
```sql
SELECT 
    username,
    COUNT(*) as login_count
FROM dbo.login_history
GROUP BY username
ORDER BY login_count DESC;
```

### หา User ที่ Login ล่าสุด:
```sql
SELECT TOP 1
    u.username,
    u.displayname_th,
    lh.login_time
FROM dbo.login_history lh
JOIN dbo.users u ON lh.user_id = u.id
ORDER BY lh.login_time DESC;
```

### ลบข้อมูล Login History เก่า (เก็บแค่ 30 วันล่าสุด):
```sql
DELETE FROM dbo.login_history
WHERE login_time < DATEADD(DAY, -30, GETDATE());
```

---

## ⚠️ คำเตือนสำคัญ

### 🔴 ระวัง DROP TABLE!
ไฟล์ SQL ทุกไฟล์ (ยกเว้น verify_system.sql) จะ **ลบตารางเก่าทั้งหมด**

```sql
-- คำสั่งนี้จะลบข้อมูลทั้งหมด!
DROP TABLE dbo.login_history;
DROP TABLE dbo.users;
```

### ✅ ถ้าต้องการเก็บข้อมูลเดิม:
**อย่ารัน setup_all_tables.sql**  
ให้ใช้ ALTER TABLE แทน หรือ backup ข้อมูลก่อน

### 💾 Backup ข้อมูลก่อน (แนะนำ):
```sql
-- Backup ตาราง users
SELECT * INTO users_backup FROM dbo.users;

-- Backup ตาราง login_history
SELECT * INTO login_history_backup FROM dbo.login_history;
```

---

## 🆘 แก้ปัญหาเบื้องต้น

### ❌ ถ้า Error: "Database 'EventDB' does not exist"
```sql
-- สร้าง Database ก่อน
CREATE DATABASE EventDB;
GO
USE EventDB;
GO
```

### ❌ ถ้า Error: "Cannot drop the table because it is being referenced"
```sql
-- ต้องลบ login_history ก่อน (มี Foreign Key)
DROP TABLE dbo.login_history;
DROP TABLE dbo.users;
```

### ❌ ถ้า Error: "Column name 'username' is invalid"
```sql
-- ตรวจสอบว่าสร้างตารางแล้วหรือยัง
SELECT * FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_NAME = 'users';
```

---

## 📝 Checklist หลังรัน SQL

- [ ] ตาราง `users` ถูกสร้างแล้ว
- [ ] ตาราง `login_history` ถูกสร้างแล้ว
- [ ] Foreign Key ถูกสร้างแล้ว
- [ ] Index ถูกสร้างแล้ว
- [ ] Trigger (ถ้ามี) ทำงานถูกต้อง
- [ ] รัน `verify_system.sql` แล้วไม่มี error

---

## 📚 เอกสารเพิ่มเติม

- **COMPLETE_FIX_GUIDE.md** - คู่มือแก้ปัญหาแบบสมบูรณ์
- **Backend README** - วิธีการ setup และ run backend

---

**Created:** 2025-01-09  
**Last Updated:** 2025-01-09  
**Author:** CS261 Group 4
