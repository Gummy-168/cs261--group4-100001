# 🔐 ระบบ Login - คู่มือการทำงาน

## 📌 ภาพรวม

ระบบ Login ที่ใช้ **TU API** ตรวจสอบ username/password และบันทึกข้อมูล User ลง **SQL Server (Docker)**

---

## 🔄 การเชื่อมต่อของแต่ละส่วน

```
User กรอก Login
      ↓
[1] Frontend (React) - Port 5173
      ↓ HTTP POST
[2] AuthController.java - รับ Request
      ↓
[3] TuAuthService.java - เรียก TU API
      ↓
[4] TU API - ตรวจสอบ username/password
      ↓ ส่งข้อมูล User กลับมา
[5] UserService.java - บันทึกลง Database
      ↓
[6] SQL Server (Docker) - Port 1433
      ↓
[7] ส่ง Response กลับ Frontend
```

---

## 💻 รายละเอียดแต่ละขั้นตอน

### [1] Frontend ส่ง Request

```javascript
// User กรอก username/password
fetch('http://localhost:8080/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    username: "6414421234",
    password: "mypassword"
  })
})
```

---

### [2] AuthController.java - รับ Request

**ไฟล์:** `controller/AuthController.java`

```java
@PostMapping("/api/auth/login")
public ResponseEntity<LoginResponse> login(@RequestBody LoginRequest request) {
    // รับ username/password จาก Frontend
    String username = request.getUsername();
    String password = request.getPassword();
    
    // ส่งไปตรวจสอบที่ TU API
    TuVerifyResponse tuResponse = tuAuthService.verify(username, password);
    
    if (tuResponse.isStatus()) {
        // ถ้าถูกต้อง → บันทึก User
        User user = userService.saveOrUpdateFromTuApi(tuResponse);
        return ResponseEntity.ok(new LoginResponse(true, "Login Success", ...));
    } else {
        // ถ้าผิด → ส่ง error
        return ResponseEntity.status(401).body(new LoginResponse(false, "Invalid credentials"));
    }
}
```

**หน้าที่:**
- รับข้อมูลจาก Frontend
- เรียก TuAuthService ตรวจสอบ
- เรียก UserService บันทึกข้อมูล
- ส่ง Response กลับ

---

### [3] TuAuthService.java - เรียก TU API

**ไฟล์:** `service/TuAuthService.java`

```java
public TuVerifyResponse verify(String username, String password) {
    // สร้าง Request ไปยัง TU API
    TuVerifyRequest body = new TuVerifyRequest(username, password);
    
    // เรียก TU API ผ่าน WebClient
    TuVerifyResponse response = client.post()
        .uri("https://restapi.tu.ac.th/api/v1/auth/Ad/verify")
        .header("Application-Key", tuApiKey)
        .bodyValue(body)
        .retrieve()
        .bodyToMono(TuVerifyResponse.class)
        .block();
    
    return response; // ส่งกลับไปที่ AuthController
}
```

**หน้าที่:**
- สร้าง HTTP Request ไปยัง TU API
- ใส่ Application-Key ใน Header
- รับ Response จาก TU API
- ส่งข้อมูล User กลับไป

---

### [4] TU API - ตรวจสอบข้อมูล

**Request ไป TU API:**
```json
POST https://restapi.tu.ac.th/api/v1/auth/Ad/verify
Headers: Application-Key: YOUR_KEY

{
  "UserName": "6414421234",
  "PassWord": "mypassword"
}
```

**Response จาก TU API:**
```json
{
  "status": true,
  "username": "6414421234",
  "displayname_th": "นายทดสอบ ระบบ",
  "email": "test@dome.tu.ac.th",
  "faculty": "วิทยาศาสตร์และเทคโนโลยี",
  "department": "วิทยาการคอมพิวเตอร์"
}
```

---

### [5] UserService.java - บันทึก User ลง Database

**ไฟล์:** `service/UserService.java`

```java
public User saveOrUpdateFromTuApi(TuVerifyResponse tuResponse) {
    // เช็คว่า User มีอยู่แล้วหรือยัง
    Optional<User> existingUser = userRepository.findByUsername(tuResponse.getUsername());
    
    User user;
    if (existingUser.isPresent()) {
        // ถ้ามีแล้ว → UPDATE ข้อมูล
        user = existingUser.get();
        user.setDisplaynameTh(tuResponse.getDisplaynameTh());
        user.setEmail(tuResponse.getEmail());
        // updated_at จะอัพเดทอัตโนมัติ
    } else {
        // ถ้ายังไม่มี → INSERT ใหม่
        user = new User();
        user.setUsername(tuResponse.getUsername());
        user.setDisplaynameTh(tuResponse.getDisplaynameTh());
        user.setEmail(tuResponse.getEmail());
        user.setFaculty(tuResponse.getFaculty());
        user.setDepartment(tuResponse.getDepartment());
    }
    
    return userRepository.save(user); // บันทึกลง Database
}
```

**หน้าที่:**
- เช็คว่า User เคย login หรือยัง
- ถ้าเคย → อัพเดทข้อมูล
- ถ้ายังไม่เคย → สร้าง User ใหม่
- บันทึกลง SQL Server

---

### [6] SQL Server (Docker) - เก็บข้อมูล

**ตาราง `users`:**
```sql
CREATE TABLE users (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    username NVARCHAR(50) UNIQUE,
    displayname_th NVARCHAR(255),
    email NVARCHAR(255),
    faculty NVARCHAR(255),
    department NVARCHAR(255),
    created_at DATETIME2,
    updated_at DATETIME2
);
```

