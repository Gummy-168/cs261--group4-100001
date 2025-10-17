# 🚀 คู่มือการทดสอบ Backend (ฉบับรวม U2, U3, U4, U7)

เอกสารนี้ใช้อธิบายขั้นตอนการทดสอบ API ทั้งหมดของโปรเจกต์หลังจากรวมฟีเจอร์ Event Browsing (U2), Notification (U3), Search (U4), และ Favorite (U7) เข้าด้วยกัน

-----

### ⚙️ 1. การเตรียมตัวก่อนเริ่มทดสอบ (Prerequisites)

ตรวจสอบให้แน่ใจว่าคุณได้ติดตั้งและเปิดใช้งานโปรแกรมเหล่านี้แล้ว:

* **Docker Desktop:** ต้องรัน Container ของ SQL Server อยู่
* **IntelliJ IDEA (หรือ IDE ที่ใช้):** สำหรับรัน Spring Boot Application
* **Postman:** สำหรับยิง API Request
* **SQL Server Management Studio (SSMS) (หรือโปรแกรมจัดการ Database อื่นๆ):** สำหรับตรวจสอบข้อมูลในตารางโดยตรง

-----

### ✅ 2. ขั้นตอนการตั้งค่า (Setup)

1.  **Start Docker Container:**

    * เปิด Docker Desktop และตรวจสอบว่า Container ของ SQL Server (`sqlserver`) กำลังทำงานอยู่.

2.  **ตั้งค่า `application.properties`:**

    * เปิดไฟล์ `backend/src/main/resources/application.properties`.
    * **สำคัญมาก:** เลื่อนไปที่ส่วน `Email Sender Configuration` และกรอกข้อมูล `spring.mail.username` และ `spring.mail.password` ให้ถูกต้อง (ต้องใช้ App Password ของ Gmail) มิฉะนั้นระบบ Notification (U3) จะทำงานไม่ได้.
      ```properties
      # Email Sender Configuration
      spring.mail.host=smtp.gmail.com
      spring.mail.port=587
      spring.mail.username=youremail@gmail.com # 👈 ใส่อีเมล Gmail ของคุณ
      spring.mail.password=YOUR_APP_PASSWORD    # 👈 ใส่ App Password ที่สร้างจาก Google Account
      spring.mail.properties.mail.smtp.auth=true
      spring.mail.properties.mail.smtp.starttls.enable=true
      ```

3.  **Run Backend Application:**

    * เปิดโปรเจกต์ใน IntelliJ.
    * ไปที่ไฟล์ `ProjectCs261Application.java` แล้วกดปุ่ม ▶️ **Run**.
    * รอจนใน Console แสดงข้อความ `Tomcat started on port(s): 8080`

-----

### 🧪 3. เริ่มการทดสอบตาม User Story

#### **U2: Event Browsing - ทดสอบการแสดงผลกิจกรรม**

**🎯 เป้าหมาย:** ตรวจสอบว่าระบบสามารถดึงรายการกิจกรรมและการ์ดรายละเอียดได้ถูกต้องตาม Requirement.

* **TC-1: ดึงรายการกิจกรรมทั้งหมด (Event List)**

    1.  **Tool:** Postman
    2.  **Action:** ส่ง `GET` request ไปที่ `http://localhost:8080/api/events`
    3.  **Expected Result:**
        * ได้ Status Code `200 OK`.
        * ใน Body ต้องเป็น JSON Array ของกิจกรรมทั้งหมดในรูปแบบ `EventCardResponse` (มี `id`, `title`, `startAt`, `category` ฯลฯ).
        * รายการต้องเรียงตาม `startAt` จากเก่าไปใหม่.

* **TC-2: ดึงรายละเอียดกิจกรรม (Event Detail)**

    1.  **Tool:** Postman
    2.  **Action:** ส่ง `GET` request ไปที่ `http://localhost:8080/api/events/{id}` (แทนที่ `{id}` ด้วย `id` ของกิจกรรมที่มีอยู่จริง เช่น `1`)
    3.  **Expected Result:**
        * ได้ Status Code `200 OK`.
        * ใน Body ต้องเป็น JSON Object ของกิจกรรมนั้นๆ ในรูปแบบ `EventDetailResponse` (มี `description`, `capacity`, `remaining`, `organizerName` ฯลฯ ครบถ้วน).

* **TC-3: ดึงกิจกรรมที่ไม่มีอยู่จริง**

    1.  **Tool:** Postman
    2.  **Action:** ส่ง `GET` request ไปที่ `http://localhost:8080/api/events/999`
    3.  **Expected Result:**
        * ได้ Status Code `404 Not Found`.

#### **U4: Search - ทดสอบการค้นหาและกรอง**

**🎯 เป้าหมาย:** ตรวจสอบว่า Endpoint `/search` สามารถกรองข้อมูลตามเงื่อนไขต่างๆ ได้ถูกต้อง.

