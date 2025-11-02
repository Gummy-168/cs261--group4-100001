# ⚡ Quick Start Guide - แก้ปัญหา Login

## 🎯 ทำตามนี้เลย 3 ขั้นตอน!

### ✅ ขั้นที่ 1: รัน SQL (2 นาที)

1. เปิด **SQL Server Management Studio**
2. เลือก Database: **EventDB**
3. Copy SQL ด้านล่างนี้ไปรันเลย:

```sql
USE EventDB;
GO

-- ลบตารางเก่า
IF OBJECT_ID('dbo.login_history', 'U') IS NOT NULL DROP TABLE dbo.login_history;
IF OBJECT_ID('dbo.users', 'U') IS NOT NULL DROP TABLE dbo.users;
GO

-- สร้างตาราง users
CREATE TABLE dbo.users (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    username NVARCHAR(50) NOT NULL UNIQUE,
    displayname_th NVARCHAR(255) NOT NULL,
    email NVARCHAR(255),
    faculty NVARCHAR(255),
    department NVARCHAR(255),
    created_at DATETIME2 DEFAULT GETDATE(),
    updated_at DATETIME2 DEFAULT GETDATE()
);
GO

CREATE INDEX idx_users_username ON dbo.users(username);
CREATE INDEX idx_users_email ON dbo.users(email);
GO

-- สร้างตาราง login_history
CREATE TABLE dbo.login_history (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    user_id BIGINT NULL,
    username NVARCHAR(50) NOT NULL,
    ip_address NVARCHAR(50),
    login_time DATETIME2 DEFAULT GETDATE(),
    status NVARCHAR(20) DEFAULT 'SUCCESS',
    CONSTRAINT FK_login_history_user FOREIGN KEY (user_id) 
        REFERENCES dbo.users(id) ON DELETE SET NULL
);
GO

CREATE INDEX idx_login_history_user_id ON dbo.login_history(user_id);
CREATE INDEX idx_login_history_username ON dbo.login_history(username);
GO

PRINT '✅ All tables created successfully!';
```

4. เห็นข้อความ "✅ All tables created successfully!" = สำเร็จ!

---

### ✅ ขั้นที่ 2: Restart Backend (1 นาที)

```bash
# หยุด Backend (กด Ctrl + C)

# รันใหม่
mvn spring-boot:run

# หรือถ้าใช้ IDE กด Run ใหม่
```

รอจนเห็น:
```
Tomcat started on port(s): 8080 (http)
```

---

### ✅ ขั้นที่ 3: ทดสอบ Login (30 วินาที)

1. เปิด Browser: `http://localhost:5173/login`
2. กรอก Username: `6709616848`
3. กรอก Password: (รหัสผ่านของคุณ)
4. กด **Sign In**

**ควรได้:**
- ✅ Login สำเร็จ ไม่มี Error
- ✅ ถ้ามี Error ให้ดูข้อความ แล้วไปที่ "แก้ปัญหา" ด้านล่าง

---

## 🔍 ตรวจสอบว่าสำเร็จหรือยัง

รัน SQL นี้:
```sql
-- ดูว่ามีตารางไหม
SELECT name FROM sys.tables WHERE name IN ('users', 'login_history');

-- ดูข้อมูล Users (หลัง login ควรมีข้อมูล)
SELECT * FROM dbo.users;

-- ดูประวัติ Login (หลัง login ควรมีข้อมูล)
SELECT * FROM dbo.login_history ORDER BY login_time DESC;
```

---

## ❌ แก้ปัญหาเร็ว

### ❌ Error: "Cannot insert NULL into user_id"
➜ **ยังไม่ได้รัน SQL!** กลับไปทำขั้นที่ 1 ใหม่

### ❌ Error: "Invalid column name 'username'"
➜ **ตารางไม่ถูกต้อง!** รัน SQL ขั้นที่ 1 ใหม่

### ❌ Error: "Connection refused" หรือ "Cannot connect to backend"
➜ **Backend ยังไม่ทำงาน!** 
```bash
# ตรวจสอบว่า Backend รันอยู่ไหม
mvn spring-boot:run
```

### ❌ ยังไม่ Login ได้
1. เปิด Chrome DevTools (F12)
2. ดูที่ Console และ Network tab
3. ดู error message แล้วบอกผม

---

## 📱 ติดต่อขอความช่วยเหลือ

ถ้าทำตามแล้วยังไม่ได้ ส่งข้อมูลเหล่านี้มา:
1. Screenshot ของ Error
2. Backend logs (จาก Terminal)
3. ผลลัพธ์จากการรัน `verify_system.sql`

---

## 📚 เอกสารเพิ่มเติม

- **COMPLETE_FIX_GUIDE.md** - คู่มือแบบละเอียด
- **sql/README.md** - คำอธิบาย SQL Scripts
- **verify_system.sql** - ตรวจสอบระบบ

---

**💡 เคล็ดลับ:**
- Restart Backend หลังแก้โค้ดทุกครั้ง
- ใช้ `verify_system.sql` เพื่อตรวจสอบข้อมูล
- เก็บ SQL scripts ไว้ใช้ในอนาคต

---

✅ **เสร็จแล้ว! ระบบ Login พร้อมใช้งาน** 🎉
