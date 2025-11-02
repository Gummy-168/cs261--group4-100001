# 🧪 Testing Guide

## การทดสอบระบบหลังการอัปเดต

### ✅ Pre-Testing Checklist

- [ ] Backend รันอยู่ที่ port 8080
- [ ] Frontend รันอยู่ที่ port 5173
- [ ] Database (SQL Server) เชื่อมต่อได้
- [ ] รัน SQL Migration แล้ว (activityId → eventId)

---

## 🔐 1. ทดสอบ JWT Authentication

### **1.1 Login Test**

**Using Postman/Insomnia:**
```http
POST http://localhost:8080/api/auth/login
Content-Type: application/json

{
  "username": "6709616848",
  "password": "your-password"
}
```

**Expected Response:**
```json
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

**✅ Pass Criteria:**
- Status code: 200
- Response มี `token` field
- Token format: JWT (3 ส่วนคั่นด้วย `.`)

### **1.2 Token Validation Test**

```http
GET http://localhost:8080/api/auth/validate
Authorization: Bearer <your-token-here>
```

**Expected Response:**
```json
{
  "valid": true,
  "message": "Token is valid",
  "userId": 1,
  "username": "6709616848"
}
```

**✅ Pass Criteria:**
- Status code: 200
- `valid` = true
- มี userId และ username

### **1.3 Invalid Token Test**

```http
GET http://localhost:8080/api/auth/validate
Authorization: Bearer invalid-token
```

**Expected Response:**
```json
{
  "valid": false,
  "message": "Token is invalid or expired"
}
```

**✅ Pass Criteria:**
- Status code: 401
- `valid` = false

---

## 📋 2. ทดสอบ Event APIs

### **2.1 Get All Events (Public)**

```http
GET http://localhost:8080/api/events/cards
```

**Expected Response:**
```json
[
  {
    "id": 1,
    "title": "ชื่อกิจกรรม",
    "description": "รายละเอียด",
    "location": "สถานที่",
    "startTime": "2025-10-20T10:00:00",
    "endTime": "2025-10-20T16:00:00",
    "imageUrl": "/api/images/events/1.jpg",
    "category": "กีฬา",
    "organizer": "ชมรมฟุตบอล",
    "isFavorited": false
  }
]
```

**✅ Pass Criteria:**
- Status code: 200
- Response เป็น Array
- ไม่ต้องใช้ Token

### **2.2 Get Events for User (Auth Required)**

```http
GET http://localhost:8080/api/events/cards/user/1
Authorization: Bearer <your-token>
```

**Expected Response:**
```json
[
  {
    "id": 1,
    "title": "ชื่อกิจกรรม",
    "isFavorited": true
  }
]
```

**✅ Pass Criteria:**
- Status code: 200
- `isFavorited` แสดงค่าถูกต้อง
- ต้องใช้ Token

---

## ❤️ 3. ทดสอบ Favorite System

### **3.1 Add Favorite (Auth Required)**

```http
POST http://localhost:8080/api/favorites
Authorization: Bearer <your-token>
Content-Type: application/json

{
  "userId": 1,
  "activityId": 1
}
```

**Expected Response:**
```json
{
  "id": 1,
  "userId": 1,
  "eventId": 1
}
```

**✅ Pass Criteria:**
- Status code: 200
- Favorite ถูกสร้าง
- Notification Queue ถูกสร้าง

### **3.2 Get User Favorites (Auth Required)**

```http
GET http://localhost:8080/api/favorites/1
Authorization: Bearer <your-token>
```

**Expected Response:**
```json
[
  {
    "id": 1,
    "userId": 1,
    "eventId": 1
  }
]
```

**✅ Pass Criteria:**
- Status code: 200
- แสดงรายการ favorites ทั้งหมด

### **3.3 Remove Favorite (Auth Required)**

```http
DELETE http://localhost:8080/api/favorites
Authorization: Bearer <your-token>
Content-Type: application/json

