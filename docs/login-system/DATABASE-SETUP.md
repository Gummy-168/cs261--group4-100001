# 🗄️ Database Setup - การสร้าง SQL Server และตาราง

## 🎯 ภาพรวม

เอกสารนี้อธิบายวิธีการตั้งค่า SQL Server ใน Docker และสร้างตาราง `users` สำหรับเก็บข้อมูล Login

---

## 📦 ขั้นตอนที่ 1: ติดตั้ง SQL Server (Docker)

### เริ่มต้น SQL Server Container

```bash
docker run -e "ACCEPT_EULA=Y" \
  -e "MSSQL_SA_PASSWORD=YourStrong!Passw0rd" \
  -p 1433:1433 \
  --name sqlserver \
  -d mcr.microsoft.com/mssql/server:2022-latest
```

**คำอธิบาย:**
- `ACCEPT_EULA=Y` - ยอมรับเงื่อนไขการใช้งาน
- `MSSQL_SA_PASSWORD` - รหัสผ่าน sa (admin)
- `-p 1433:1433` - เปิด Port 1433
- `--name sqlserver` - ตั้งชื่อ Container
- `-d` - รันในโหมด Background

### ตรวจสอบว่า Container ทำงาน

```bash
docker ps

# ควรเห็น:
# CONTAINER ID   IMAGE                                        STATUS
# xxxxx          mcr.microsoft.com/mssql/server:2022-latest  Up X minutes
```

---

## 🔧 ขั้นตอนที่ 2: สร้าง Database

### เชื่อมต่อเข้า SQL Server

```bash
docker exec -it sqlserver /opt/mssql-tools/bin/sqlcmd \
  -S localhost -U sa -P "YourStrong!Passw0rd"
```

### สร้าง Database

```sql
1> CREATE DATABASE EventDB;
2> GO

1> USE EventDB;
2> GO

1> SELECT name FROM sys.databases WHERE name = 'EventDB';
2> GO
-- ควรเห็น: EventDB

1> QUIT
```

---

## 📝 ขั้นตอนที่ 3: สร้างตาราง users

### SQL Script สำหรับสร้างตาราง

```sql
USE EventDB;
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

-- สร้าง Index
CREATE INDEX idx_users_username ON dbo.users(username);
CREATE INDEX idx_users_email ON dbo.users(email);
GO

-- สร้าง Trigger อัพเดท updated_at อัตโนมัติ
CREATE TRIGGER trg_users_updated_at
ON dbo.users
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE dbo.users
    SET updated_at = GETDATE()
    FROM dbo.users u
    INNER JOIN inserted i ON u.id = i.id;
END;
GO

PRINT 'Table users created successfully!';
```

**บันทึกไฟล์นี้เป็น:** `create_users_table.sql`

### รัน SQL Script

**วิธีที่ 1: Copy ไฟล์เข้า Container**
```bash
# Copy file
docker cp create_users_table.sql sqlserver:/tmp/

# รัน SQL
docker exec -it sqlserver /opt/mssql-tools/bin/sqlcmd \
  -S localhost -U sa -P "YourStrong!Passw0rd" \
  -i /tmp/create_users_table.sql
```

**วิธีที่ 2: Paste โค้ดโดยตรง**
```bash
docker exec -it sqlserver /opt/mssql-tools/bin/sqlcmd \
  -S localhost -U sa -P "YourStrong!Passw0rd"

# จากนั้น Paste SQL ข้างบนทีละบรรทัด
```

---

## ✅ ขั้นตอนที่ 4: ตรวจสอบตาราง

```sql
1> USE EventDB;
2> GO

1> SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'users';
2> GO
-- ควรเห็น: users

1> EXEC sp_columns users;
2> GO
-- จะแสดงรายละเอียด Columns ทั้งหมด
```

---

## 🔌 ขั้นตอนที่ 5: ตั้งค่า Spring Boot

### แก้ไข application.properties

```properties
# Database Configuration
spring.datasource.url=jdbc:sqlserver://localhost:1433;databaseName=EventDB;encrypt=false;trustServerCertificate=true
spring.datasource.username=sa
spring.datasource.password=YourStrong!Passw0rd
spring.datasource.driver-class-name=com.microsoft.sqlserver.jdbc.SQLServerDriver

# JPA Settings
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.SQLServerDialect
```

---

## 🧪 ทดสอบการเชื่อมต่อ

### Test 1: ตรวจสอบจาก SQL Server

```sql
1> USE EventDB;
2> GO

1> SELECT * FROM users;
2> GO
-- ตอนนี้ยังไม่มีข้อมูล (ว่างเปล่า)
```

### Test 2: ทดสอบจาก Spring Boot

```bash
# Run Application
mvn spring-boot:run

# ดู Log ควรเห็น:
# Hibernate: create table users (...)
# HikkaриCP: Connection acquired successfully
```

### Test 3: Insert ข้อมูลทดสอบ

```sql
1> USE EventDB;
2> GO

1> INSERT INTO users (username, displayname_th, email, faculty, department)
2> VALUES ('6414421234', N'นายทดสอบ ระบบ', 'test@dome.tu.ac.th', N'วิทยาศาสตร์', N'คอมพิวเตอร์');
3> GO

1> SELECT * FROM users;
2> GO

-- ผลลัพธ์:
-- id | username   | displayname_th  | email              | created_at          | updated_at
-- 1  | 6414421234 | นายทดสอบ ระบบ  | test@dome.tu.ac.th | 2025-10-09 10:00:00 | 2025-10-09 10:00:00
```

---

## 🛠️ คำสั่ง Docker ที่มีประโยชน์

```bash
# ดู Container ที่กำลังรัน
docker ps

# หยุด Container
docker stop sqlserver

# เริ่ม Container อีกครั้ง
docker start sqlserver

# ดู Logs
docker logs sqlserver

# ลบ Container (ข้อมูลจะหาย!)
docker rm -f sqlserver

# Restart Container
docker restart sqlserver
```

---

## 📊 โครงสร้างตาราง users

| Column | Type | Constraint | Description |
|--------|------|------------|-------------|
| id | BIGINT | PK, AUTO | รหัส User |
| username | NVARCHAR(50) | UNIQUE, NOT NULL | รหัสนักศึกษา |
| displayname_th | NVARCHAR(255) | NOT NULL | ชื่อ-สกุล ไทย |
| email | NVARCHAR(255) | NULL | อีเมล์ |
| faculty | NVARCHAR(255) | NULL | คณะ |
| department | NVARCHAR(255) | NULL | สาขา |
| created_at | DATETIME2 | DEFAULT NOW | วันที่สร้าง |
| updated_at | DATETIME2 | DEFAULT NOW | วันที่อัพเดท |

**หมายเหตุ:** ตารางนี้ไม่เก็บ password เพราะใช้ TU API ตรวจสอบ

---

## 🎯 สรุป

1. ✅ ติดตั้ง SQL Server ใน Docker (Port 1433)
2. ✅ สร้าง Database `EventDB`
3. ✅ สร้างตาราง `users` พร้อม Index และ Trigger
4. ✅ ตั้งค่า Spring Boot ให้เชื่อมต่อ Database
5. ✅ ทดสอบการทำงาน

**ตอนนี้ระบบพร้อมใช้งานแล้ว!**
