-- ============================================
-- สคริปต์สร้างตาราง notification_queue
-- ============================================
-- ⚠️ รันไฟล์นี้ใน SQL Server Management Studio

USE EventDB;
GO

PRINT 'Creating table: notification_queue';
GO

-- ลบตารางเก่าถ้ามี
IF OBJECT_ID('dbo.notification_queue', 'U') IS NOT NULL
    DROP TABLE dbo.notification_queue;
GO

-- สร้างตาราง notification_queue
CREATE TABLE dbo.notification_queue (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    user_id BIGINT NOT NULL,                    -- รหัสผู้ใช้
    event_id BIGINT NOT NULL,                   -- รหัสกิจกรรม
    send_at DATETIME2 NOT NULL,                 -- เวลาที่ควรส่งการแจ้งเตือน
    status NVARCHAR(20) NOT NULL DEFAULT 'PENDING', -- สถานะ: PENDING, SENT, FAILED
    created_at DATETIME2 DEFAULT GETDATE(),     -- วันที่สร้างบันทึก
    updated_at DATETIME2 DEFAULT GETDATE(),     -- วันที่อัพเดทล่าสุด
    
    -- Foreign Keys
    CONSTRAINT FK_notification_queue_user FOREIGN KEY (user_id) 
        REFERENCES dbo.users(id) ON DELETE CASCADE,
    CONSTRAINT FK_notification_queue_event FOREIGN KEY (event_id) 
        REFERENCES dbo.events(id) ON DELETE CASCADE
);
GO

-- สร้าง Index เพื่อเพิ่มประสิทธิภาพการค้นหา
CREATE INDEX idx_notification_queue_user_id ON dbo.notification_queue(user_id);
CREATE INDEX idx_notification_queue_event_id ON dbo.notification_queue(event_id);
CREATE INDEX idx_notification_queue_status ON dbo.notification_queue(status);
CREATE INDEX idx_notification_queue_send_at ON dbo.notification_queue(send_at);
CREATE INDEX idx_notification_queue_user_event ON dbo.notification_queue(user_id, event_id);
GO

-- สร้าง Trigger สำหรับอัพเดท updated_at อัตโนมัติ
CREATE TRIGGER trg_notification_queue_updated_at
ON dbo.notification_queue
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE dbo.notification_queue
    SET updated_at = GETDATE()
    FROM dbo.notification_queue nq
    INNER JOIN inserted i ON nq.id = i.id;
END;
GO

PRINT '✅ Table notification_queue created successfully!';
GO

-- แสดงโครงสร้างตาราง
PRINT '';
PRINT '================================================';
PRINT '📋 โครงสร้างตาราง notification_queue';
PRINT '================================================';

SELECT 
    COLUMN_NAME,
    DATA_TYPE,
    CHARACTER_MAXIMUM_LENGTH,
    IS_NULLABLE,
    COLUMN_DEFAULT
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_NAME = 'notification_queue'
ORDER BY ORDINAL_POSITION;

PRINT '';
PRINT '================================================';
PRINT '✅ สร้างตารางเสร็จสมบูรณ์!';
PRINT '================================================';
PRINT '';
PRINT 'ขั้นตอนถัดไป:';
PRINT '  1. Restart Backend Spring Boot';
PRINT '  2. ทดสอบการบันทึก/ยกเลิกกิจกรรมที่สนใจ';
PRINT '================================================';
GO