{
  "userId": 1,
  "activityId": 1
}
```

**Expected Response:**
- Status code: 204 (No Content)

**✅ Pass Criteria:**
- Favorite ถูกลบ
- Notification Queue ถูกลบ

### **3.4 Duplicate Favorite Test**

```http
POST http://localhost:8080/api/favorites
Authorization: Bearer <your-token>
Content-Type: application/json

{
  "userId": 1,
  "activityId": 1
}
```

**(เพิ่มซ้ำกัน)**

**Expected Response:**
```json
{
  "message": "Event already favorited"
}
```

**✅ Pass Criteria:**
- Status code: 400 หรือ 409
- Error message ชัดเจน

---

## 🌐 4. ทดสอบ CORS

### **4.1 Frontend Request Test**

**Open Frontend Console:**
```javascript
// ใน Browser Console ที่ http://localhost:5173
fetch('http://localhost:8080/api/events/cards')
  .then(r => r.json())
  .then(console.log)
```

**✅ Pass Criteria:**
- ไม่มี CORS error
- ได้ response กลับมา

### **4.2 Invalid Origin Test**

```javascript
// จาก origin ที่ไม่อนุญาต
fetch('http://localhost:8080/api/events/cards', {
  headers: { 'Origin': 'http://malicious.com' }
})
```

**✅ Pass Criteria:**
- ถูก block โดย CORS policy

---

## 🖥️ 5. ทดสอบ Frontend Integration

### **5.1 Login Flow Test**

**Steps:**
1. เปิด `http://localhost:5173/login`
2. กรอก Username: `6709616848`
3. กรอก Password
4. เลือก "Remember me"
5. คลิก "Sign In"

**ใน Console ควรเห็น:**
```javascript
localStorage.getItem('authToken')
// "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

localStorage.getItem('userId')
// "1"
```

**✅ Pass Criteria:**
- Login สำเร็จ
- Token ถูกเก็บ
- Redirect ไปหน้าถัดไป

### **5.2 Auto Token Attachment Test**

**Open Network Tab:**
1. Login
2. Navigate to Events page
3. Check Network tab

**ใน Request Headers ควรเห็น:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**✅ Pass Criteria:**
- Token ถูกแนบอัตโนมัติ
- ไม่ต้องเพิ่ม Header เอง

### **5.3 Favorite Toggle Test**

**Steps:**
1. Login
2. ไปที่ Activities page
3. คลิก ♡ (Like) บน Event card
4. ควรเปลี่ยนเป็น ♥
5. คลิกอีกครั้ง ควรเปลี่ยนกลับเป็น ♡

**✅ Pass Criteria:**
- Favorite เพิ่ม/ลบได้
- UI อัปเดตทันที
- ไม่มี error

### **5.4 Token Expiration Test**

**Steps:**
1. Login
2. รอ 24 ชั่วโมง (หรือเปลี่ยน jwt.expiration เป็น 60000 = 1 นาที)
3. พยายาม access protected route

**✅ Pass Criteria:**
- Auto redirect ไป Login page
- Token ถูกลบออก

---

## 🗄️ 6. ทดสอบ Database

### **6.1 Check Favorite Schema**

```sql
USE EventDB;

-- ตรวจสอบว่า column ถูกเปลี่ยนแล้ว
SELECT 
    c.name AS ColumnName,
    t.name AS DataType
FROM sys.columns c
INNER JOIN sys.types t ON c.user_type_id = t.user_type_id
WHERE c.object_id = OBJECT_ID('dbo.favorites');
```

**Expected Result:**
```
id          bigint
userId      bigint
eventId     bigint  ← ต้องเป็น eventId ไม่ใช่ activityId
```

### **6.2 Check Login History**

```sql
-- ตรวจสอบว่า login ถูกบันทึก
SELECT TOP 5 
    user_id,
    username,
    ip_address,
    login_time,
    status
FROM dbo.login_history
ORDER BY login_time DESC;
```

**✅ Pass Criteria:**
- มี record ใหม่ทุกครั้งที่ login
- user_id ไม่เป็น NULL
- status = 'SUCCESS'

### **6.3 Check Notification Queue**

