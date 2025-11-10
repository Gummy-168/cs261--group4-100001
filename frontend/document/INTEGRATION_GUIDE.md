# 🔗 คู่มือเชื่อมต่อ Frontend - Backend (Event Cards)

## ✅ สิ่งที่ทำเสร็จแล้ว

### 1. **สร้าง Service Files:**
- ✅ `eventService.js` - จัดการ Events API
- ✅ `favoriteService.js` - จัดการ Favorites API
- ✅ อัปเดต `api.js` - เชื่อมกับ Backend จริง
- ✅ อัปเดต `useEventFavorites.js` - รองรับ userId
- ✅ อัปเดต `main.jsx` - ส่ง userId ไปที่ API

### 2. **Config Files:**
- ✅ สร้าง `.env` สำหรับ Backend URL

---

## 🚀 วิธีใช้งาน

### **ขั้นตอนที่ 1: เตรียม Backend**

```bash
# 1. ไปที่ Backend folder
cd C:\Users\titik\Desktop\New_Backend\backend

# 2. รัน SQL Script (ถ้ายังไม่ได้รัน)
# เปิด SQL Server Management Studio และรัน:
# - update_events_table.sql (เพิ่มคอลัมน์ใหม่)

# 3. เพิ่มข้อมูลทดสอบ (ถ้ายังไม่มี)
INSERT INTO dbo.Events (title, description, location, startTime, endTime, imageUrl, category, maxCapacity, currentParticipants, status, organizer, fee)
VALUES 
('ค่ายอาสา Asa Camping 4 วัน 3 คืน', 'กิจกรรมค่ายอาสาพัฒนาชุมชน', 'กาญจนบุรี', '2025-10-07 08:00:00', '2025-10-10 17:00:00', '/images/events/camping.jpg', 'กิจกรรมพิเศษ', 50, 23, 'OPEN', 'ชมรมอาสา', 0),
('การแข่งขันฟุตบอล Inter-Faculty', 'แข่งขันฟุตบอลระหว่างคณะ', 'สนามกีฬา มธ.', '2025-10-15 09:00:00', '2025-10-15 18:00:00', '/images/events/football.jpg', 'กีฬา', 100, 87, 'OPEN', 'สโมสรนักศึกษา', 0),
('Workshop: Web Development', 'เรียนรู้การพัฒนาเว็บไซต์', 'ห้อง SC1-306', '2025-10-20 13:00:00', '2025-10-20 16:00:00', '/images/events/workshop.jpg', 'วิชาการ', 30, 30, 'FULL', 'คณะวิทยาศาสตร์', 100);

# 4. Start Backend
mvn spring-boot:run
# รอจนเห็น: Tomcat started on port(s): 8080 (http)
```

---

### **ขั้นตอนที่ 2: เตรียม Frontend**

```bash
# 1. ไปที่ Frontend folder
cd C:\Users\titik\Desktop\New_Frontend\cs261--group4-100001\frontend

# 2. ติดตั้ง dependencies (ถ้ายังไม่ได้ติดตั้ง)
npm install

# 3. ตรวจสอบไฟล์ .env
# ควรมีบรรทัดนี้:
VITE_API_BASE_URL=http://localhost:8080/api

# 4. Start Frontend
npm run dev
# จะเห็น: Local: http://localhost:5173/
```

---

### **ขั้นตอนที่ 3: ทดสอบการทำงาน**

#### **A. ทดสอบแบบไม่ Login (ดู Events อย่างเดียว)**

1. เปิดเบราว์เซอร์: `http://localhost:5173/activities`
2. ควรเห็น Cards แสดงกิจกรรมจาก Backend
3. ลองกดปุ่ม ♡ (หัวใจ) → ควรขึ้น Modal ให้ Login

#### **B. ทดสอบแบบ Login (ใช้ Favorite ได้)**

⚠️ **หมายเหตุ:** ตอนนี้ยังต้องแก้ไขส่วน Login เพื่อให้ได้ `userId` กลับมา

1. Login เข้าระบบ (หน้า `/login`)
2. กลับมาที่ `/activities`
3. กดปุ่ม ♡ (หัวใจ) → ควรเปลี่ยนเป็น ♥ (สีแดง)
4. Refresh หน้า → สถานะ Favorite ควรยังคงอยู่

---

