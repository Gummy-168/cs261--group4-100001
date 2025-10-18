-- ============================================
-- สร้างตาราง Login History
-- ============================================

USE EventDB;
GO

-- ลบตารางเก่าถ้ามี (ระวัง: จะลบข้อมูลทั้งหมด)
IF OBJECT_ID('dbo.login_history', 'U') IS NOT NULL
    DROP TABLE dbo.login_history;
GO

-- สร้างตาราง login_history
CREATE TABLE dbo.login_history (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    user_id BIGINT NULL,                        -- อนุญาตให้เป็น NULL
    username NVARCHAR(50) NOT NULL,             -- รหัสนักศึกษา/บุคลากร
    ip_address NVARCHAR(50),                    -- IP Address
    login_time DATETIME2 DEFAULT GETDATE(),     -- เวลาที่ Login
    status NVARCHAR(20) DEFAULT 'SUCCESS',      -- สถานะ (SUCCESS/FAILED)
    
    -- Foreign Key (ถ้ามี user_id)
    CONSTRAINT FK_login_history_user FOREIGN KEY (user_id) 
        REFERENCES dbo.users(id) ON DELETE SET NULL
);
GO

-- สร้าง Index สำหรับค้นหาเร็วขึ้น
CREATE INDEX idx_login_history_user_id ON dbo.login_history(user_id);
CREATE INDEX idx_login_history_username ON dbo.login_history(username);
CREATE INDEX idx_login_history_login_time ON dbo.login_history(login_time);
GO

PRINT 'Table login_history created successfully!';
