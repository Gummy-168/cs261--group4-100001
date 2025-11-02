-- ============================================
-- ลบตาราง Events เก่าแล้วสร้างใหม่
-- ============================================
-- ⚠️ คำเตือน: จะลบข้อมูลทั้งหมดในตาราง Events

USE EventDB;
GO

-- ลบตารางที่เกี่ยวข้อง (Foreign Key)
IF OBJECT_ID('dbo.favorites', 'U') IS NOT NULL
BEGIN
    DROP TABLE dbo.favorites;
    PRINT '🗑️ ลบตาราง favorites';
END
GO

IF OBJECT_ID('dbo.notification_queue', 'U') IS NOT NULL
BEGIN
    DROP TABLE dbo.notification_queue;
    PRINT '🗑️ ลบตาราง notification_queue';
END
GO

-- ลบตาราง Events
IF OBJECT_ID('dbo.Events', 'U') IS NOT NULL
BEGIN
    DROP TABLE dbo.Events;
    PRINT '🗑️ ลบตาราง Events';
END
GO

PRINT '';
PRINT '✅ ลบตารางเก่าเรียบร้อย';
PRINT 'ตอนนี้สามารถรัน setup_all_tables.sql เพื่อสร้างตารางใหม่';
GO
