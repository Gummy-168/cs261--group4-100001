# 🔧 คู่มือแก้ไข Login Error ฉบับสมบูรณ์

## 🔴 ปัญหาที่พบ

### Error 1: NULL user_id
```
Login failed, could not execute statement [Cannot insert the value NULL 
into column 'user_id', table 'EventDB.dbo.login_history']
```

### Error 2: Invalid column name 'username'
```
Login failed: JDBC exception executing SQL [select u1_0.id, u1_0.created_at, 
u1_0.department, u1_0.displayname_th from dbo.users u1_0 where u1_0.username=?] 
[Invalid column name 'username'.]
```

---

## ✅ สาเหตุและวิธีแก้

### สาเหตุ:
1. ตาราง `users` และ `login_history` ยังไม่ได้สร้าง หรือโครงสร้างไม่ถูกต้อง
2. โค้ด `UserService.java` เดิมส่ง `user_id = null` ไป

### วิธีแก้:
1. ✅ สร้างตารางใหม่ที่ถูกต้อง
2. ✅ แก้โค้ดให้บันทึก User และใช้ user_id จริง

---

## 🚀 ขั้นตอนการแก้ไข (ทำตามลำดับ)

### **ขั้นตอนที่ 1: รัน SQL สร้างตารางทั้งหมด**

#### วิธีที่ 1: ใช้ไฟล์ SQL รวม (แนะนำ) ⭐
เปิด **SQL Server Management Studio** แล้วรันไฟล์นี้:
```
backend/src/main/resources/sql/setup_all_tables.sql
```

หรือคัดลอก SQL ด้านล่างไปรันเลย:

```sql
USE EventDB;
GO

-- ลบตารางเก่า
IF OBJECT_ID('dbo.login_history', 'U') IS NOT NULL
    DROP TABLE dbo.login_history;
GO

IF OBJECT_ID('dbo.users', 'U') IS NOT NULL
    DROP TABLE dbo.users;
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

PRINT 'All tables created successfully!';
```

#### วิธีที่ 2: รันทีละไฟล์
1. รัน `create_users_table.sql` ก่อน
2. รัน `create_login_history_table.sql` ทีหลัง

---

### **ขั้นตอนที่ 2: ตรวจสอบว่าสร้างตารางสำเร็จ**

รัน SQL นี้เพื่อตรวจสอบ:
```sql
-- ดูตาราง users
SELECT * FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_NAME = 'users';

-- ดูตาราง login_history
SELECT * FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_NAME = 'login_history';
```

**ต้องเห็น column เหล่านี้:**

**users:**
- ✅ id
- ✅ username
- ✅ displayname_th
- ✅ email
- ✅ faculty
- ✅ department
- ✅ created_at
- ✅ updated_at

**login_history:**
- ✅ id
- ✅ user_id (NULL ได้)
- ✅ username
- ✅ ip_address
- ✅ login_time
- ✅ status

---

### **ขั้นตอนที่ 3: Restart Backend**

```bash
# หยุด Backend (กด Ctrl + C)

# รันใหม่
mvn spring-boot:run

# หรือถ้าใช้ IDE
# กด Run/Debug ใหม่
```

---

### **ขั้นตอนที่ 4: ทดสอบ Login**

1. เปิด Browser ไปที่: `http://localhost:5173/login`
2. กรอก Username: `6709616848`
3. กรอก Password: (รหัสผ่านของคุณ)
4. กด Sign In

**ผลลัพธ์ที่ควรได้:**
- ✅ Login สำเร็จ
- ✅ ไม่มี Error
- ✅ มีข้อมูลบันทึกในตาราง `users` และ `login_history`

---

## 📋 การเปลี่ยนแปลงในโค้ด

### ไฟล์ที่แก้ไข:

#### 1. **UserService.java** (แก้แล้ว ✅)
```java
// เดิม: ส่ง userId = null ❌
history.setUserId(null);

// ใหม่: บันทึก User และใช้ user_id จริง ✅
User user = userRepository.findByUsername(...)
    .orElse(new User(...));
user = userRepository.save(user);
history.setUserId(user.getId()); // ได้ user_id จริง
```

#### 2. **SQL Files** (ไฟล์ใหม่ ✅)
- ✅ `create_login_history_table.sql` - สร้างตาราง login_history
- ✅ `setup_all_tables.sql` - สร้างทั้ง 2 ตารางพร้อมกัน

---

## 🔍 การตรวจสอบข้อมูลหลัง Login

### ตรวจสอบข้อมูล Users:
```sql
SELECT * FROM dbo.users ORDER BY created_at DESC;
```

### ตรวจสอบประวัติ Login:
```sql
SELECT 
    lh.id,
    lh.user_id,
    lh.username,
    u.displayname_th,
    lh.ip_address,
    lh.login_time,
    lh.status
FROM dbo.login_history lh
LEFT JOIN dbo.users u ON lh.user_id = u.id
ORDER BY lh.login_time DESC;
```

### นับจำนวนครั้งที่ Login:
```sql
SELECT 
    username,
    COUNT(*) as login_count
FROM dbo.login_history
GROUP BY username;
```

---

## ❓ แก้ปัญหาเพิ่มเติม

### ถ้ายังมี Error:

#### 1. ตรวจสอบว่ารัน SQL แล้ว
```sql
SELECT name FROM sys.tables WHERE name IN ('users', 'login_history');
```
ต้องเห็น 2 ตาราง

#### 2. ตรวจสอบ application.properties
```properties
spring.datasource.url=jdbc:sqlserver://localhost:1433;databaseName=EventDB;encrypt=true;trustServerCertificate=true
spring.datasource.username=your_username
spring.datasource.password=your_password
spring.jpa.hibernate.ddl-auto=none
```

#### 3. ตรวจสอบ Backend ทำงาน
```bash
# ดู logs เมื่อ start
# ต้องไม่มี error เกี่ยวกับ database connection
```

#### 4. ทดสอบเรียก API โดยตรง
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"6709616848","password":"your_password"}'
```

---

## 📝 สรุป

### ✅ สิ่งที่ทำไปแล้ว:
1. แก้ไข `UserService.java` - บันทึก User และใช้ user_id จริง
2. สร้างไฟล์ SQL ทั้งหมดที่จำเป็น
3. สร้างคู่มือแก้ปัญหาฉบับสมบูรณ์

### 🎯 สิ่งที่คุณต้องทำ:
1. ✅ รัน SQL สร้างตารางทั้งหมด (ขั้นตอนที่ 1)
2. ✅ Restart Backend (ขั้นตอนที่ 3)
3. ✅ ทดสอบ Login (ขั้นตอนที่ 4)

---

## 🎉 ผลลัพธ์สุดท้าย

หลังจากทำตามขั้นตอนทั้งหมด:
- ✅ Login ได้สำเร็จ
- ✅ บันทึกข้อมูล User อัตโนมัติจาก TU API
- ✅ บันทึก Login History พร้อม user_id ที่ถูกต้อง
- ✅ ไม่มี Error NULL อีกต่อไป
- ✅ ข้อมูลครบถ้วน พร้อมใช้งาน

---

**💡 หมายเหตุ:** 
- ถ้ายังมีปัญหา ตรวจสอบ Backend logs ดูว่ามี error อะไร
- ถ้าต้องการความช่วยเหลือเพิ่มเติม ส่ง error message มาได้เลย
- อย่าลืม restart backend หลังแก้โค้ดทุกครั้ง!

---

**Created:** 2025-01-09  
**Last Updated:** 2025-01-09  
**Version:** 1.0 - Complete Fix
