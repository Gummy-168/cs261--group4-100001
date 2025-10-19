# 🚀 Project Update Guide - Security & Improvements

## ✅ สิ่งที่ได้ทำการปรับปรุง

### **Backend (Spring Boot)**

#### 1. **JWT Authentication System** 🔐
- เพิ่ม JWT Token-based Authentication
- สร้าง `JwtService` สำหรับจัดการ Token
- สร้าง `JwtAuthenticationFilter` สำหรับตรวจสอบ Token
- สร้าง `SecurityConfig` สำหรับ Spring Security

**ไฟล์ใหม่:**
```
src/main/java/com/example/project_CS261/security/
├── JwtService.java
├── JwtAuthenticationFilter.java
└── SecurityConfig.java
```

#### 2. **Global CORS Configuration** 🌐
- ลบ `@CrossOrigin` ออกจากทุก Controller
- ใช้ Global CORS Configuration ใน `SecurityConfig`
- รองรับ multiple origins (localhost:5173, 3000)

#### 3. **API Documentation (Swagger)** 📚
- เพิ่ม SpringDoc OpenAPI
- Swagger UI: `http://localhost:8080/swagger-ui.html`
- API Docs: `http://localhost:8080/v3/api-docs`

#### 4. **Database Schema Fix** 🗄️
- เปลี่ยนชื่อ column จาก `activityId` → `eventId` ใน `favorites` table
- อัปเดต Model, Repository, Service ให้สอดคล้องกัน

**SQL Migration:**
```sql
src/main/resources/sql/fix_favorite_column.sql
```

#### 5. **Improved Logging** 📝
- เพิ่ม Logger ในทุก Service
- Log Level Configuration
- Request/Response Logging

#### 6. **Enhanced Error Handling** ⚠️
- Global Exception Handler
- Consistent Error Response Format
- Better Error Messages

#### 7. **Environment Configuration** ⚙️
- สร้าง `.env.example`
- Use Environment Variables สำหรับ sensitive data
- JWT Configuration

---

### **Frontend (React + Vite)**

#### 1. **Axios Instance with Interceptors** 🔄
- Centralized API calls
- Auto JWT Token injection
- Global Error Handling
- Auto redirect on 401 Unauthorized

**ไฟล์ใหม่:**
```
src/lib/axiosInstance.js
```

#### 2. **Updated Services** 🛠️
- `authService.js` - JWT Token management
- `eventService.js` - Use axiosInstance
- `favoriteService.js` - Use axiosInstance

#### 3. **New Components** 🎨
- `LoadingSpinner.jsx` - Reusable loading component
- `ErrorBoundary.jsx` - Error boundary component

#### 4. **Token Management** 🔑
- Store JWT Token in localStorage/sessionStorage
- Auto-attach Token to all API requests
- Token validation
- Auto-logout on token expiration

---

## 🔧 การติดตั้งและรัน

### **Backend Setup**

#### 1. อัปเดต Dependencies
```bash
cd backend
mvn clean install
```

#### 2. รัน SQL Migration
```sql
-- เปิด SQL Server Management Studio
-- เชื่อมต่อกับ EventDB
-- รัน script นี้:
USE EventDB;
EXEC sp_rename 'dbo.favorites.activityId', 'eventId', 'COLUMN';
```

#### 3. ตั้งค่า Environment Variables (Optional)
```bash
# Windows
set TU_API_KEY=your-api-key-here
set JWT_SECRET=your-secure-secret-key

# Linux/Mac
export TU_API_KEY=your-api-key-here
export JWT_SECRET=your-secure-secret-key
```

#### 4. รัน Backend
```bash
mvn spring-boot:run
```

**ตรวจสอบ:**
- Server: `http://localhost:8080`
- Swagger UI: `http://localhost:8080/swagger-ui.html`
- Health Check: `http://localhost:8080/api/events/cards`

---

### **Frontend Setup**

#### 1. ติดตั้ง Dependencies (ถ้ายังไม่ได้ติดตั้ง)
```bash
cd frontend
npm install
```

#### 2. ตั้งค่า Environment Variables (Optional)
สร้างไฟล์ `.env` ใน frontend folder:
```env
VITE_API_BASE_URL=http://localhost:8080/api
```

#### 3. รัน Frontend
```bash
npm run dev
```

**ตรวจสอบ:**
- Frontend: `http://localhost:5173`

---

## 🧪 การทดสอบระบบใหม่

### **1. ทดสอบ Login with JWT**

```javascript
// ใน Browser Console หลัง Login
console.log(localStorage.getItem('authToken'));
// ควรเห็น JWT Token

console.log(localStorage.getItem('userId'));
// ควรเห็น User ID
```

### **2. ทดสอบ API with Postman**

**Login:**
```http
POST http://localhost:8080/api/auth/login
Content-Type: application/json

{
  "username": "6709616848",
  "password": "your-password"
}

Response:
{
  "status": true,
  "message": "Login Success",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "userId": 1,
  "username": "6709616848",
  "displaynameTh": "ชื่อ-นามสกุล",
  "email": "email@dome.tu.ac.th"
}
```

**Get Events (ต้องมี Token):**
```http
GET http://localhost:8080/api/events
Authorization: Bearer <your-jwt-token>
```

**Add Favorite (ต้องมี Token):**
```http
POST http://localhost:8080/api/favorites
Authorization: Bearer <your-jwt-token>
Content-Type: application/json

{
  "userId": 1,
  "activityId": 1
}
```