* **TC-1: ค้นหาด้วยคำค้น (Keyword)**

    1.  **Tool:** Postman
    2.  **Action:** ส่ง `GET` request ไปที่ `http://localhost:8080/api/events/search?keyword=Workshop`
    3.  **Expected Result:**
        * `200 OK` และแสดงเฉพาะกิจกรรมที่มีคำว่า "Workshop" ใน `title` หรือ `description`.

* **TC-2: ค้นหาด้วยหลายเงื่อนไข (Multiple Filters)**

    1.  **Tool:** Postman
    2.  **Action:** ส่ง `GET` request ไปที่ `http://localhost:8080/api/events/search?category=วิชาการ&location=ตึก SC`
    3.  **Expected Result:**
        * `200 OK` และแสดงเฉพาะกิจกรรมที่เป็นหมวด "วิชาการ" **และ** จัดที่ "ตึก SC".

* **TC-3: ค้นหาตามช่วงเวลา (Date Range)**

    1.  **Tool:** Postman
    2.  **Action:** ส่ง `GET` request ไปที่ `http://localhost:8080/api/events/search?startDate=2025-10-20&endDate=2025-10-25`
    3.  **Expected Result:**
        * `200 OK` และแสดงเฉพาะกิจกรรมที่จัดขึ้นระหว่างวันที่ 20 ถึง 25 ตุลาคม 2025.

#### **U7 & U3: Favorite & Notification - ทดสอบการทำงานร่วมกัน**

**🎯 เป้าหมาย:** ทดสอบ Flow การกด Favorite, การสร้าง Notification Queue, และการส่ง Email แจ้งเตือน.

* **TC-1: กด Favorite และตรวจสอบการสร้าง Queue**

    1.  **Tool:** Postman และ SSMS
    2.  **Action (Postman):** ส่ง `POST` request ไปที่ `http://localhost:8080/api/favorites`
        * **Body (JSON):**
          ```json
          {
              "userId": 1,
              "activityId": 1 
          }
          ```
    3.  **Expected Result (SSMS):**
        * เปิดตาราง `favorites` ต้องมีแถวใหม่ (`userId=1`, `activityId=1`).
        * **สำคัญ:** เปิดตาราง `notification_queue` ต้องมีแถวใหม่เกิดขึ้นสำหรับ `userId=1` และ `activityId=1` โดยมี `status` เป็น `"PENDING"`.

* **TC-2: ทดสอบการแจ้งเตือนเมื่อ Event ถูกแก้ไข (Real-time)**

    1.  **Tool:** Postman และ **Email Client**
    2.  **Action (Postman):** ส่ง `PUT` request ไปที่ `http://localhost:8080/api/events/1` (Event ที่เพิ่งกด Favorite ไป)
        * **Body (JSON):**
          ```json
          {
              "location": "ตึก SC-3 ห้อง 301 (ย้ายห้อง)"
          }
          ```
    3.  **Expected Result (Email):**
        * **ทันที\!** คุณต้องได้รับ Email แจ้งเตือนว่ากิจกรรมมีการเปลี่ยนแปลง.

* **TC-3: ทดสอบการแจ้งเตือนล่วงหน้า (Scheduled)**

    1.  **Tool:** SSMS, IntelliJ, **Email Client**
    2.  **Action (SSMS):** "โกงเวลา" โดยอัปเดต `send_at` ของรายการใน `notification_queue` ให้เป็นเวลาในอดีต
        ```sql
        UPDATE notification_queue SET send_at = '2025-10-16T10:00:00' WHERE userId = 1;
        ```
    3.  **Action (IntelliJ):** แก้ไข `NotificationService.java` **ชั่วคราว** เพื่อให้ Scheduler ทำงานทันที
        * เปลี่ยน `@Scheduled(cron = "59 59 23 * * ?")` เป็น `@Scheduled(fixedRate = 10000)`
        * Restart โปรเจกต์ และรอประมาณ 10-15 วินาที
    4.  **Expected Result:**
        * **Email:** คุณต้องได้รับ Email แจ้งเตือนกิจกรรมล่วงหน้า.
        * **SSMS:** `status` ใน `notification_queue` ต้องเปลี่ยนเป็น `"SENT"`.
        * **อย่าลืม\!** แก้ `@Scheduled` กลับเป็น `cron` เหมือนเดิมก่อนจบการทดสอบ

* **TC-4: ยกเลิก Favorite และตรวจสอบการลบ Queue**

    1.  **Tool:** Postman และ SSMS
    2.  **Action (Postman):** ส่ง `DELETE` request ไปที่ `http://localhost:8080/api/favorites`
        * **Body (JSON):**
          ```json
          {
              "userId": 1,
              "activityId": 1
          }
          ```
    3.  **Expected Result (SSMS):**
        * แถวข้อมูลในตาราง `favorites` ต้อง **ถูกลบ**
        * แถวข้อมูลในตาราง `notification_queue` ก็ต้อง **ถูกลบไปด้วย**.

-----

ถ้าการทดสอบทั้งหมดนี้ผ่าน ✅ ก็หมายความว่าระบบ Backend ที่รวมกันแล้วทำงานได้อย่างถูกต้องและสมบูรณ์ตาม Requirement ทั้งหมดครับ\!