# 📚 Event Management System - Backend

Spring Boot Backend รองรับภาษาไทย 🇹🇭

---

## 🚀 เริ่มต้นใช้งาน

### 1. Clone โปรเจค
```bash
git clone <repo-url>
cd backend
```

### 2. ติดตั้ง Database
อ่านคู่มือ: **[DATABASE_SETUP.md](DATABASE_SETUP.md)**

### 3. ตั้งค่า
แก้ไข `application.properties`:
```properties
spring.datasource.username=sa
spring.datasource.password=YourPassword
```

### 4. รัน
```bash
mvn spring-boot:run
```

---

## ⚠️ แก้ไขปัญหา

### ภาษาไทยไม่ขึ้น?
อ่าน: **[FIX_THAI_LANGUAGE.md](FIX_THAI_LANGUAGE.md)**

---

## 📁 ไฟล์ SQL สำคัญ

| ไฟล์ | คำอธิบาย |
|------|----------|
| `setup_all_tables.sql` | สร้างตารางทั้งหมด |
| `check_thai_support.sql` | ตรวจสอบรองรับภาษาไทย |
| `fix_events_thai_support.sql` | แก้ไขตารางเดิม |
| `sample-events-thai.sql` | ข้อมูลตัวอย่าง |

---

## 🔗 API

- **Swagger UI:** http://localhost:8080/swagger-ui.html
- **API Docs:** http://localhost:8080/v3/api-docs

---

## 📝 Stack

- Java 17
- Spring Boot 3.2.2
- SQL Server
- JWT Authentication