## 🔍 ตรวจสอบการทำงาน

### **1. เช็ค Backend API:**

เปิดเบราว์เซอร์หรือ Postman ทดสอบ:

```bash
# ดึง Events ทั้งหมด
GET http://localhost:8080/api/events/cards

# Response ที่คาดหวัง:
[
  {
    "id": 1,
    "title": "ค่ายอาสา Asa Camping 4 วัน 3 คืน",
    "imageUrl": "/images/events/camping.jpg",
    "location": "กาญจนบุรี",
    "startTime": "2025-10-07T08:00:00",
    "category": "กิจกรรมพิเศษ",
    "maxCapacity": 50,
    "currentParticipants": 23,
    "status": "OPEN",
    "isFull": false,
    "availableSeats": 27,
    "isFavorited": false
  }
]
```

### **2. เช็ค Frontend Console:**

เปิด Chrome DevTools (F12) → Console tab

ควรเห็น:
```
✅ Events loaded successfully
✅ Transformed X events
```

ถ้าเจอ Error:
```
❌ Error fetching event cards: ...
```
→ ตรวจสอบว่า Backend รันอยู่หรือไม่

### **3. เช็ค Network Requests:**

Chrome DevTools → Network tab → Filter: XHR

ควรเห็น:
```
✅ GET http://localhost:8080/api/events/cards → Status: 200
✅ POST http://localhost:8080/api/favorites → Status: 200 (เมื่อกด Favorite)
```

---

## 🎯 Flow การทำงาน

```
┌─────────────┐
│   Browser   │
│ localhost:  │
│    5173     │
└──────┬──────┘
       │
       │ 1. User เปิดหน้า /activities
       ↓
┌─────────────────────┐
│   Activities.jsx    │
│ - useEventFavorites │
└──────┬──────────────┘
       │
       │ 2. เรียก fetchHomeData()
       ↓
┌─────────────────┐
│    api.js       │
│ - getAllEvent   │
│   Cards()       │
└──────┬──────────┘
       │
       │ 3. HTTP GET /api/events/cards
       ↓
┌──────────────────┐
│   Backend API    │
│ localhost:8080   │
└──────┬───────────┘
       │
       │ 4. Query Database
       ↓
┌──────────────────┐
│  SQL Server DB   │
│   Events Table   │
└──────┬───────────┘
       │
       │ 5. Return JSON
       ↓
┌─────────────────┐
│  EventCard.jsx  │
│  แสดงผล Cards  │
└─────────────────┘
```

---

## 🐛 การแก้ปัญหา (Troubleshooting)

### **ปัญหา 1: ไม่มี Events แสดง**

**สาเหตุ:**
- Backend ยังไม่รัน
- Database ไม่มีข้อมูล
- CORS Error

**วิธีแก้:**
```bash
# 1. เช็ค Backend
curl http://localhost:8080/api/events/cards

# 2. เช็ค Database
SELECT * FROM dbo.Events;

# 3. เช็ค CORS ใน Backend Console
# ควรเห็น: o.s.web.cors.DefaultCorsProcessor : Processed CORS request
```

### **ปัญหา 2: รูปภาพไม่แสดง**

**สาเหตุ:**
- ไม่มีรูปใน `backend/src/main/resources/static/images/events/`
- Path ใน Database ไม่ถูกต้อง

**วิธีแก้:**
```bash
# 1. วางรูปใน folder
backend/src/main/resources/static/images/events/camping.jpg

# 2. ตรวจสอบ imageUrl ใน Database
SELECT id, title, imageUrl FROM dbo.Events;

# 3. ทดสอบเข้าถึงรูปโดยตรง
http://localhost:8080/images/events/camping.jpg
```

### **ปัญหา 3: Favorite ไม่ทำงาน**

**สาเหตุ:**
- ยังไม่ Login
- ไม่มี userId

**วิธีแก้:**
```javascript
// เช็คใน Console
console.log('Auth:', auth);
console.log('User ID:', auth?.userId || auth?.profile?.id);

// ต้องได้ userId กลับมา
// ถ้าได้ null หรือ undefined → ต้องแก้ส่วน Login
```

### **ปัญหา 4: CORS Error**

**Error message:**
```
Access to fetch at 'http://localhost:8080/api/events/cards' 
from origin 'http://localhost:5173' has been blocked by CORS policy
```

