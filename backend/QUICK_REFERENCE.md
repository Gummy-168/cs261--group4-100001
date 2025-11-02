# 🚀 Quick Reference - Updated Project

## 🔑 API Endpoints

### **Authentication**
```
POST   /api/auth/login      - Login (Public)
GET    /api/auth/validate   - Validate Token (Auth Required)
```

### **Events**
```
GET    /api/events/cards                - Get all events (Public)
GET    /api/events/cards/user/{userId}  - Get events with favorites (Auth)
GET    /api/events/{id}                 - Get event by ID (Public)
POST   /api/events                      - Create event (Auth)
PUT    /api/events/{id}                 - Update event (Auth)
DELETE /api/events/{id}                 - Delete event (Auth)
```

### **Favorites**
```
POST   /api/favorites       - Add favorite (Auth)
GET    /api/favorites/{userId}  - Get user favorites (Auth)
DELETE /api/favorites       - Remove favorite (Auth)
```

---

## 🔐 JWT Token Usage

### **Login Request**
```json
POST /api/auth/login
{
  "username": "6709616848",
  "password": "your-password"
}
```

### **Login Response**
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

### **Using Token**
```http
GET /api/events
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## 💻 Frontend Integration

### **Login**
```javascript
import { login } from './services/authService';

const handleLogin = async (username, password, remember) => {
  try {
    const response = await login(username, password, remember);
    // Token automatically stored
    console.log('Login successful:', response);
  } catch (error) {
    console.error('Login failed:', error.message);
  }
};
```

### **API Calls**
```javascript
import axiosInstance from './lib/axiosInstance';

// Token is automatically attached!
const events = await axiosInstance.get('/events');
const event = await axiosInstance.get(`/events/${id}`);
```

### **Check Authentication**
```javascript
import { isAuthenticated, getAuthToken } from './services/authService';

if (isAuthenticated()) {
  const token = getAuthToken();
  console.log('User is authenticated');
}
```

---

## 🗄️ Database Changes

### **Favorites Table**
```sql
-- OLD
activityId BIGINT

-- NEW
eventId BIGINT
```

### **Migration**
```sql
EXEC sp_rename 'dbo.favorites.activityId', 'eventId', 'COLUMN';
```

---

## ⚙️ Environment Variables

### **Backend (.env)**
```env
DB_URL=jdbc:sqlserver://localhost:1433;databaseName=EventDB
DB_USERNAME=sa
DB_PASSWORD=YourStrong!Passw0rd
JWT_SECRET=your-secure-secret-key
JWT_EXPIRATION=86400000
TU_API_KEY=your-tu-api-key
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=your-app-password
```

### **Frontend (.env)**
```env
VITE_API_BASE_URL=http://localhost:8080/api
```

---

## 🧪 Testing Commands

### **Backend**
```bash
# Run
mvn spring-boot:run

# Test
mvn test

# Build
mvn clean package
```

### **Frontend**
```bash
# Run
npm run dev

# Build
npm run build

# Preview
npm run preview
```

---

## 📊 Swagger UI

**URL:** `http://localhost:8080/swagger-ui.html`

**API Docs:** `http://localhost:8080/v3/api-docs`

---

## 🐛 Common Errors

### **401 Unauthorized**
```
Cause: Token expired or invalid
Solution: Login again to refresh token
```

### **CORS Error**
```
Cause: Frontend origin not allowed
Solution: Add origin to SecurityConfig.java
```

### **Column 'activityId' not found**
```
Cause: Database not migrated
Solution: Run SQL migration script
```

---

## 📱 Quick Start

### **1. Backend**
```bash
cd backend
mvn clean install
mvn spring-boot:run
```

### **2. Frontend**
```bash
cd frontend
npm install
npm run dev
```

### **3. Test**
```
1. Open: http://localhost:5173/login
2. Login with TU credentials
3. Check console for JWT token
4. Browse events
```

---

## 🔗 Useful Links

- Backend: `http://localhost:8080`
- Frontend: `http://localhost:5173`
- Swagger: `http://localhost:8080/swagger-ui.html`
- API Docs: `http://localhost:8080/v3/api-docs`

---

**เก็บไฟล์นี้ไว้เพื่อการอ้างอิงด่วน! 📌**
