# 🎯 สรุปการตรวจสอบและแก้ไขปัญหา

## 🔴 ปัญหาที่พบ

### Error จาก Console
```
Error 400: could not execute statement [Invalid column name 'eventId'] 
[insert into dbo.notification_queue (eventId,sendat,status,userid) values (?,?,?,?)]
```

### สาเหตุหลัก
**ตาราง `notification_queue` ยังไม่ถูกสร้างในฐานข้อมูล** แต่โค้ด Java พยายามเขียนข้อมูลลงไป

---

## ✅ ผลการตรวจสอบ

### 1. โค้ด Backend (Java) ✅ ถูกต้อง
- `NotificationQueue.java` - ใช้ชื่อ column `eventId`, `userId`, `sendAt`, `status`
- `FavoriteService.java` - Logic การสร้าง notification ถูกต้อง
- `Favorite.java` - ใช้ `eventId` แล้ว (เปลี่ยนจาก activityId)

### 2. Database Schema ❌ ยังไม่มีตาราง
- ไม่พบไฟล์ SQL สำหรับสร้างตาราง `notification_queue`
- ตาราง `notification_queue` ยังไม่ได้ถูกรันในฐานข้อมูล

---

## 🛠️ ไฟล์ที่สร้างขึ้นเพื่อแก้ไข

### 1. `create_notification_queue_table.sql` ✅ สร้างใหม่
**ตำแหน่ง:** `backend/src/main/resources/sql/create_notification_queue_table.sql`

**คำอธิบาย:** สคริปต์สำหรับสร้างตาราง notification_queue เท่านั้น

**โครงสร้างตาราง:**
```sql
CREATE TABLE dbo.notification_queue (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    user_id BIGINT NOT NULL,                    
    event_id BIGINT NOT NULL,                   
    send_at DATETIME2 NOT NULL,                 
    status NVARCHAR(20) NOT NULL DEFAULT 'PENDING',
    created_at DATETIME2 DEFAULT GETDATE(),     
    updated_at DATETIME2 DEFAULT GETDATE(),
    
    CONSTRAINT FK_notification_queue_user FOREIGN KEY (user_id) 
        REFERENCES dbo.users(id) ON DELETE CASCADE,
    CONSTRAINT FK_notification_queue_event FOREIGN KEY (event_id) 
        REFERENCES dbo.events(id) ON DELETE CASCADE
);
```

### 2. `setup_all_tables.sql` 🔄 อัปเดต
**ตำแหน่ง:** `backend/src/main/resources/sql/setup_all_tables.sql`

**การเปลี่ยนแปลง:**
- เพิ่มส่วนสร้างตาราง `notification_queue`
- อัปเดตลำดับการลบตาราง (เพื่อหลีกเลี่ยง Foreign Key error)

### 3. `NOTIFICATION_QUEUE_FIX.md` ✅ สร้างใหม่
**ตำแหน่ง:** `backend/NOTIFICATION_QUEUE_FIX.md`

**คำอธิบาย:** คู่มือแก้ไขปัญหาแบบละเอียด พร้อมขั้นตอนและตัวอย่างคำสั่ง SQL

---

## 🚀 ขั้นตอนการแก้ไข

### Option 1: สร้างเฉพาะตาราง notification_queue (แนะนำ)

1. **เปิด SQL Server Management Studio**
2. **Connect ไปที่ฐานข้อมูล EventDB**
3. **รันไฟล์:**
   ```
   backend/src/main/resources/sql/create_notification_queue_table.sql
   ```

### Option 2: สร้างตารางทั้งหมดใหม่ (จะลบข้อมูลเดิม)

1. **เปิด SQL Server Management Studio**
2. **Connect ไปที่ฐานข้อมูล EventDB**
3. **รันไฟล์:**
   ```
   backend/src/main/resources/sql/setup_all_tables.sql
   ```

### ขั้นตอนหลังรัน SQL

4. **ตรวจสอบตาราง:**
   ```sql
   USE EventDB;
   SELECT name FROM sys.tables WHERE name = 'notification_queue';
   ```

5. **Restart Backend:**
   ```bash
   cd backend
   mvn spring-boot:run
   ```

6. **ทดสอบ:**
   - Login เข้าระบบ
   - กดปุ่มบันทึกกิจกรรมที่สนใจ (หัวใจ)
   - ตรวจสอบว่าไม่มี error 400

