# ✅ สรุปการเชื่อมต่อ Frontend - Backend

## 📦 ไฟล์ที่สร้าง/แก้ไข

### **ใหม่:**
1. `src/services/eventService.js` - API สำหรับ Events
2. `src/services/favoriteService.js` - API สำหรับ Favorites  
3. `.env` - Config Backend URL
4. `INTEGRATION_GUIDE.md` - คู่มือใช้งาน

### **แก้ไข:**
1. `src/lib/api.js` - เชื่อมกับ Backend จริง
2. `src/hooks/useEventFavorites.js` - รองรับ userId
3. `src/main.jsx` - ส่ง userId ไป API

---

## 🚀 วิธีใช้งานแบบเร็ว

### **1. Start Backend:**
```bash
cd backend
mvn spring-boot:run
# รอจนเห็น: Tomcat started on port(s): 8080
```

### **2. Start Frontend:**
```bash
cd frontend
npm run dev
# เปิด: http://localhost:5173/activities
```

### **3. ทดสอบ:**
- เปิด `http://localhost:5173/activities`
- ควรเห็น Event Cards
- กด F12 → Console → ดู logs

---

## 🔌 API Endpoints ที่ใช้

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/events/cards` | ดึง Events ทั้งหมด |
| GET | `/api/events/cards/user/{userId}` | ดึง Events พร้อม Favorite |
| POST | `/api/favorites` | เพิ่ม Favorite |
| DELETE | `/api/favorites` | ลบ Favorite |

---

## ⚠️ สิ่งที่ต้องแก้ต่อ

1. **Login ต้องส่ง userId กลับมา**
   - แก้ใน Backend: `AuthController.java`
   - เพิ่ม `userId` ใน `LoginResponse`

2. **เพิ่มข้อมูลทดสอบใน Database**
   ```sql
   INSERT INTO dbo.Events (title, location, startTime, endTime, imageUrl, ...)
   VALUES ('ค่ายอาสา', 'กาญจนบุรี', '2025-10-07', ...);
   ```

---

## 📞 ติดปัญหา?

1. เช็ค Backend รันอยู่หรือไม่: `http://localhost:8080/api/events/cards`
2. เช็ค Console (F12) มี Error หรือไม่
3. เช็ค Network Tab → XHR Requests
4. ดูคู่มือเต็มใน `INTEGRATION_GUIDE.md`

---

✅ **เสร็จแล้ว! Cards เชื่อมต่อกับ Backend สำเร็จ** 🎉