### **3. ทดสอบ Token Validation**

```http
GET http://localhost:8080/api/auth/validate
Authorization: Bearer <your-jwt-token>

Response:
{
  "valid": true,
  "message": "Token is valid",
  "userId": 1,
  "username": "6709616848"
}
```

---

## 📊 ความแตกต่างระหว่าง Old vs New

### **Authentication Flow**

**เดิม (ไม่ปลอดภัย):**
```
1. Login → รับ userId
2. เก็บ userId ใน localStorage
3. ส่ง userId ไปกับทุก request
❌ Problem: ใครก็แก้ userId ได้
```

**ใหม่ (ปลอดภัย):**
```
1. Login → รับ JWT Token + userId
2. เก็บ Token ใน localStorage/sessionStorage
3. ส่ง Token ไปกับทุก request
4. Backend ตรวจสอบ Token และดึง userId จาก Token
✅ Secure: ไม่สามารถปลอมแปลง Token ได้
```

### **API Calls**

**เดิม:**
```javascript
const response = await axios.get('http://localhost:8080/api/events');
// แต่ละ Service เรียก axios ตรงๆ
// ไม่มี Error Handling แบบรวม
```

**ใหม่:**
```javascript
const response = await axiosInstance.get('/events');
// Token แนบอัตโนมัติ
// Error Handling แบบรวม
// Auto redirect on 401
```

---

## 🔒 Security Features

### **1. JWT Token Expiration**
- Default: 24 hours (86400000 ms)
- Config: `jwt.expiration` in `application.properties`

### **2. Token Auto-refresh**
- Frontend จะตรวจสอบ Token อัตโนมัติ
- ถ้า Token หมดอายุ → Auto redirect to Login

### **3. Protected Routes**
- ทุก Route ใน Backend ต้องมี Token (ยกเว้น public endpoints)
- Public endpoints:
  - `/api/auth/login`
  - `/api/events/cards`
  - `/api/images/**`
  - Swagger UI

### **4. CORS Protection**
- จำกัด origins ที่สามารถเรียก API ได้
- Default: localhost:5173, localhost:3000

---

## 🐛 Troubleshooting

### **Problem: 401 Unauthorized**

**สาเหตุ:**
- Token หมดอายุ
- Token ไม่ถูกต้อง
- ไม่ได้ส่ง Token

**วิธีแก้:**
```javascript
// ตรวจสอบ Token
console.log(localStorage.getItem('authToken'));

// Login ใหม่
// Token จะถูก refresh อัตโนมัติ
```

### **Problem: CORS Error**

**สาเหตุ:**
- Frontend origin ไม่อยู่ใน allowed list

**วิธีแก้:**
```java
// SecurityConfig.java
configuration.setAllowedOrigins(Arrays.asList(
    "http://localhost:5173",
    "http://your-frontend-url"  // เพิ่ม origin ของคุณ
));
```

### **Problem: Column 'activityId' not found**

**สาเหตุ:**
- ยังไม่ได้รัน SQL Migration

**วิธีแก้:**
```sql
-- รัน script นี้
EXEC sp_rename 'dbo.favorites.activityId', 'eventId', 'COLUMN';
```

---

## 📈 Performance Improvements

### **1. Axios Interceptors**
- ลด Code Duplication
- Centralized Error Handling
- Auto Token Management

### **2. Loading States**
- LoadingSpinner Component
- Better UX

### **3. Error Boundaries**
- Catch React Errors
- Prevent App Crash

---

## 🎯 Next Steps (แนะนำเพิ่มเติม)

### **Priority 1: Testing**
- [ ] Unit Tests (Backend)
- [ ] Integration Tests
- [ ] E2E Tests (Frontend)

### **Priority 2: Features**
- [ ] Refresh Token Mechanism
- [ ] Role-based Access Control (Admin/User)
- [ ] Password Reset
- [ ] Email Verification

### **Priority 3: Optimization**
- [ ] Redis Caching
- [ ] Database Indexing
- [ ] Query Optimization
- [ ] Image Optimization

### **Priority 4: Deployment**
- [ ] Docker Setup
- [ ] CI/CD Pipeline
- [ ] Environment Configuration (Dev/Prod)
- [ ] Monitoring & Logging

---

## 📚 เอกสารเพิ่มเติม

### **Backend**
- [Spring Security JWT](https://spring.io/guides/tutorials/spring-boot-oauth2/)
- [SpringDoc OpenAPI](https://springdoc.org/)

### **Frontend**
- [Axios Interceptors](https://axios-http.com/docs/interceptors)
- [React Error Boundaries](https://react.dev/reference/react/Component#catching-rendering-errors-with-an-error-boundary)

---

## ✅ Checklist

- [ ] ติดตั้ง Backend Dependencies
- [ ] รัน SQL Migration
- [ ] ตั้งค่า Environment Variables
- [ ] รัน Backend
- [ ] ทดสอบ Swagger UI
- [ ] ติดตั้ง Frontend Dependencies
- [ ] รัน Frontend
- [ ] ทดสอบ Login
- [ ] ทดสอบ JWT Token
- [ ] ทดสอบ API Calls with Token

---

**🎉 ทำทั้งหมดเสร็จแล้ว! ระบบของคุณมีความปลอดภัยและทันสมัยมากขึ้น**

มีคำถามหรือเจอปัญหาตรงไหน แจ้งได้เลยนะครับ! 😊