---

## 📊 ความสัมพันธ์ของตาราง

```
┌─────────────┐         ┌───────────────────────┐         ┌─────────────┐
│   users     │         │ notification_queue    │         │   events    │
│             │◄────────│                       │────────►│             │
│ id (PK)     │ user_id │ id (PK)               │event_id │ id (PK)     │
│ username    │         │ user_id (FK)          │         │ title       │
│ email       │         │ event_id (FK)         │         │ startTime   │
│ ...         │         │ send_at               │         │ endTime     │
└─────────────┘         │ status                │         │ ...         │
                        │ created_at            │         └─────────────┘
                        │ updated_at            │
      ▲                 └───────────────────────┘                 ▲
      │                                                            │
      │                 ┌───────────────────────┐                 │
      │                 │      favorites        │                 │
      └─────────────────│                       │─────────────────┘
              user_id   │ id (PK)               │ event_id
                        │ user_id (FK)          │
                        │ event_id (FK)         │
                        └───────────────────────┘
```

---

## 🔄 Flow การทำงาน

### 1. เมื่อ User กดบันทึกกิจกรรม
```
User กด "บันทึก" (หัวใจ)
    ↓
Frontend ส่ง POST /api/favorites
    ↓
Backend: FavoriteService.addFavorite()
    ↓
1. สร้าง Favorite record ใน favorites table
2. ดึงข้อมูล Event มาเช็ค startTime
3. สร้าง NotificationQueue record:
   - user_id = userId
   - event_id = eventId
   - send_at = event.startTime - 1 วัน
   - status = "PENDING"
    ↓
บันทึกลงฐานข้อมูลสำเร็จ ✅
```

### 2. เมื่อ User ยกเลิกการบันทึก
```
User กด "ยกเลิก" (หัวใจเต็ม)
    ↓
Frontend ส่ง DELETE /api/favorites/{userId}/{eventId}
    ↓
Backend: FavoriteService.removeFavorite()
    ↓
1. ลบ NotificationQueue record
2. ลบ Favorite record
    ↓
ลบสำเร็จ ✅
```

---

## 🗂️ โครงสร้าง Column ในแต่ละตาราง

### notification_queue
| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | BIGINT | NO | AUTO | Primary Key |
| user_id | BIGINT | NO | - | FK to users.id |
| event_id | BIGINT | NO | - | FK to events.id |
| send_at | DATETIME2 | NO | - | เวลาที่จะส่งแจ้งเตือน |
| status | NVARCHAR(20) | NO | PENDING | PENDING/SENT/FAILED |
| created_at | DATETIME2 | YES | GETDATE() | วันที่สร้างระเบียน |
| updated_at | DATETIME2 | YES | GETDATE() | วันที่อัปเดตล่าสุด |

### favorites
| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| id | BIGINT | NO | Primary Key |
| user_id | BIGINT | NO | FK to users.id |
| event_id | BIGINT | NO | FK to events.id |

### Unique Constraint
- `favorites`: (user_id, event_id) - ป้องกันการบันทึกซ้ำ

---

## ⚠️ หมายเหตุสำคัญ

### 1. Foreign Key Constraints
- ตารางนี้ต้องการตาราง `users` และ `events` อยู่ก่อน
- ถ้าลบ user → notifications ของ user นั้นจะถูกลบด้วย (CASCADE)
- ถ้าลบ event → notifications ของ event นั้นจะถูกลบด้วย (CASCADE)

### 2. Status Values
| Status | Description |
|--------|-------------|
| PENDING | รอส่งการแจ้งเตือน |
| SENT | ส่งแจ้งเตือนแล้ว |
| FAILED | ส่งไม่สำเร็จ |

### 3. send_at Calculation
- คำนวณอัตโนมัติ = `event.startTime - 1 วัน`
- ตัวอย่าง: กิจกรรมเริ่ม 25 ต.ค. 2025 10:00 → send_at = 24 ต.ค. 2025 10:00

---

## 🐛 การแก้ปัญหาเพิ่มเติม

### Error: Cannot create foreign key constraint
```
สาเหตุ: ไม่มีตาราง users หรือ events
แก้ไข: สร้างตารางเหล่านี้ก่อน
```

### Error: Cannot insert NULL into column
```
สาเหตุ: ข้อมูล user_id, event_id, หรือ send_at เป็น NULL
แก้ไข: ตรวจสอบโค้ด Java ใน FavoriteService
```

