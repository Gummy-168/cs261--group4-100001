# 📘 คู่มือการอัปเดต Event System สำหรับ Frontend Cards

## 🎯 สิ่งที่เพิ่มมา

### 1. **ข้อมูลใหม่ใน Event Model**
เพิ่มฟิลด์ต่อไปนี้เพื่อรองรับการแสดงผลใน Card:

| ฟิลด์ | ประเภท | คำอธิบาย |
|------|--------|----------|
| `imageUrl` | String | URL หรือ path ของรูปภาพกิจกรรม |
| `category` | String | หมวดหมู่ (กีฬา, ศิลปะ, วิชาการ, ฯลฯ) |
| `maxCapacity` | Integer | จำนวนผู้เข้าร่วมสูงสุด |
| `currentParticipants` | Integer | จำนวนผู้ที่ลงทะเบียนแล้ว |
| `status` | String | สถานะ (OPEN, FULL, CLOSED, CANCELLED) |
| `organizer` | String | ชื่อผู้จัด/หน่วยงาน |
| `fee` | Double | ค่าใช้จ่าย (0 = ฟรี) |
| `tags` | String | Tags สำหรับค้นหา |

### 2. **EventCardDTO**
DTO สำหรับส่งข้อมูลไปยัง Frontend รวมข้อมูลที่คำนวณแล้ว:

```json
{
  "id": 1,
  "title": "ค่ายอาสา Asa Camping 4 วัน 3 คืน",
  "description": "...",
  "location": "กาญจนบุรี",
  "startTime": "2025-10-07T08:00:00",
  "endTime": "2025-10-10T17:00:00",
  "imageUrl": "/images/events/camping.jpg",
  "category": "กิจกรรมพิเศษ",
  "maxCapacity": 50,
  "currentParticipants": 23,
  "status": "OPEN",
  "organizer": "ชมรมอาสา",
  "fee": 0.0,
  "tags": "ค่ายอาสา,camping,กาญจนบุรี",
  "isFull": false,
  "availableSeats": 27,
  "isFavorited": false
}
```

---

## 🔌 API Endpoints ใหม่

### 1. **GET /api/events/cards**
ดึงข้อมูล Events ทั้งหมดในรูปแบบ Card (ไม่เช็ค favorite)

**Request:**
```
GET http://localhost:8080/api/events/cards
```

**Response:**
```json
[
  {
    "id": 1,
    "title": "ค่ายอาสา...",
    "imageUrl": "/images/events/camping.jpg",
    "category": "กิจกรรมพิเศษ",
    "maxCapacity": 50,
    "currentParticipants": 23,
    "isFull": false,
    "availableSeats": 27,
    "isFavorited": false,
    ...
  }
]
```

### 2. **GET /api/events/cards/user/{userId}**
ดึงข้อมูล Events พร้อมเช็คว่า user favorite หรือยัง

**Request:**
```
GET http://localhost:8080/api/events/cards/user/1
```

**Response:**
```json
[
  {
    "id": 1,
    "title": "ค่ายอาสา...",
    "isFavorited": true,  // ✅ เช็คจาก Favorites table
    ...
  },
  {
    "id": 2,
    "title": "กิจกรรมอื่น...",
    "isFavorited": false,
    ...
  }
]
```

---

## 📝 ขั้นตอนการติดตั้ง

### 1. **อัปเดต Database**
รัน SQL Script:
```bash
# ไฟล์: src/main/resources/sql/update_events_table.sql
```

เปิด SQL Server Management Studio และรัน:
```sql
USE EventDB;
GO

-- เพิ่มคอลัมน์ใหม่
ALTER TABLE dbo.Events
ADD 
    imageUrl NVARCHAR(500) NULL,
    category NVARCHAR(100) NULL,
    maxCapacity INT NULL,
    currentParticipants INT DEFAULT 0,
    status NVARCHAR(20) DEFAULT 'OPEN',
    organizer NVARCHAR(255) NULL,
    fee FLOAT DEFAULT 0.0,
    tags NVARCHAR(500) NULL;
GO
```

### 2. **Restart Backend**
```bash
mvn spring-boot:run
```

