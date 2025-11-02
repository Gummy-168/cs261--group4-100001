# 📚 คู่มือการทำงานของระบบ - ทุกฟังก์ชันละเอียด

## 🎯 ภาพรวมระบบ

```
┌─────────────┐      ┌──────────────┐      ┌─────────────┐
│   Browser   │ ←──→ │   Backend    │ ←──→ │  Database   │
│  (React)    │      │ (Spring Boot)│      │ (SQL Server)│
└─────────────┘      └──────────────┘      └─────────────┘
      ↓                     ↓                      ↓
  JWT Token           Validate Token         Store Data
```

---

## 🔐 1. ระบบ Login (Authentication Flow)

### **📝 ขั้นตอนการทำงาน:**

```
Step 1: User กรอก Username & Password
   ↓
Step 2: กด "เข้าสู่ระบบ"
   ↓
Step 3: Frontend ส่ง request ไป Backend
   ↓
Step 4: Backend ตรวจสอบกับ TU API
   ↓
Step 5: TU API ยืนยันตัวตน
   ↓
Step 6: Backend สร้าง JWT Token
   ↓
Step 7: Backend บันทึก Login History
   ↓
Step 8: ส่ง Token + User Data กลับ Frontend
   ↓
Step 9: Frontend เก็บ Token
   ↓
Step 10: นำทางไปหน้าหลัก
```

### **💻 Code ละเอียด:**

#### **Frontend Part 1: Login.jsx**

```javascript
// ไฟล์: src/Page/Login.jsx
// หน้าที่: แสดงหน้า Login Form

const handleSubmit = async (event) => {
  event.preventDefault(); // ป้องกัน form reload หน้า
  setError(""); // ล้าง error เก่า
  setLoading(true); // แสดง loading

  try {
    // 1. เรียก authService.login()
    const data = await login(identifier, password, remember);
    
    if (data.status) { // ถ้า login สำเร็จ
      // 2. จัดการข้อมูล User
      const profile = {
        id: data.userId,
        username: data.username,
        displaynameTh: data.displaynameTh,
        email: data.email,
      };

      // 3. บันทึก auth state
      auth?.login?.({ 
        token: data.token,  // JWT Token จาก Backend
        profile, 
        remember, 
        userId: data.userId 
      });

      console.log('✅ Login successful!');
      
      // 4. นำทางไปหน้าหลัก
      setClosing(true);
      setTimeout(() => navigate("/"), 600);
    }
  } catch (err) {
    // แสดง error message
    setError(err?.message || "เกิดข้อผิดพลาด");
  } finally {
    setLoading(false); // ปิด loading
  }
};
```

**อธิบาย:**
1. User กดปุ่ม → เรียก `handleSubmit`
2. เรียก `login()` จาก authService
3. ถ้าสำเร็จ → เก็บ token และ profile
4. นำทางไปหน้าหลัก

---

#### **Frontend Part 2: authService.js**

```javascript
// ไฟล์: src/services/authService.js
// หน้าที่: จัดการ Login/Logout/Token

export const login = async (identifier, password, remember = true) => {
  // 1. เตรียมข้อมูล
  const username = (identifier || '').toString().trim();

  if (!username || !password) {
    throw new Error('กรุณากรอกชื่อผู้ใช้และรหัสผ่าน');
  }

  try {
    // 2. ส่ง HTTP POST ไป Backend
    const response = await axiosInstance.post('/auth/login', {
      username,
      password,
    });

    const data = response.data;

    // 3. เก็บ Token ใน Storage
    if (data.status && data.token) {
      const storage = remember ? localStorage : sessionStorage;
      storage.setItem('authToken', data.token);
      localStorage.setItem('userId', data.userId.toString());
    }

    return data; // ส่งข้อมูลกลับไป Login.jsx
  } catch (error) {
    throw new Error(error.message || 'เข้าสู่ระบบล้มเหลว');
  }
};
```

**อธิบาย:**
1. รับ username, password จาก Login.jsx
2. ส่ง POST request ไป `/api/auth/login`
3. ได้ response กลับมา (มี token + userId)
4. เก็บ token ใน localStorage หรือ sessionStorage
5. return data กลับไปให้ Login.jsx

---

#### **Frontend Part 3: axiosInstance.js**

