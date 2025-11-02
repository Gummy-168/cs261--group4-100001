# 📧 คู่มือตั้งค่า Email สำหรับส่งการแจ้งเตือน

## 🎯 ขั้นตอนการตั้งค่า Gmail

### 1. สร้าง App Password สำหรับ Gmail

เพื่อความปลอดภัย Gmail ไม่อนุญาตให้ใช้รหัสผ่านปกติสำหรับ applications ต้องสร้าง "App Password" แทน

**ขั้นตอน:**

1. ไปที่ Google Account: https://myaccount.google.com/
2. เลือก **Security** (ความปลอดภัย)
3. เปิด **2-Step Verification** (ถ้ายังไม่ได้เปิด)
4. หา **App passwords** (รหัสผ่านของแอป)
5. เลือก:
   - App: **Mail**
   - Device: **Windows Computer** (หรืออุปกรณ์ที่ใช้)
6. คลิก **Generate** (สร้าง)
7. คัดลอก **16 หลักรหัสผ่าน** ที่ได้

### 2. แก้ไข application.properties

เปิดไฟล์: `src/main/resources/application.properties`

```properties
# แก้ไขบรรทัดเหล่านี้
spring.mail.username=your-email@gmail.com          # ใส่อีเมลของคุณ
spring.mail.password=xxxx xxxx xxxx xxxx           # ใส่ App Password 16 หลัก
app.email.from=your-email@gmail.com                # ใส่อีเมลของคุณ
```

**ตัวอย่าง:**
```properties
spring.mail.username=somchai.dev@gmail.com
spring.mail.password=abcd efgh ijkl mnop
app.email.from=somchai.dev@gmail.com
```

### 3. ทดสอบการส่ง Email

เพิ่ม REST API สำหรับทดสอบ (ถ้าต้องการ):

```java
// เพิ่มใน NotificationController
@PostMapping("/test-email")
public ResponseEntity<String> testEmail(@RequestParam String to) {
    notificationService.sendEmail(
        to, 
        "Test Email from Event System", 
        "นี่คือ email ทดสอบจากระบบ"
    );
    return ResponseEntity.ok("Email sent to " + to);
}
```

ทดสอบผ่าน Postman:
```
POST http://localhost:8080/api/notifications/test-email?to=test@example.com
```

---

## ⚠️ หมายเหตุสำคัญ

### ข้อจำกัดของ Gmail:
- ส่งได้ **500 emails ต่อวัน** สำหรับ Gmail ฟรี
- ส่งได้ **2,000 emails ต่อวัน** สำหรับ Google Workspace

### Alternative Email Providers:
ถ้าต้องการส่ง email จำนวนมาก แนะนำใช้:
- **SendGrid** (ฟรี 100 emails/วัน)
- **Mailgun** (ฟรี 5,000 emails/เดือน)
- **Amazon SES** (จ่ายตามใช้งาน ราคาถูก)

---

## 🔧 Configuration สำหรับ Email Providers อื่น

### SendGrid
```properties
spring.mail.host=smtp.sendgrid.net
spring.mail.port=587
spring.mail.username=apikey
spring.mail.password=YOUR_SENDGRID_API_KEY
```

### Outlook/Hotmail
```properties
spring.mail.host=smtp-mail.outlook.com
spring.mail.port=587
spring.mail.username=your-email@outlook.com
spring.mail.password=your-password
```

### Yahoo Mail
```properties
spring.mail.host=smtp.mail.yahoo.com
spring.mail.port=587
spring.mail.username=your-email@yahoo.com
spring.mail.password=your-app-password
```

---

## 🐛 แก้ปัญหา

### ❌ Authentication Failed
- ตรวจสอบว่าเปิด 2-Step Verification แล้ว
- ตรวจสอบ App Password ถูกต้อง (ไม่มีเว้นวรรค)
- ลองสร้าง App Password ใหม่

### ❌ Connection Timeout
- ตรวจสอบ Firewall/Antivirus
- ตรวจสอบ internet connection
- ลองเปลี่ยน port เป็น 465 (SSL)

### ❌ Email ไม่ถึง
- ตรวจสอบ Spam/Junk folder
- ตรวจสอบว่า `app.email.from` ตรงกับ `spring.mail.username`
- ตรวจสอบ email address ของผู้รับถูกต้อง

---

## 📅 Scheduled Notification

ระบบจะส่งแจ้งเตือนอัตโนมัติที่:
- **เวลา: 23:59:59 ทุกวัน**
- แจ้งเตือนก่อนกิจกรรม **24 ชั่วโมง**

ถ้าต้องการเปลี่ยนเวลา แก้ไขใน `NotificationService.java`:
```java
@Scheduled(cron = "0 0 8 * * ?")  // เปลี่ยนเป็น 08:00:00 ทุกวัน
```

**Cron Expression:**
- `วินาที นาที ชั่วโมง วัน เดือน วันในสัปดาห์`
- ตัวอย่าง: `0 0 8 * * ?` = 08:00:00 ทุกวัน
- ตัวอย่าง: `0 30 9 * * ?` = 09:30:00 ทุกวัน

---

✅ **เสร็จแล้ว! Email System พร้อมใช้งาน** 🎉