---

## 💻 ตัวอย่างการใช้งานใน Frontend

### React Example:

```javascript
// ดึงข้อมูล Events สำหรับแสดงใน Cards
useEffect(() => {
  const fetchEvents = async () => {
    try {
      // ถ้าไม่มี userId ใช้ /cards
      const response = await fetch('http://localhost:8080/api/events/cards');
      
      // ถ้ามี userId ใช้ /cards/user/{userId}
      // const response = await fetch(`http://localhost:8080/api/events/cards/user/${userId}`);
      
      const data = await response.json();
      setEvents(data);
    } catch (error) {
      console.error('Error fetching events:', error);
    }
  };
  
  fetchEvents();
}, []);

// แสดงผลใน Card Component
{events.map(event => (
  <EventCard
    key={event.id}
    title={event.title}
    image={event.imageUrl}
    location={event.location}
    date={new Date(event.startTime).toLocaleDateString('th-TH')}
    category={event.category}
    capacity={`${event.currentParticipants}/${event.maxCapacity}`}
    status={event.status}
    isFavorited={event.isFavorited}
    isFull={event.isFull}
  />
))}
```

---

## 🎨 ตัวอย่างข้อมูลสำหรับทดสอบ

### เพิ่มข้อมูลทดสอบ:
```sql
INSERT INTO dbo.Events (title, description, location, startTime, endTime, imageUrl, category, maxCapacity, currentParticipants, status, organizer, fee, tags)
VALUES 
('ค่ายอาสา Asa Camping 4 วัน 3 คืน', 'กิจกรรมค่ายอาสาพัฒนาชุมชน', 'กาญจนบุรี (กาญจนบุรี)', '2025-10-07 08:00:00', '2025-10-10 17:00:00', '/images/camping.jpg', 'กิจกรรมพิเศษ', 50, 23, 'OPEN', 'ชมรมอาสา', 0, 'ค่ายอาสา,camping'),

('การแข่งขันฟุตบอล Inter-Faculty', 'การแข่งขันฟุตบอลระหว่างคณะ', 'สนามกีฬา มธ. รังสิต', '2025-10-15 09:00:00', '2025-10-15 18:00:00', '/images/football.jpg', 'กีฬา', 100, 87, 'OPEN', 'สโมสรนักศึกษา', 0, 'ฟุตบอล,กีฬา'),

('Workshop: Web Development', 'เรียนรู้การพัฒนาเว็บไซต์', 'ห้อง SC1-306', '2025-10-20 13:00:00', '2025-10-20 16:00:00', '/images/workshop.jpg', 'วิชาการ', 30, 30, 'FULL', 'คณะวิทยาศาสตร์', 100, 'workshop,programming');
```

---

## 🔍 การกรอง/ค้นหา Events

### Filter by Category:
```javascript
// ใน Frontend
const filteredEvents = events.filter(event => event.category === 'กีฬา');
```

### Filter by Status:
```javascript
const openEvents = events.filter(event => event.status === 'OPEN');
```

### Search by Tags:
```javascript
const searchEvents = events.filter(event => 
  event.tags?.toLowerCase().includes(searchQuery.toLowerCase())
);
```

---

## 📊 สถานะกิจกรรม (Status)

| Status | ความหมาย |
|--------|---------|
| `OPEN` | เปิดรับสมัคร |
| `FULL` | เต็มแล้ว |
| `CLOSED` | ปิดรับสมัคร |
| `CANCELLED` | ยกเลิก |

---

## 🎯 แนะนำเพิ่มเติม

1. **อัปโหลดรูปภาพ:** ใช้ Cloudinary หรือ AWS S3 สำหรับเก็บรูป
2. **Auto-update Status:** สร้าง Scheduler เช็ค capacity แล้วเปลี่ยน status เป็น FULL
3. **Real-time Updates:** ใช้ WebSocket สำหรับอัปเดต currentParticipants แบบ real-time

---

✅ **พร้อมใช้งานแล้ว!** ตอนนี้ Frontend สามารถดึงข้อมูลครบถ้วนสำหรับแสดงใน Card ได้แล้ว 🎉
