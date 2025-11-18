-- ============================================
-- สร้างตาราง events ให้ตรงกับ Event.java (รองรับภาษาไทย + field ใหม่)
-- ============================================

USE EventDB;
GO

-- ลบตารางเก่าถ้ามี (ระวัง: จะลบข้อมูลทั้งหมด)
IF OBJECT_ID('dbo.events', 'U') IS NOT NULL
    DROP TABLE dbo.events;
GO

-- สร้างตาราง events ใหม่
CREATE TABLE dbo.events (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,

    title NVARCHAR(200) NOT NULL,            -- ชื่อกิจกรรม
    description NVARCHAR(2000) NULL,         -- รายละเอียด
    location NVARCHAR(300) NULL,             -- สถานที่

    startTime DATETIME2 NOT NULL,            -- เวลาเริ่ม
    endTime   DATETIME2 NULL,                -- เวลาสิ้นสุด

    category  NVARCHAR(100) NULL,            -- หมวดหมู่
    organizer NVARCHAR(200) NULL,            -- ผู้จัด

    maxCapacity INT NULL,                    -- จำนวนผู้เข้าร่วมสูงสุด
    currentParticipants INT NOT NULL DEFAULT 0,   -- จำนวนผู้เข้าร่วมปัจจุบัน

    status NVARCHAR(50) NOT NULL DEFAULT 'OPEN', -- สถานะ
    fee    FLOAT NOT NULL DEFAULT 0.0,           -- ค่าใช้จ่าย

    imageUrl NVARCHAR(500) NULL,            -- URL รูปภาพ

    created_by_admin   NVARCHAR(200) NULL,  -- email admin ผู้สร้าง
    created_by_faculty NVARCHAR(200) NULL,  -- คณะที่สร้าง

    view_count INT NOT NULL DEFAULT 0,      -- ⭐ จำนวนเข้าชม

    tags NVARCHAR(500) NULL,                -- tags สำหรับค้นหา

    isPublic BIT NOT NULL DEFAULT 0         -- ⭐ เผยแพร่ต่อสาธารณะหรือไม่
);
GO

-- Index สำหรับการค้นหา
CREATE INDEX idx_events_category     ON dbo.events(category);
CREATE INDEX idx_events_status       ON dbo.events(status);
CREATE INDEX idx_events_startTime    ON dbo.events(startTime);
CREATE INDEX idx_events_created_fac  ON dbo.events(created_by_faculty);
GO

PRINT '✅ ตาราง dbo.events สร้างเสร็จแล้ว (ตรงกับ Event.java + มี view_count)';
GO