**ตัวอย่างข้อมูลที่บันทึก:**
```
id | username   | displayname_th    | email              | created_at          | updated_at
---|------------|-------------------|--------------------|---------------------|--------------------
1  | 6414421234 | นายทดสอบ ระบบ    | test@dome.tu.ac.th | 2025-10-09 10:00:00 | 2025-10-09 10:00:00
2  | 6414421235 | นางสาวทดสอบ ระบบ | test2@dome.tu.ac.th| 2025-10-09 10:05:00 | 2025-10-09 10:05:00
```

---

### [7] Response กลับไป Frontend

```json
{
  "status": true,
  "message": "Login Success",
  "username": "6414421234",
  "displaynameTh": "นายทดสอบ ระบบ",
  "email": "test@dome.tu.ac.th"
}
```

---

## 🗄️ วิธีสร้าง Database เก็บการเข้า-ออกของ User

### ขั้นตอนที่ 1: Start SQL Server (Docker)

```bash
docker run -e "ACCEPT_EULA=Y" \
  -e "MSSQL_SA_PASSWORD=YourStrong!Passw0rd" \
  -p 1433:1433 \
  --name sqlserver \
  -d mcr.microsoft.com/mssql/server:2022-latest
```

---

### ขั้นตอนที่ 2: สร้าง Database

```bash
# เข้าสู่ SQL Server
docker exec -it sqlserver /opt/mssql-tools/bin/sqlcmd \
  -S localhost -U sa -P "YourStrong!Passw0rd"

# สร้าง Database
1> CREATE DATABASE EventDB;
2> GO
1> USE EventDB;
2> GO
```

---

### ขั้นตอนที่ 3: สร้างตาราง users

```sql
CREATE TABLE users (
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

-- สร้าง Index สำหรับค้นหาเร็วขึ้น
CREATE INDEX idx_username ON users(username);
GO
```

**บันทึก SQL นี้ไว้ในไฟล์:** `src/main/resources/sql/create_users_table.sql`

---

### ขั้นตอนที่ 4: ตั้งค่า application.properties

```properties
# Database Connection (SQL Server in Docker)
spring.datasource.url=jdbc:sqlserver://localhost:1433;databaseName=EventDB;encrypt=false;trustServerCertificate=true
spring.datasource.username=sa
spring.datasource.password=YourStrong!Passw0rd
spring.datasource.driver-class-name=com.microsoft.sqlserver.jdbc.SQLServerDriver

# JPA จะสร้าง/อัพเดทตารางอัตโนมัติ
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
```

---

### ขั้นตอนที่ 5: สร้าง User Model (Entity)

**ไฟล์:** `model/User.java`

```java
@Entity
@Table(name = "users")
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(unique = true, nullable = false)
    private String username;
    
    @Column(nullable = false)
    private String displaynameTh;
    
    private String email;
    private String faculty;
    private String department;
    
    @CreationTimestamp
    private LocalDateTime createdAt;
    
    @UpdateTimestamp
    private LocalDateTime updatedAt;
    
    // Getters และ Setters
}
```

---

### ขั้นตอนที่ 6: สร้าง Repository

**ไฟล์:** `repository/UserRepository.java`

```java
@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByUsername(String username);
}
```

---

### ขั้นตอนที่ 7: Run Application

```bash
mvn spring-boot:run
```

**ผลลัพธ์:**
- Spring Boot จะเชื่อมต่อกับ SQL Server
- ตาราง `users` จะถูกสร้างอัตโนมัติ (ถ้ายังไม่มี)
- พร้อมใช้งาน!

---

## ✅ ทดสอบระบบ

### 1. ทดสอบ Login

```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "6414421234",
    "password": "your_password"
  }'
```

### 2. ดูข้อมูลใน Database

```sql
-- เข้า SQL Server
docker exec -it sqlserver /opt/mssql-tools/bin/sqlcmd \
  -S localhost -U sa -P "YourStrong!Passw0rd"

-- ดูข้อมูล
1> USE EventDB;
2> GO
1> SELECT * FROM users;
2> GO

-- ผลลัพธ์:
-- id | username   | displayname_th    | email              | created_at          | updated_at
-- ---|------------|-------------------|--------------------|---------------------|--------------------
-- 1  | 6414421234 | นายทดสอบ ระบบ    | test@dome.tu.ac.th | 2025-10-09 10:00:00 | 2025-10-09 10:00:00
```

---

## 📊 การเก็บข้อมูลการเข้า-ออก

### ข้อมูลที่ระบบเก็บ:

| ข้อมูล | คำอธิบาย |
|--------|----------|
| `created_at` | วันที่ Login ครั้งแรก |
| `updated_at` | วันที่ Login ล่าสุด |

**การทำงาน:**
- ครั้งแรกที่ User login → บันทึก `created_at`
- ทุกครั้งที่ login ซ้ำ → อัพเดท `updated_at`

**ตัวอย่าง:**
```
User login วันที่ 1 ต.ค. → created_at: 2025-10-01, updated_at: 2025-10-01
User login วันที่ 5 ต.ค. → created_at: 2025-10-01, updated_at: 2025-10-05 (อัพเดท)
User login วันที่ 9 ต.ค. → created_at: 2025-10-01, updated_at: 2025-10-09 (อัพเดท)
```

---

## 🎯 สรุป

### 1. การเชื่อมต่อ:
```
Frontend → AuthController → TuAuthService → TU API
                ↓
         UserService → Database
```

### 2. ข้อมูลที่เก็บ:
- ข้อมูล User จาก TU API
- วันที่ Login ครั้งแรก (created_at)
- วันที่ Login ล่าสุด (updated_at)

### 3. Database Setup:
- SQL Server ใน Docker (Port 1433)
- ตาราง `users` เก็บข้อมูล User
- ไม่เก็บ password (ใช้ TU API ตรวจสอบ)

---

**Version:** 1.0  
**Last Updated:** October 2025  
**CS261 Group 4**
