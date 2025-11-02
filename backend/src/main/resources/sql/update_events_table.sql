-- ========================================
-- Script: อัปเดตตาราง Events เพื่อรองรับข้อมูลเพิ่มเติม
-- ========================================

USE EventDB;
GO

-- เพิ่มคอลัมน์ใหม่ในตาราง Events
ALTER TABLE dbo.Events
ADD 
    imageUrl NVARCHAR(500) NULL,
    category NVARCHAR(100) NULL,
    maxCapacity INT NULL,
    currentParticipants INT DEFAULT 0,
    status NVARCHAR(20) DEFAULT 'OPEN',
    organizer NVARCHAR(255) NULL,
    fee FLOAT DEFAULT 0.0,
    tags NVARCHAR(500) NULL;
GO

-- อัปเดตข้อมูลเดิมให้มีค่า default
UPDATE dbo.Events
SET 
    currentParticipants = 0 WHERE currentParticipants IS NULL,
    status = 'OPEN' WHERE status IS NULL,
    fee = 0.0 WHERE fee IS NULL;
GO

-- เพิ่ม Index สำหรับการค้นหา
CREATE INDEX idx_events_category ON dbo.Events(category);
CREATE INDEX idx_events_status ON dbo.Events(status);
CREATE INDEX idx_events_startTime ON dbo.Events(startTime);
GO

PRINT '✅ ตาราง Events อัปเดตเรียบร้อยแล้ว!';
GO

-- ตรวจสอบโครงสร้างตาราง
SELECT COLUMN_NAME, DATA_TYPE, CHARACTER_MAXIMUM_LENGTH, IS_NULLABLE, COLUMN_DEFAULT
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_NAME = 'Events'
ORDER BY ORDINAL_POSITION;
GO
