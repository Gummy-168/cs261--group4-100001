# 🖼️ คู่มือการจัดการรูปภาพกิจกรรม

## 📂 **วิธีที่ 1: วางรูปโดยตรง (ง่ายที่สุด)**

### ขั้นตอน:

1. **วางรูปใน Folder:**
   ```
   backend/src/main/resources/static/images/events/
   ├── camping.jpg
   ├── football.jpg
   └── workshop.jpg
   ```

2. **เพิ่มข้อมูลใน Database:**
   ```sql
   INSERT INTO dbo.Events (title, description, location, startTime, endTime, imageUrl, ...)
   VALUES ('ค่ายอาสา', '...', 'กาญจนบุรี', '2025-10-07', '2025-10-10', 
           '/images/events/camping.jpg',  -- ← Path ของรูป
           ...);
   ```

3. **เข้าถึงรูปได้ที่:**
   ```
   http://localhost:8080/images/events/camping.jpg
   ```

---

## 📤 **วิธีที่ 2: Upload ผ่าน API (แนะนำ)**

### ขั้นตอน:

### **1. Upload รูปผ่าน Postman:**

**Request:**
```
POST http://localhost:8080/api/images/upload
Content-Type: multipart/form-data

Body (form-data):
- Key: file
- Type: File
- Value: [เลือกไฟล์รูป]
```

**Response:**
```json
{
  "filename": "a1b2c3d4-e5f6-7890-abcd-ef1234567890.jpg",
  "imageUrl": "/images/events/a1b2c3d4-e5f6-7890-abcd-ef1234567890.jpg",
  "message": "Upload successful"
}
```

### **2. เอา imageUrl ไปใส่ใน Event:**

**Request:**
```
POST http://localhost:8080/api/events
Content-Type: application/json

{
  "title": "ค่ายอาสา Asa Camping",
  "description": "กิจกรรมค่ายอาสา",
  "location": "กาญจนบุรี",
  "startTime": "2025-10-07T08:00:00",
  "endTime": "2025-10-10T17:00:00",
  "imageUrl": "/images/events/a1b2c3d4-e5f6-7890-abcd-ef1234567890.jpg",
  "category": "กิจกรรมพิเศษ",
  "maxCapacity": 50,
  "currentParticipants": 0,
  "status": "OPEN",
  "organizer": "ชมรมอาสา",
  "fee": 0.0
}
```

---

## 🎨 **วิธีที่ 3: Upload จาก Frontend (React)**

### **HTML Form:**

```html
<form onSubmit={handleUpload}>
  <input type="file" accept="image/*" onChange={handleFileChange} />
  <button type="submit">Upload</button>
</form>
```

### **React Code:**

```javascript
const [file, setFile] = useState(null);
const [imageUrl, setImageUrl] = useState('');

const handleFileChange = (e) => {
  setFile(e.target.files[0]);
};

const handleUpload = async (e) => {
  e.preventDefault();
  
  // สร้าง FormData
  const formData = new FormData();
  formData.append('file', file);
  
  try {
    // Upload รูป
    const response = await fetch('http://localhost:8080/api/images/upload', {
      method: 'POST',
      body: formData
    });
    
    const data = await response.json();
    setImageUrl(data.imageUrl);
    
    console.log('Upload success:', data.imageUrl);
    // เอา data.imageUrl ไปใส่ใน Event Form
    
  } catch (error) {
    console.error('Upload failed:', error);
  }
};

// ใช้ imageUrl ตอนสร้าง Event
const createEvent = async () => {
  const eventData = {
    title: 'ค่ายอาสา',
    // ... ข้อมูลอื่นๆ
    imageUrl: imageUrl  // ← ใส่ URL จากการ upload
  };
  
  await fetch('http://localhost:8080/api/events', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(eventData)
  });
};
```

---

## 🗑️ **การลบรูปภาพ**

### **Delete API:**