**วิธีแก้:**

ตรวจสอบไฟล์ Backend:
```java
// WebConfig.java
@Configuration
public class WebConfig implements WebMvcConfigurer {
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
                .allowedOrigins("http://localhost:5173")  // ✅ ต้องตรงกับ Frontend
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(true);
    }
}
```

### **ปัญหา 5: Data ไม่ตรง format**

**สาเหตุ:**
- Backend ส่ง format ต่างจาก Frontend คาดหวัง

**วิธีแก้:**

ดูใน `api.js` ฟังก์ชัน `transformEventToFrontend()`:
```javascript
function transformEventToFrontend(event) {
  return {
    id: event.id,
    title: event.title,
    host: event.organizer || 'ไม่ระบุผู้จัด',
    date: event.startTime,
    location: event.location || 'ไม่ระบุสถานที่',
    coverUrl: event.imageUrl ? `${API_BASE.replace('/api', '')}${event.imageUrl}` : null,
    liked: event.isFavorited || false,
    // ... ปรับตาม format ที่ Frontend ต้องการ
  };
}
```

---

## 📋 Checklist ก่อนทดสอบ

- [ ] Backend รันอยู่ที่ port 8080
- [ ] Frontend รันอยู่ที่ port 5173
- [ ] Database มีข้อมูล Events อย่างน้อย 1 รายการ
- [ ] ไฟล์ `.env` มี `VITE_API_BASE_URL=http://localhost:8080/api`
- [ ] CORS Config ถูกต้องใน Backend
- [ ] เปิด Chrome DevTools เพื่อดู Console และ Network

---

## 🎉 ทดสอบสำเร็จ!

ถ้าทำตามทุกขั้นตอนแล้ว ควรเห็น:

1. ✅ Events Cards แสดงผลบนหน้าจอ
2. ✅ รูปภาพโหลดได้
3. ✅ ข้อมูลครบถ้วน (ชื่อ, สถานที่, วันที่, จำนวนคน)
4. ✅ กดปุ่ม Favorite ได้ (ถ้า Login แล้ว)
5. ✅ Refresh หน้าแล้วสถานะ Favorite ยังอยู่

---

## 🔮 ขั้นตอนต่อไป (Optional)

### **1. แก้ไข Login ให้ได้ userId:**

ปัจจุบัน Login Response จาก Backend:
```json
{
  "success": true,
  "message": "Login Success",
  "username": "6709616848",
  "displayname_th": "นายทดสอบ ระบบ",
  "email": "test@example.com"
}
```

ต้องการเพิ่ม `userId`:
```json
{
  "success": true,
  "userId": 1,  // ← เพิ่มนี้
  "username": "6709616848",
  "displayname_th": "นายทดสอบ ระบบ",
  "email": "test@example.com"
}
```

แก้ไขใน Backend `AuthController.java`:
```java
LoginResponse success = new LoginResponse(
    true, 
    "Login Success", 
    user.getId(),  // ← เพิ่ม userId
    tuResponse.getUsername(), 
    tuResponse.getDisplaynameTh(), 
    tuResponse.getEmail()
);
```

### **2. เพิ่ม Loading State:**

```javascript
const [loading, setLoading] = useState(true);

useEffect(() => {
  fetchHomeData()
    .then(data => setHomeData(data))
    .finally(() => setLoading(false));
}, []);

if (loading) return <div>Loading...</div>;
```

### **3. เพิ่ม Error Boundary:**

```javascript
if (homeError) {
  return (
    <div className="text-center p-10">
      <p className="text-red-500">{homeError}</p>
      <button onClick={() => window.location.reload()}>
        ลองใหม่อีกครั้ง
      </button>
    </div>
  );
}
```

---

## 📞 ติดปัญหา?

1. เช็ค Console Logs
2. เช็ค Network Requests (XHR)
3. เช็ค Backend Logs
4. เช็ค Database Data

**คำถามที่พบบ่อย:**
- userId หาได้จากไหน? → จาก Login Response
- imageUrl format อย่างไร? → `/images/events/filename.jpg`
- Favorite ทำงานอย่างไร? → POST/DELETE `/api/favorites`

---

✅ **เชื่อมต่อสำเร็จแล้ว! ระบบ Cards พร้อมใช้งาน** 🎉