```javascript
// ไฟล์: src/lib/axiosInstance.js
// หน้าที่: ตั้งค่า Axios และแนบ Token อัตโนมัติ

// Request Interceptor - เพิ่ม Token ก่อนส่ง request
axiosInstance.interceptors.request.use(
  (config) => {
    // ดึง token จาก storage
    const token = localStorage.getItem('authToken') || 
                  sessionStorage.getItem('authToken');
    
    // ถ้ามี token ให้แนบเข้าไปใน header
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor - จัดการ error
axiosInstance.interceptors.response.use(
  (response) => {
    return response; // ถ้า success ส่งต่อ
  },
  (error) => {
    // ถ้าได้ 401 Unauthorized
    if (error.response?.status === 401) {
      // ลบ token และ redirect ไป login
      localStorage.removeItem('authToken');
      sessionStorage.removeItem('authToken');
      localStorage.removeItem('userId');
      window.location.href = '/login';
    }
    
    return Promise.reject(error);
  }
);
```

**อธิบาย:**
1. **Request Interceptor:** ก่อนส่ง request ทุกครั้ง → เพิ่ม `Authorization: Bearer <token>` ใน header
2. **Response Interceptor:** ถ้าได้ error 401 → logout อัตโนมัติ

---

#### **Backend Part 1: AuthController.java**

```java
// ไฟล์: controller/AuthController.java
// หน้าที่: รับ HTTP Request และส่ง Response

@PostMapping("/login")
public ResponseEntity<LoginResponse> login(
    @RequestBody LoginRequest request,
    HttpServletRequest httpRequest
) {
    try {
        logger.info("Login attempt for username: {}", request.getUsername());
        
        // 1. ตรวจสอบกับ TU API
        TuVerifyResponse tuResponse = tuAuthService.verify(
            request.getUsername(), 
            request.getPassword()
        );

        if (tuResponse != null && tuResponse.isStatus()) {
            // 2. ดึง IP Address
            String ipAddress = getClientIP(httpRequest);
            
            // 3. บันทึก Login History และได้ userId
            Long userId = userService.saveLoginHistoryAndGetUserId(
                tuResponse, 
                ipAddress
            );

            // 4. สร้าง JWT Token
            String token = jwtService.generateToken(
                userId, 
                tuResponse.getUsername()
            );

            logger.info("Login successful for user: {} with userId: {}", 
                tuResponse.getUsername(), userId);

            // 5. สร้าง Response
            LoginResponse success = new LoginResponse(
                true,                           // status
                "Login Success",                // message
                token,                          // JWT token
                userId,                         // user ID
                tuResponse.getUsername(),       // username
                tuResponse.getDisplaynameTh(),  // ชื่อไทย
                tuResponse.getEmail()           // email
            );
            
            // 6. ส่งกลับไป Frontend
            return ResponseEntity.ok(success);
        } else {
            logger.warn("Invalid credentials for username: {}", 
                request.getUsername());
            return ResponseEntity.status(401)
                .body(new LoginResponse(false, "Invalid credentials"));
        }
    } catch (Exception e) {
        logger.error("Login failed", e);
        return ResponseEntity.status(500)
            .body(new LoginResponse(false, "Login failed: " + e.getMessage()));
    }
}
```

**อธิบาย:**
1. รับ LoginRequest (username, password) จาก Frontend
2. เรียก `tuAuthService.verify()` เพื่อตรวจสอบกับ TU API
3. ถ้าถูกต้อง → เรียก `userService` บันทึก login history
4. สร้าง JWT Token ด้วย `jwtService`
5. สร้าง LoginResponse และส่งกลับ Frontend

---

#### **Backend Part 2: TuAuthService.java**

```java
// ไฟล์: service/TuAuthService.java
// หน้าที่: เชื่อมต่อกับ TU API

@Service
public class TuAuthService {
    
    private final WebClient webClient;
    
    @Value("${TU_API_URL}")
    private String apiUrl;
    
    @Value("${TU_API_KEY}")
    private String apiKey;

    public TuVerifyResponse verify(String username, String password) {
        // 1. สร้าง request object
        TuVerifyRequest request = new TuVerifyRequest(
            apiKey,   // Application Key
            username, // รหัสนักศึกษา
            password  // รหัสผ่าน
        );
        
        try {
            // 2. ส่ง HTTP POST ไป TU API
            TuVerifyResponse response = webClient.post()
                .uri(apiUrl) // https://restapi.tu.ac.th/api/v1/auth/Ad/verify
                .bodyValue(request)
                .retrieve()
                .bodyToMono(TuVerifyResponse.class)
                .block(); // รอผลลัพธ์
            
            logger.info("TU API response for user {}: {}", 
                username, response.isStatus());
            
            return response;
        } catch (Exception e) {
            logger.error("TU API verification failed", e);
            return null;
        }
    }
}
```

**อธิบาย:**
1. รับ username, password จาก AuthController
2. สร้าง TuVerifyRequest พร้อม API Key
3. ส่ง POST request ไป TU API
4. ได้ TuVerifyResponse กลับมา (มีข้อมูล username, email, faculty, etc.)
5. return response กลับไป AuthController