```
DELETE http://localhost:8080/api/images/a1b2c3d4-e5f6-7890-abcd-ef1234567890.jpg
```

**Response:**
```json
{
  "message": "File deleted successfully"
}
```

---

## 🔍 **การดูรูปภาพ**

### **วิธีที่ 1: เข้าผ่าน Browser โดยตรง**
```
http://localhost:8080/images/events/camping.jpg
```

### **วิธีที่ 2: ใช้ API**
```
GET http://localhost:8080/api/images/camping.jpg
```

### **วิธีที่ 3: ใน Frontend**
```html
<img src="http://localhost:8080/images/events/camping.jpg" alt="Camping" />
```

หรือถ้ามี BASE_URL:
```javascript
const BASE_URL = 'http://localhost:8080';
<img src={`${BASE_URL}${event.imageUrl}`} alt={event.title} />
```

---

## 📏 **ข้อจำกัดและแนะนำ**

### **ข้อจำกัด:**
- ขนาดไฟล์สูงสุด: **10 MB**
- รองรับเฉพาะไฟล์รูป: jpg, jpeg, png, gif, webp
- ชื่อไฟล์จะถูกเปลี่ยนเป็น UUID เพื่อป้องกันชื่อซ้ำ

### **แนะนำ:**
- ใช้รูปขนาด: **1200x800 px** หรือ **16:9 ratio**
- บีบอัดรูปก่อน upload (ใช้ TinyPNG, Squoosh)
- ใช้ format: **WebP** หรือ **JPEG** (เพื่อความเร็ว)
- ชื่อไฟล์ควรเป็นภาษาอังกฤษ ไม่มีช่องว่าง

---

## 🚀 **ตัวอย่างการใช้งานแบบครบวงจร**

### **1. Upload รูป:**
```bash
curl -X POST http://localhost:8080/api/images/upload \
  -F "file=@camping.jpg"
```

**Response:**
```json
{
  "imageUrl": "/images/events/abc123.jpg"
}
```

### **2. สร้าง Event พร้อมรูป:**
```bash
curl -X POST http://localhost:8080/api/events \
  -H "Content-Type: application/json" \
  -d '{
    "title": "ค่ายอาสา",
    "imageUrl": "/images/events/abc123.jpg",
    ...
  }'
```

### **3. ดึงข้อมูล Event Cards:**
```bash
curl http://localhost:8080/api/events/cards
```

**Response:**
```json
[
  {
    "id": 1,
    "title": "ค่ายอาสา",
    "imageUrl": "/images/events/abc123.jpg",
    ...
  }
]
```

### **4. แสดงรูปใน Frontend:**
```html
<img src="http://localhost:8080/images/events/abc123.jpg" />
```

---

## 🎯 **สรุป**

| วิธี | ความยาก | เหมาะกับ | แนะนำ |
|------|---------|---------|-------|
| วางรูปโดยตรง | ⭐ | Testing, Development | ✅ เริ่มต้น |
| Upload API | ⭐⭐ | Development, Production | ✅ แนะนำ |
| Frontend Upload | ⭐⭐⭐ | Production | ✅ สำหรับ users |

---

## 📌 **ปัญหาที่อาจเจอ**

### ❌ **404 Not Found**
- ตรวจสอบว่า path ถูกต้อง: `/images/events/filename.jpg`
- ตรวจสอบว่าไฟล์อยู่ใน `static/images/events/`

### ❌ **File too large**
- ลดขนาดไฟล์ให้เหลือต่ำกว่า 10 MB
- หรือเพิ่มค่า `spring.servlet.multipart.max-file-size` ใน application.properties

### ❌ **Image not showing in Frontend**
- ตรวจสอบ CORS settings
- ตรวจสอบ BASE_URL ถูกต้อง
- เปิด DevTools → Network tab เพื่อดู error

---

✅ **เสร็จแล้ว! ระบบ Upload รูปภาพพร้อมใช้งาน** 🎉