### Error: Violation of UNIQUE KEY constraint
```
สาเหตุ: พยายามบันทึกกิจกรรมที่เคยบันทึกแล้ว
แก้ไข: ตรวจสอบ favoriteRepository.existsByUserIdAndEventId()
```

---

## 📝 คำสั่ง SQL ที่มีประโยชน์

### ดูข้อมูลทั้งหมด
```sql
SELECT * FROM dbo.notification_queue;
```

### ดู notifications ที่รอส่ง
```sql
SELECT 
    nq.id,
    u.username,
    e.title,
    nq.send_at,
    nq.status
FROM dbo.notification_queue nq
JOIN dbo.users u ON nq.user_id = u.id
JOIN dbo.events e ON nq.event_id = e.id
WHERE nq.status = 'PENDING'
ORDER BY nq.send_at;
```

### นับจำนวน notifications แต่ละ user
```sql
SELECT 
    u.username,
    u.displayname_th,
    COUNT(*) as notification_count
FROM dbo.notification_queue nq
JOIN dbo.users u ON nq.user_id = u.id
GROUP BY u.username, u.displayname_th
ORDER BY notification_count DESC;
```

### ลบ notifications ที่ส่งแล้ว
```sql
DELETE FROM dbo.notification_queue WHERE status = 'SENT';
```

### อัปเดต status
```sql
UPDATE dbo.notification_queue 
SET status = 'SENT' 
WHERE id = 1;
```

---

## ✅ Checklist หลังแก้ไข

- [ ] รันไฟล์ SQL สร้างตาราง notification_queue
- [ ] ตรวจสอบว่าตารางถูกสร้างแล้ว (`SELECT * FROM sys.tables WHERE name = 'notification_queue'`)
- [ ] ตรวจสอบ Foreign Keys ถูกสร้างแล้ว
- [ ] Restart Backend Spring Boot
- [ ] ทดสอบบันทึกกิจกรรมที่สนใจ (ไม่มี error 400)
- [ ] ทดสอบยกเลิกการบันทึก (ทำงานได้)
- [ ] ตรวจสอบข้อมูลใน notification_queue table

---

## 📚 เอกสารเพิ่มเติม

### ไฟล์ที่เกี่ยวข้อง
```
backend/
├── src/main/java/com/example/project_CS261/
│   ├── model/
│   │   ├── NotificationQueue.java      ← Entity class
│   │   ├── Favorite.java               ← Entity class
│   │   └── Event.java                  ← Entity class
│   ├── repository/
│   │   ├── NotificationQueueRepository.java
│   │   └── FavoriteRepository.java
│   └── service/
│       └── FavoriteService.java        ← Business logic
└── src/main/resources/sql/
    ├── create_notification_queue_table.sql  ← รันไฟล์นี้!
    ├── setup_all_tables.sql                 ← หรือไฟล์นี้
    └── NOTIFICATION_QUEUE_FIX.md            ← คู่มือแก้ไข
```

### API Endpoints
```
POST   /api/favorites           - บันทึกกิจกรรมที่สนใจ
GET    /api/favorites/{userId}  - ดูกิจกรรมที่บันทึกไว้
DELETE /api/favorites/{userId}/{eventId} - ยกเลิกการบันทึก
GET    /api/favorites/{userId}/{eventId}/status - เช็คว่าบันทึกแล้วหรือยัง
```

---

## 🎉 สรุป

ปัญหาเกิดจาก **ตาราง notification_queue ยังไม่ถูกสร้าง** ในฐานข้อมูล

### แก้ไขโดย:
1. สร้างไฟล์ SQL สำหรับสร้างตาราง
2. รันไฟล์ SQL ในฐานข้อมูล
3. Restart Backend
4. ทดสอบการทำงาน

### ผลลัพธ์ที่คาดหวัง:
✅ สามารถบันทึกกิจกรรมที่สนใจได้  
✅ สามารถยกเลิกการบันทึกได้  
✅ Notification ถูกสร้างอัตโนมัติ  
✅ ไม่มี error 400

---

**หากยังพบปัญหา กรุณาส่ง:**
1. Error message จาก Browser Console (F12)
2. Error log จาก Backend
3. Screenshot หน้าจอที่เกิดปัญหา
