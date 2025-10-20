# 🚀 Setup Database (รองรับภาษาไทย)

## 1. เตรียม SQL Server

ติดตั้ง **SQL Server** และ **SQL Server Management Studio (SSMS)**

## 2. สร้าง Database

เปิด SSMS แล้วรัน:

```sql
CREATE DATABASE EventDB;
```

## 3. สร้างตารางทั้งหมด

รันไฟล์นี้ใน SSMS:

```
backend/src/main/resources/sql/setup_all_tables.sql
```

**หมายเหตุ:** ไฟล์นี้จะสร้างตารางที่**รองรับภาษาไทย**โดยอัตโนมัติ

## 4. (Optional) ใส่ข้อมูลตัวอย่าง

รันไฟล์:

```
backend/src/main/resources/data/sample-events-thai.sql
```

## 5. ตั้งค่า Backend

แก้ไขไฟล์ `application.properties`:

```properties
spring.datasource.url=jdbc:sqlserver://localhost:1433;databaseName=EventDB
spring.datasource.username=sa
spring.datasource.password=YourPassword
```

## 6. รัน Backend

```bash
mvn spring-boot:run
```

---

## ✅ เสร็จแล้ว!

ตอนนี้ระบบรองรับ**ภาษาไทย**แล้ว! 

ทดสอบที่: `http://localhost:8080`