---

#### **Backend Part 3: UserService.java**

```java
// ไฟล์: service/UserService.java
// หน้าที่: จัดการ User และ Login History

@Transactional
public Long saveLoginHistoryAndGetUserId(
    TuVerifyResponse tuResponse, 
    String ipAddress
) {
    logger.info("Login attempt for user: {} from IP: {}", 
        tuResponse.getUsername(), ipAddress);
    
    // 1. ตรวจสอบว่ามี User ในระบบหรือยัง
    User user = userRepository.findByUsername(tuResponse.getUsername())
        .orElse(null);
    
    // 2. ถ้ายังไม่มี ให้สร้าง User ใหม่
    if (user == null) {
        user = new User();
        user.setUsername(tuResponse.getUsername());
        user.setDisplaynameTh(tuResponse.getDisplaynameTh());
        user.setEmail(tuResponse.getEmail());
        user.setFaculty(tuResponse.getFaculty());
        user.setDepartment(tuResponse.getDepartment());
        user = userRepository.save(user); // บันทึกและได้ ID กลับมา
        logger.info("New user created: {} with ID: {}", 
            tuResponse.getUsername(), user.getId());
    } else {
        // 3. ถ้ามีอยู่แล้ว อัปเดทข้อมูล
        user.setDisplaynameTh(tuResponse.getDisplaynameTh());
        user.setEmail(tuResponse.getEmail());
        user.setFaculty(tuResponse.getFaculty());
        user.setDepartment(tuResponse.getDepartment());
        user = userRepository.save(user);
        logger.info("User updated: {} with ID: {}", 
            tuResponse.getUsername(), user.getId());
    }
    
    // 4. บันทึก Login History
    LoginHistory history = new LoginHistory();
    history.setUserId(user.getId());      // user ID
    history.setUsername(tuResponse.getUsername());
    history.setIpAddress(ipAddress);       // IP ที่ login
    history.setStatus("SUCCESS");
    
    loginHistoryRepository.save(history);
    
    logger.info("Login successful for user: {} with ID: {}", 
        tuResponse.getUsername(), user.getId());
    
    // 5. Return userId
    return user.getId();
}
```

**อธิบาย:**
1. รับข้อมูลจาก TU API (TuVerifyResponse) และ IP Address
2. ตรวจสอบว่ามี User ในฐานข้อมูลหรือยัง
3. ถ้าไม่มี → สร้างใหม่, ถ้ามี → อัปเดท
4. บันทึก Login History ลงฐานข้อมูล
5. return userId กลับไป AuthController

---

#### **Backend Part 4: JwtService.java**

```java
// ไฟล์: security/JwtService.java
// หน้าที่: สร้างและตรวจสอบ JWT Token

@Service
public class JwtService {
    
    @Value("${jwt.secret}")
    private String SECRET_KEY;
    
    @Value("${jwt.expiration}")
    private long jwtExpiration; // 24 hours

    // สร้าง Token
    public String generateToken(Long userId, String username) {
        // 1. เตรียม claims (ข้อมูลใน token)
        Map<String, Object> claims = new HashMap<>();
        claims.put("userId", userId);
        claims.put("username", username);
        
        // 2. สร้าง token
        return createToken(claims, username);
    }

    private String createToken(Map<String, Object> claims, String subject) {
        return Jwts.builder()
                .setClaims(claims)           // เพิ่มข้อมูล userId, username
                .setSubject(subject)         // username
                .setIssuedAt(new Date())     // เวลาที่สร้าง
                .setExpiration(new Date(
                    System.currentTimeMillis() + jwtExpiration
                )) // หมดอายุ 24 ชั่วโมง
                .signWith(getSignKey(), SignatureAlgorithm.HS256) // เซ็นด้วย secret key
                .compact(); // สร้าง JWT string
    }

    // ดึง userId จาก Token
    public Long extractUserId(String token) {
        Claims claims = extractAllClaims(token);
        return claims.get("userId", Long.class);
    }

    // ดึง username จาก Token
    public String extractUsername(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    // ตรวจสอบ Token
    public Boolean validateToken(String token) {
        try {
            return !isTokenExpired(token);
        } catch (Exception e) {
            return false;
        }
    }
    
    private Boolean isTokenExpired(String token) {
        return extractExpiration(token).before(new Date());
    }
}
```

**อธิบาย:**
1. `generateToken()` → สร้าง JWT Token พร้อม userId และ username
2. Token มีอายุ 24 ชั่วโมง (configurable)
3. เซ็น token ด้วย SECRET_KEY
4. `validateToken()` → ตรวจสอบว่า token หมดอายุหรือยัง
5. `extractUserId()` → ดึง userId จาก token

---

