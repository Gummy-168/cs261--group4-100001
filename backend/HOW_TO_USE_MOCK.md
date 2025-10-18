# 📖 คู่มือใช้งาน Mock และ API จริง

---

## 🎯 ภาพรวม

| โหมด | คำสั่งรัน | ต้อง API Key? |
|------|----------|---------------|
| **🟢 Mock (ทดสอบ)** | `mvnw spring-boot:run -Dspring-boot.run.profiles=test` | ❌ |
| **🔵 API จริง** | `mvnw spring-boot:run` | ✅ |

---

## 🟢 Mock Mode (ทดสอบ)

### รันผ่าน Command Line:
```bash
cd backend
mvnw spring-boot:run -Dspring-boot.run.profiles=test
```

### รันผ่าน IntelliJ:
1. Run → Edit Configurations (เลือก Spring Boot)
2. Active profiles: ใส่ `test`
3. Run

### ทดสอบ:
- Username/Password: **อะไรก็ได้** (ไม่ว่างเปล่า)
- ✅ Login สำเร็จทุกครั้ง
- Console แสดง: `🧪 Using MOCK TuAuthService`

---

## 🔵 API จริง (Production)

### ตั้งค่า API Key ก่อนรัน:

**Windows CMD:**
```cmd
set TU_API_KEY=your_api_key_here
mvnw spring-boot:run
```

**Windows PowerShell:**
```powershell
$env:TU_API_KEY="your_api_key_here"
mvnw spring-boot:run
```

**Mac/Linux:**
```bash
export TU_API_KEY=your_api_key_here
mvnw spring-boot:run
```

### หรือตั้งผ่าน IntelliJ:
1. Run → Edit Configurations
2. Active profiles: **ว่างเปล่า**
3. Environment variables: เพิ่ม `TU_API_KEY=your_key`
4. Run

### ทดสอบ:
- Username/Password: **ต้องเป็นของจริง**
- ✅/❌ ขึ้นกับข้อมูลถูกต้องหรือไม่
- Console **ไม่แสดง** mock message

---

## 🔄 สลับโหมด

**Mock → API จริง:**
- ลบ `-Dspring-boot.run.profiles=test` ออก
- ใส่ API Key

**API จริง → Mock:**
- เพิ่ม `-Dspring-boot.run.profiles=test`
- ไม่ต้อง API Key

---

## 📋 Script สำเร็จรูป

ดูในโฟลเดอร์ `backend/`:
- `run-mock.bat` - สำหรับรัน Mock Mode
- `run-production.bat` - สำหรับรัน Production Mode

---

## ❓ FAQ

**Q: จะรู้ได้ยังไงว่ากำลังใช้ Mock?**  
A: ดู Console ถ้ามี `🧪 Using MOCK TuAuthService` คือใช้ Mock

**Q: ต้องแก้โค้ดตอนสลับโหมดไหม?**  
A: ไม่ต้อง แค่เปลี่ยนคำสั่งรันเท่านั้น

**Q: ถ้าลืมใส่ API Key?**  
A: Error: `Could not resolve placeholder 'TU_API_KEY'`  
แก้: ใส่ API Key หรือใช้ Mock แทน
