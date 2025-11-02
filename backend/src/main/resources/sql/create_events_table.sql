-- ============================================
-- สร้างตาราง Events รองรับภาษาไทย
-- ============================================
-- รันไฟล์นี้ใน SQL Server Management Studio

USE EventDB;
GO

-- ลบตารางเก่าถ้ามี (ระวัง: จะลบข้อมูลทั้งหมด)
IF OBJECT_ID('dbo.Events', 'U') IS NOT NULL
    DROP TABLE dbo.Events;
GO

-- สร้างตาราง Events ใหม่
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

-- สร้าง Index สำหรับการค้นหา
CREATE INDEX idx_events_category ON dbo.Events(category);
CREATE INDEX idx_events_status ON dbo.Events(status);
CREATE INDEX idx_events_startTime ON dbo.Events(startTime);
GO

PRINT '✅ ตาราง Events สร้างเสร็จแล้ว (รองรับภาษาไทย)';
GO
