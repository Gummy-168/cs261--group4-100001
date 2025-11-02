# 📁 Event Images Folder

วางรูปภาพกิจกรรมที่นี่

## วิธีใช้งาน:

1. วางรูปภาพลงใน folder นี้
2. ใช้ชื่อไฟล์ที่เข้าใจง่าย เช่น:
   - camping.jpg
   - football.jpg
   - workshop.jpg

3. ใน Database ใส่ path เป็น:
   ```
   /images/events/camping.jpg
   ```

## หรือใช้ Upload API:

```bash
POST http://localhost:8080/api/images/upload
Content-Type: multipart/form-data
file: [your-image-file]
```
