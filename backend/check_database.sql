-- ตรวจสอบตารางทั้งหมดในฐานข้อมูล
USE EventDB;
GO

PRINT '==========================================';
PRINT 'ตรวจสอบตารางในฐานข้อมูล EventDB';
PRINT '==========================================';

-- ดูตารางทั้งหมด
SELECT 
    name AS table_name,
    create_date,
    modify_date
FROM sys.tables 
ORDER BY name;

PRINT '';
PRINT '==========================================';
PRINT 'ตรวจสอบว่ามีตาราง notification_queue หรือไม่';
PRINT '==========================================';

IF EXISTS (SELECT 1 FROM sys.tables WHERE name = 'notification_queue')
BEGIN
    PRINT '✅ มีตาราง notification_queue';
    
    -- แสดงโครงสร้าง
    SELECT 
        COLUMN_NAME,
        DATA_TYPE,
        IS_NULLABLE,
        COLUMN_DEFAULT
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_NAME = 'notification_queue'
    ORDER BY ORDINAL_POSITION;
END
ELSE
BEGIN
    PRINT '❌ ไม่มีตาราง notification_queue - ต้องสร้างก่อน!';
    PRINT 'รันไฟล์: backend/src/main/resources/sql/create_notification_queue_table.sql';
END

PRINT '';
PRINT '==========================================';
PRINT 'ตรวจสอบตาราง favorites';
PRINT '==========================================';

IF EXISTS (SELECT 1 FROM sys.tables WHERE name = 'favorites')
BEGIN
    PRINT '✅ มีตาราง favorites';
    
    SELECT 
        COLUMN_NAME,
        DATA_TYPE,
        IS_NULLABLE
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_NAME = 'favorites'
    ORDER BY ORDINAL_POSITION;
END
ELSE
BEGIN
    PRINT '❌ ไม่มีตาราง favorites';
END
