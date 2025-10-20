# 🚀 Setup Database (รองรับภาษาไทย)

## 1. เตรียม SQL Server

ติดตั้ง **SQL Server** และ **SQL Server Management Studio (SSMS)**

## 2. สร้าง Database

เปิด SSMS แล้วรัน:

```sql
CREATE DATABASE EventDB;
```

---

## 3. เลือกวิธีติดตั้ง

### ✅ **ถ้าเป็นการติดตั้งครั้งแรก** (แนะนำ)

รันไฟล์นี้ใน SSMS:
```
src/main/resources/sql/setup_all_tables.sql
```

### ⚠️ **ถ้ามีตาราง Events เก่าอยู่แล้ว**

#### **ตรวจสอบก่อน:**
```
src/main/resources/sql/check_thai_support.sql
```

#### **ถ้าเจอ ❌ ไม่รองรับภาษาไทย:**

**ทางเลือก A:** แก้ไขตารางเดิม (ไม่ลบข้อมูล)
```
src/main/resources/sql/fix_events_thai_support.sql
```

**ทางเลือก B:** ลบแล้วสร้างใหม่ (ข้อมูลจะหายทั้งหมด)
```
src/main/resources/sql/drop_events_table.sql
src/main/resources/sql/setup_all_tables.sql
```

---

## 4. (Optional) ใส่ข้อมูลตัวอย่าง

รันไฟล์:
```
src/main/resources/data/sample-events-thai.sql
```

---

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

## ✅ ทดสอบ

API: `http://localhost:8080`

ลองสร้าง Event ภาษาไทย:
```json
{
  "title": "งานวันเด็ก",
  "description": "กิจกรรมสนุกสนาน",
  "location": "หอประชุมใหญ่"
}
```