```sql
-- ตรวจสอบว่า notification ถูกสร้าง
SELECT 
    user_id,
    activity_id,
    send_at,
    status
FROM dbo.notification_queue
WHERE status = 'PENDING';
```

**✅ Pass Criteria:**
- มี notification queue เมื่อ add favorite
- send_at = event startTime - 1 day

---

## 📊 7. ทดสอบ Swagger UI

### **7.1 Access Swagger**

**URL:** `http://localhost:8080/swagger-ui.html`

**✅ Pass Criteria:**
- Swagger UI แสดงผล
- เห็น API endpoints ทั้งหมด
- สามารถ test APIs ได้

### **7.2 Test API through Swagger**

**Steps:**
1. เปิด Swagger UI
2. ขยาย `/api/auth/login`
3. คลิก "Try it out"
4. กรอก request body
5. Execute

**✅ Pass Criteria:**
- Execute สำเร็จ
- ได้ response กลับมา
- Copy token ได้

### **7.3 Authorize in Swagger**

**Steps:**
1. คลิก "Authorize" button
2. ใส่ Token: `Bearer <your-token>`
3. คลิก Authorize
4. ทดสอบ protected endpoints

**✅ Pass Criteria:**
- สามารถ authorize ได้
- Protected endpoints ทำงาน

---

## 🔄 8. Integration Test Scenarios

### **Scenario 1: Complete User Journey**

```
1. Login → Get Token
2. View Events → See all events
3. Add Favorite → Event favorited
4. View Favorites → See favorited event
5. Remove Favorite → Event unfavorited
6. Logout → Token cleared
```

### **Scenario 2: Security Test**

```
1. Try access /api/events without token
   → Should work (public)
   
2. Try access /api/favorites without token
   → Should fail (401)
   
3. Try access with expired token
   → Should fail (401)
   
4. Try access with invalid token
   → Should fail (401)
```

### **Scenario 3: Error Handling**

```
1. Login with wrong password
   → Should show error message
   
2. Add favorite with invalid eventId
   → Should show error message
   
3. Network error
   → Should show connection error
```

---

## 📝 Test Results Template

```
## Test Date: [DATE]
## Tester: [NAME]

### Authentication Tests
- [ ] Login Success
- [ ] Token Generation
- [ ] Token Validation
- [ ] Invalid Token Handling

### Event API Tests
- [ ] Get All Events
- [ ] Get Events for User
- [ ] Get Event by ID
- [ ] Create Event (Auth)

### Favorite Tests
- [ ] Add Favorite
- [ ] Get Favorites
- [ ] Remove Favorite
- [ ] Duplicate Prevention

### Frontend Tests
- [ ] Login Flow
- [ ] Auto Token Attachment
- [ ] Favorite Toggle
- [ ] Token Expiration

### Database Tests
- [ ] Schema Migration
- [ ] Login History
- [ ] Notification Queue

### Swagger Tests
- [ ] Swagger UI Access
- [ ] API Testing
- [ ] Authorization

### Security Tests
- [ ] CORS Policy
- [ ] Protected Routes
- [ ] Invalid Token

### Notes:
[Add any issues or observations here]
```

---

## 🐛 Common Issues & Solutions

### Issue 1: 401 Unauthorized
**Solution:** Login again to get fresh token

### Issue 2: CORS Error
**Solution:** Check SecurityConfig allowed origins

### Issue 3: Column 'activityId' not found
**Solution:** Run SQL migration script

### Issue 4: Token not attached
**Solution:** Check axiosInstance is being used

### Issue 5: Favorite not saved
**Solution:** Check token is valid and user is authenticated

---

## ✅ Final Checklist

- [ ] All authentication tests pass
- [ ] All API tests pass
- [ ] Frontend integration works
- [ ] Database schema correct
- [ ] Swagger UI accessible
- [ ] Security measures working
- [ ] No console errors
- [ ] No CORS issues

---

**🎉 Testing Complete!**

ถ้าทุก test pass แสดงว่าระบบพร้อมใช้งาน!
