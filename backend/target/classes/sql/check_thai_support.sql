-- ============================================
-- ตรวจสอบว่าตาราง Events รองรับภาษาไทยหรือไม่
-- ============================================

USE EventDB;
GO

PRINT '================================================';
PRINT 'กำลังตรวจสอบโครงสร้างตาราง Events...';
PRINT '================================================';
GO

-- ตรวจสอบ column types
SELECT 
    COLUMN_NAME AS 'Column',
    DATA_TYPE AS 'Type',
    CHARACTER_MAXIMUM_LENGTH AS 'Length',
    CASE 
        WHEN DATA_TYPE LIKE 'N%' THEN '✅ รองรับภาษาไทย'
        WHEN DATA_TYPE IN ('VARCHAR', 'CHAR', 'TEXT') THEN '❌ ไม่รองรับภาษาไทย'
        ELSE '➖ ไม่เกี่ยวข้อง'
    END AS 'Status'
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_NAME = 'Events'
ORDER BY ORDINAL_POSITION;
GO

PRINT '';
PRINT '================================================';
PRINT 'คำแนะนำ:';
PRINT '  ✅ = รองรับภาษาไทย (NVARCHAR, NCHAR, NTEXT)';
PRINT '  ❌ = ไม่รองรับภาษาไทย (VARCHAR, CHAR, TEXT)';
PRINT '';
PRINT 'ถ้ามี ❌ ให้รันไฟล์: fix_events_thai_support.sql';
PRINT '================================================';
GO