#### **Backend Part 5: JwtAuthenticationFilter.java**

```java
// ไฟล์: security/JwtAuthenticationFilter.java
// หน้าที่: ตรวจสอบ Token ทุก Request

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtService jwtService;

    @Override
    protected void doFilterInternal(
        HttpServletRequest request,
        HttpServletResponse response,
        FilterChain filterChain
    ) throws ServletException, IOException {
        
        final String authHeader = request.getHeader("Authorization");
        final String jwt;
        final String username;

        // Skip JWT validation for public endpoints
        String requestPath = request.getRequestURI();
        if (requestPath.startsWith("/api/auth/login") || 
            requestPath.startsWith("/api/events/cards")) {
            filterChain.doFilter(request, response);
            return;
        }

        // Check Authorization header
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        // ดึง token จาก header
        jwt = authHeader.substring(7); // ตัด "Bearer " ออก
        
        try {
            username = jwtService.extractUsername(jwt);

            if (username != null && SecurityContextHolder.getContext()
                .getAuthentication() == null) {
                    
                if (jwtService.validateToken(jwt)) {
                    Long userId = jwtService.extractUserId(jwt);
                    
                    // สร้าง Authentication
                    UsernamePasswordAuthenticationToken authToken = 
                        new UsernamePasswordAuthenticationToken(
                            username,
                            null,
                            new ArrayList<>()
                        );
                    
                    // เก็บ userId ใน request attribute
                    request.setAttribute("userId", userId);
                    
                    // Set authentication
                    SecurityContextHolder.getContext()
                        .setAuthentication(authToken);
                }
            }
        } catch (Exception e) {
            logger.error("JWT validation error: " + e.getMessage());
        }

        filterChain.doFilter(request, response);
    }
}
```

**อธิบาย:**
1. ทุก HTTP Request จะผ่าน Filter นี้ก่อน
2. ดึง token จาก `Authorization: Bearer <token>` header
3. ตรวจสอบ token ด้วย `jwtService.validateToken()`
4. ถ้า valid → ดึง userId และ username จาก token
5. Set Authentication เข้า SecurityContext
6. ส่งต่อ request ไปยัง Controller

---

### **🗄️ Database Flow:**

```sql
-- 1. ตาราง users
CREATE TABLE users (
    id BIGINT PRIMARY KEY IDENTITY(1,1),
    username NVARCHAR(50) UNIQUE NOT NULL,
    displayname_th NVARCHAR(255),
    email NVARCHAR(255),
    faculty NVARCHAR(255),
    department NVARCHAR(255),
    created_at DATETIME2,
    updated_at DATETIME2
);

-- 2. ตาราง login_history
CREATE TABLE login_history (
    id BIGINT PRIMARY KEY IDENTITY(1,1),
    user_id BIGINT FOREIGN KEY REFERENCES users(id),
    username NVARCHAR(50),
    ip_address NVARCHAR(50),
    login_time DATETIME2 DEFAULT GETDATE(),
    status NVARCHAR(20)
);
```

**การบันทึกข้อมูล:**
1. Login สำเร็จ → บันทึกใน `users` (ถ้ายังไม่มี)
2. บันทึกใน `login_history` ทุกครั้งที่ login

---

## 🎯 สรุป Login Flow แบบเต็ม:

```
1. User กรอก username/password
   ↓
2. Login.jsx → handleSubmit()
   ↓
3. authService.login() → ส่ง POST /api/auth/login
   ↓
4. axiosInstance → เพิ่ม headers
   ↓
5. AuthController.login() → รับ request
   ↓
6. TuAuthService.verify() → ตรวจสอบกับ TU API
   ↓
7. TU API → ยืนยันตัวตน
   ↓
8. UserService.saveLoginHistory() → บันทึก user + history
   ↓
9. JwtService.generateToken() → สร้าง JWT
   ↓
10. AuthController → ส่ง Response (token + userId)
    ↓
11. authService → เก็บ token ใน localStorage
    ↓
12. Login.jsx → อัปเดท auth state
    ↓
13. navigate("/") → ไปหน้าหลัก
```

**JWT Token ตัวอย่าง:**
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.
eyJ1c2VySWQiOjEsInVzZXJuYW1lIjoiNjcwOTYxNjg0OCIsInN1YiI6IjY3MDk2MTY4NDgiLCJpYXQiOjE3MDk2MTY4NDgsImV4cCI6MTcwOTcwMzI0OH0.
xyz...
```

**ใน Token มี:**
- userId: 1
- username: "6709616848"
- iat: เวลาที่สร้าง
- exp: เวลาหมดอายุ

---

ต่อไปผมจะอธิบายฟังก์ชันอื่นๆ ครับ รอก่อนนะครับ...
