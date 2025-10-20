-- ============================================
-- สคริปต์สร้างตารางทั้งหมดสำหรับระบบ
-- ============================================
-- รันไฟล์นี้ใน SQL Server Management Studio
-- ⚠️ ระวัง: จะลบตารางเก่าและข้อมูลทั้งหมด

USE EventDB;
GO

-- ============================================
-- 1. สร้างตาราง Events (รองรับภาษาไทย)
-- ============================================

PRINT 'Creating table: Events';
GO

-- ลบตารางที่เกี่ยวข้องก่อน
IF OBJECT_ID('dbo.favorites', 'U') IS NOT NULL
    DROP TABLE dbo.favorites;
GO

IF OBJECT_ID('dbo.notification_queue', 'U') IS NOT NULL
    DROP TABLE dbo.notification_queue;
GO

IF OBJECT_ID('dbo.Events', 'U') IS NOT NULL
    DROP TABLE dbo.Events;
GO

-- สร้างตาราง Events
CREATE TABLE dbo.Events (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    title NVARCHAR(255) NOT NULL,                   -- ชื่อกิจกรรม (รองรับภาษาไทย)
    description NVARCHAR(1000),                     -- รายละเอียด (รองรับภาษาไทย)
    location NVARCHAR(500),                         -- สถานที่ (รองรับภาษาไทย)
    startTime DATETIME2 NOT NULL,                   -- เวลาเริ่ม
    endTime DATETIME2 NOT NULL,                     -- เวลาสิ้นสุด
    imageUrl NVARCHAR(500),                         -- URL รูปภาพ
    category NVARCHAR(100),                         -- หมวดหมู่ (รองรับภาษาไทย)
    maxCapacity INT,                                -- จำนวนผู้เข้าร่วมสูงสุด
    currentParticipants INT DEFAULT 0,              -- จำนวนผู้เข้าร่วมปัจจุบัน
    status NVARCHAR(20) DEFAULT 'OPEN',             -- สถานะ
    organizer NVARCHAR(255),                        -- ผู้จัด (รองรับภาษาไทย)
    fee FLOAT DEFAULT 0.0,                          -- ค่าใช้จ่าย
    tags NVARCHAR(500)                              -- Tags (รองรับภาษาไทย)
);
GO

-- สร้าง Index
CREATE INDEX idx_events_category ON dbo.Events(category);
CREATE INDEX idx_events_status ON dbo.Events(status);
CREATE INDEX idx_events_startTime ON dbo.Events(startTime);
GO

PRINT '✅ Table Events created successfully!';
GO

-- ============================================
-- 2. สร้างตาราง Users
-- ============================================

PRINT 'Creating table: users';
GO

IF OBJECT_ID('dbo.login_history', 'U') IS NOT NULL
    DROP TABLE dbo.login_history;
GO

IF OBJECT_ID('dbo.users', 'U') IS NOT NULL
    DROP TABLE dbo.users;
GO

CREATE TABLE dbo.users (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    username NVARCHAR(50) NOT NULL UNIQUE,
    displayname_th NVARCHAR(255) NOT NULL,
    email NVARCHAR(255),
    faculty NVARCHAR(255),
    department NVARCHAR(255),
    created_at DATETIME2 DEFAULT GETDATE(),
    updated_at DATETIME2 DEFAULT GETDATE()
);
GO

CREATE INDEX idx_users_username ON dbo.users(username);
CREATE INDEX idx_users_email ON dbo.users(email);
GO

PRINT '✅ Table users created successfully!';
GO

-- ============================================
-- 3. สร้างตาราง Login History
-- ============================================

PRINT 'Creating table: login_history';
GO

CREATE TABLE dbo.login_history (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    user_id BIGINT NULL,
    username NVARCHAR(50) NOT NULL,
    ip_address NVARCHAR(50),
    login_time DATETIME2 DEFAULT GETDATE(),
    status NVARCHAR(20) DEFAULT 'SUCCESS',
    CONSTRAINT FK_login_history_user FOREIGN KEY (user_id) 
        REFERENCES dbo.users(id) ON DELETE SET NULL
);
GO

CREATE INDEX idx_login_history_user_id ON dbo.login_history(user_id);
CREATE INDEX idx_login_history_username ON dbo.login_history(username);
CREATE INDEX idx_login_history_login_time ON dbo.login_history(login_time);
GO

PRINT '✅ Table login_history created successfully!';
GO

-- ============================================
-- 4. สร้างตาราง Favorites
-- ============================================

PRINT 'Creating table: favorites';
GO

CREATE TABLE dbo.favorites (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    user_id BIGINT NOT NULL,
    event_id BIGINT NOT NULL,
    created_at DATETIME2 DEFAULT GETDATE(),
    CONSTRAINT FK_favorites_user FOREIGN KEY (user_id) 
        REFERENCES dbo.users(id) ON DELETE CASCADE,
    CONSTRAINT FK_favorites_event FOREIGN KEY (event_id) 
        REFERENCES dbo.Events(id) ON DELETE CASCADE,
    CONSTRAINT UQ_user_event UNIQUE (user_id, event_id)
);
GO

CREATE INDEX idx_favorites_user_id ON dbo.favorites(user_id);
CREATE INDEX idx_favorites_event_id ON dbo.favorites(event_id);
GO

PRINT '✅ Table favorites created successfully!';
GO

-- ============================================
-- 5. สร้างตาราง Notification Queue
-- ============================================

PRINT 'Creating table: notification_queue';
GO

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
        REFERENCES dbo.Events(id) ON DELETE CASCADE
);
GO

CREATE INDEX idx_notification_queue_user_id ON dbo.notification_queue(user_id);
CREATE INDEX idx_notification_queue_event_id ON dbo.notification_queue(event_id);
CREATE INDEX idx_notification_queue_status ON dbo.notification_queue(status);
CREATE INDEX idx_notification_queue_send_at ON dbo.notification_queue(send_at);
GO

PRINT '✅ Table notification_queue created successfully!';
GO

-- ============================================
-- สรุป
-- ============================================

PRINT '';
PRINT '================================================';
PRINT '✅ สร้างตารางเสร็จสมบูรณ์!';
PRINT '================================================';
PRINT 'ตารางที่สร้าง:';
PRINT '  1. Events (รองรับภาษาไทย)';
PRINT '  2. users';
PRINT '  3. login_history';
PRINT '  4. favorites';
PRINT '  5. notification_queue';
PRINT '================================================';
GO
