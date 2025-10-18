-- ============================================
-- สคริปต์สร้างตารางทั้งหมดสำหรับระบบ Login
-- ============================================
-- ⚠️ รันไฟล์นี้ใน SQL Server Management Studio
-- ⚠️ ระวัง: จะลบตารางเก่าและข้อมูลทั้งหมด

USE EventDB;
GO

-- ============================================
-- 1. สร้างตาราง Users
-- ============================================

PRINT 'Creating table: users';
GO

-- ลบตารางเก่าถ้ามี
IF OBJECT_ID('dbo.login_history', 'U') IS NOT NULL
    DROP TABLE dbo.login_history;
GO

IF OBJECT_ID('dbo.users', 'U') IS NOT NULL
    DROP TABLE dbo.users;
GO

-- สร้างตาราง users
CREATE TABLE dbo.users (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    username NVARCHAR(50) NOT NULL UNIQUE,      -- รหัสนักศึกษา/บุคลากร
    displayname_th NVARCHAR(255) NOT NULL,      -- ชื่อภาษาไทย
    email NVARCHAR(255),                         -- อีเมล์
    faculty NVARCHAR(255),                       -- คณะ
    department NVARCHAR(255),                    -- สาขา/หน่วยงาน
    created_at DATETIME2 DEFAULT GETDATE(),      -- วันที่สร้างบันทึก
    updated_at DATETIME2 DEFAULT GETDATE()       -- วันที่อัพเดทล่าสุด
);
GO

-- สร้าง Index
CREATE INDEX idx_users_username ON dbo.users(username);
CREATE INDEX idx_users_email ON dbo.users(email);
GO

-- สร้าง Trigger สำหรับอัพเดท updated_at อัตโนมัติ
CREATE TRIGGER trg_users_updated_at
ON dbo.users
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE dbo.users
    SET updated_at = GETDATE()
    FROM dbo.users u
    INNER JOIN inserted i ON u.id = i.id;
END;
GO

PRINT '✅ Table users created successfully!';
GO

-- ============================================
-- 2. สร้างตาราง Login History
-- ============================================

PRINT 'Creating table: login_history';
GO

-- สร้างตาราง login_history
CREATE TABLE dbo.login_history (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    user_id BIGINT NULL,                        -- อนุญาตให้เป็น NULL
    username NVARCHAR(50) NOT NULL,             -- รหัสนักศึกษา/บุคลากร
    ip_address NVARCHAR(50),                    -- IP Address
    login_time DATETIME2 DEFAULT GETDATE(),     -- เวลาที่ Login
    status NVARCHAR(20) DEFAULT 'SUCCESS',      -- สถานะ (SUCCESS/FAILED)
    
    -- Foreign Key เชื่อมกับ users
    CONSTRAINT FK_login_history_user FOREIGN KEY (user_id) 
        REFERENCES dbo.users(id) ON DELETE SET NULL
);
GO

-- สร้าง Index
CREATE INDEX idx_login_history_user_id ON dbo.login_history(user_id);
CREATE INDEX idx_login_history_username ON dbo.login_history(username);
CREATE INDEX idx_login_history_login_time ON dbo.login_history(login_time);
GO

PRINT '✅ Table login_history created successfully!';
GO

-- ============================================
-- 3. แสดงข้อมูลตาราง
-- ============================================

PRINT '';
PRINT '================================================';
PRINT 'สร้างตารางเสร็จสมบูรณ์!';
PRINT '================================================';
PRINT 'ตารางที่สร้าง:';
PRINT '  1. dbo.users';
PRINT '  2. dbo.login_history';
PRINT '';
PRINT 'ขั้นตอนถัดไป:';
PRINT '  1. Restart Backend Spring Boot';
PRINT '  2. ทดสอบ Login ที่ http://localhost:5173/login';
PRINT '================================================';
GO

-- แสดงโครงสร้างตาราง
SELECT 
    'users' AS table_name,
    COLUMN_NAME,
    DATA_TYPE,
    CHARACTER_MAXIMUM_LENGTH,
    IS_NULLABLE
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_NAME = 'users'
ORDER BY ORDINAL_POSITION;

SELECT 
    'login_history' AS table_name,
    COLUMN_NAME,
    DATA_TYPE,
    CHARACTER_MAXIMUM_LENGTH,
    IS_NULLABLE
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_NAME = 'login_history'
ORDER BY ORDINAL_POSITION;
