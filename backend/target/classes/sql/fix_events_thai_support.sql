-- ============================================
-- แก้ไขตาราง Events เดิมให้รองรับภาษาไทย
-- ============================================
-- รันไฟล์นี้ถ้าตาราง Events มีอยู่แล้วแต่ไม่รองรับภาษาไทย

USE EventDB;
GO

PRINT 'กำลังแก้ไขตาราง Events ให้รองรับภาษาไทย...';
GO

-- แก้ไข column ที่เป็น VARCHAR เป็น NVARCHAR
-- ⚠️ คำเตือน: จะแปลงข้อมูลเดิมให้เป็น Unicode

-- 1. แก้ไข title
IF EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS 
           WHERE TABLE_NAME = 'Events' AND COLUMN_NAME = 'title')
BEGIN
    ALTER TABLE dbo.Events 
    ALTER COLUMN title NVARCHAR(255) NOT NULL;
    PRINT '✅ แก้ไข title เป็น NVARCHAR(255)';
END
GO

-- 2. แก้ไข description
IF EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS 
           WHERE TABLE_NAME = 'Events' AND COLUMN_NAME = 'description')
BEGIN
    ALTER TABLE dbo.Events 
    ALTER COLUMN description NVARCHAR(1000) NULL;
    PRINT '✅ แก้ไข description เป็น NVARCHAR(1000)';
END
GO

-- 3. แก้ไข location
IF EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS 
           WHERE TABLE_NAME = 'Events' AND COLUMN_NAME = 'location')
BEGIN
    ALTER TABLE dbo.Events 
    ALTER COLUMN location NVARCHAR(500) NULL;
    PRINT '✅ แก้ไข location เป็น NVARCHAR(500)';
END
GO

-- 4. แก้ไข imageUrl
IF EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS 
           WHERE TABLE_NAME = 'Events' AND COLUMN_NAME = 'imageUrl')
BEGIN
    ALTER TABLE dbo.Events 
    ALTER COLUMN imageUrl NVARCHAR(500) NULL;
    PRINT '✅ แก้ไข imageUrl เป็น NVARCHAR(500)';
END
GO

-- 5. แก้ไข category
IF EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS 
           WHERE TABLE_NAME = 'Events' AND COLUMN_NAME = 'category')
BEGIN
    ALTER TABLE dbo.Events 
    ALTER COLUMN category NVARCHAR(100) NULL;
    PRINT '✅ แก้ไข category เป็น NVARCHAR(100)';
END
GO

-- 6. แก้ไข status
IF EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS 
           WHERE TABLE_NAME = 'Events' AND COLUMN_NAME = 'status')
BEGIN
    ALTER TABLE dbo.Events 
    ALTER COLUMN status NVARCHAR(20) NULL;
    PRINT '✅ แก้ไข status เป็น NVARCHAR(20)';
END
GO

-- 7. แก้ไข organizer
IF EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS 
           WHERE TABLE_NAME = 'Events' AND COLUMN_NAME = 'organizer')
BEGIN
    ALTER TABLE dbo.Events 
    ALTER COLUMN organizer NVARCHAR(255) NULL;
    PRINT '✅ แก้ไข organizer เป็น NVARCHAR(255)';
END
GO

-- 8. แก้ไข tags
IF EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS 
           WHERE TABLE_NAME = 'Events' AND COLUMN_NAME = 'tags')
BEGIN
    ALTER TABLE dbo.Events 
    ALTER COLUMN tags NVARCHAR(500) NULL;
    PRINT '✅ แก้ไข tags เป็น NVARCHAR(500)';
END
GO

PRINT '';
PRINT '================================================';
PRINT '✅ แก้ไขตาราง Events เสร็จแล้ว!';
PRINT '================================================';
PRINT 'ตอนนี้สามารถใช้ภาษาไทยได้แล้ว';
PRINT '================================================';
GO

-- ตรวจสอบ column types
SELECT 
    COLUMN_NAME,
    DATA_TYPE,
    CHARACTER_MAXIMUM_LENGTH,
    IS_NULLABLE
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_NAME = 'Events'
    AND COLUMN_NAME IN ('title', 'description', 'location', 'category', 'organizer', 'tags')
ORDER BY ORDINAL_POSITION;
GO
