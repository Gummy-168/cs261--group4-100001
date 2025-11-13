-- ==========================================
-- Faculty Access Control Migration
-- Database: EventDB (Microsoft SQL Server)
-- Schema: dbo
-- ==========================================

USE EventDB;
GO

-- ==========================================
-- STEP 1: เพิ่ม Column created_by_faculty ใน events
-- ==========================================
IF NOT EXISTS (
    SELECT * FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_SCHEMA = 'dbo'
    AND TABLE_NAME = 'Events' 
    AND COLUMN_NAME = 'created_by_faculty'
)
BEGIN
    ALTER TABLE dbo.Events ADD created_by_faculty NVARCHAR(200);
    PRINT '✅ Added created_by_faculty to Events';
END
ELSE
BEGIN
    PRINT 'ℹ️  created_by_faculty already exists in Events';
END
GO

-- ==========================================
-- STEP 2: เพิ่ม Column faculty ใน admins
-- ==========================================
IF NOT EXISTS (
    SELECT * FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_SCHEMA = 'dbo'
    AND TABLE_NAME = 'admins' 
    AND COLUMN_NAME = 'faculty'
)
BEGIN
    ALTER TABLE dbo.admins ADD faculty NVARCHAR(100);
    PRINT '✅ Added faculty to admins';
END
ELSE
BEGIN
    PRINT 'ℹ️  faculty already exists in admins';
END
GO

-- ==========================================
-- STEP 3: อัพเดท Admin ให้มี Faculty
-- ==========================================

-- ตั้งค่า Super Admin (แก้ email ตามจริง)
UPDATE dbo.admins 
SET faculty = 'ALL' 
WHERE email IN ('admin@tu.ac.th', 'admin@example.com')
AND faculty IS NULL;

-- ตั้งค่า Admin ของแต่ละคณะ (แก้ตามจริง)
-- UPDATE dbo.admins SET faculty = 'Engineering' WHERE email = 'admin.eng@tu.ac.th';
-- UPDATE dbo.admins SET faculty = 'Science' WHERE email = 'admin.sci@tu.ac.th';

-- ตั้งค่า default สำหรับ admin ที่เหลือ
UPDATE dbo.admins 
SET faculty = 'Unknown' 
WHERE faculty IS NULL;

PRINT '✅ Updated admins with faculty';
GO

-- ==========================================
-- STEP 4: อัพเดท Event ให้มี Faculty
-- ==========================================

-- อัพเดทจาก admin ที่สร้าง
UPDATE e
SET e.created_by_faculty = a.faculty
FROM dbo.Events e
INNER JOIN dbo.admins a ON e.created_by_admin = a.email
WHERE e.created_by_faculty IS NULL;

-- ตั้งค่า default
UPDATE dbo.Events 
SET created_by_faculty = 'Unknown' 
WHERE created_by_faculty IS NULL;

PRINT '✅ Updated events with faculty';
GO

-- ==========================================
-- STEP 5: สร้าง Index
-- ==========================================

IF NOT EXISTS (
    SELECT * FROM sys.indexes 
    WHERE name = 'idx_events_faculty' 
    AND object_id = OBJECT_ID('dbo.Events')
)
BEGIN
    CREATE INDEX idx_events_faculty ON dbo.Events(created_by_faculty);
    PRINT '✅ Created index on Events.created_by_faculty';
END
ELSE
BEGIN
    PRINT 'ℹ️  Index idx_events_faculty already exists';
END
GO

IF NOT EXISTS (
    SELECT * FROM sys.indexes 
    WHERE name = 'idx_events_admin' 
    AND object_id = OBJECT_ID('dbo.Events')
)
BEGIN
    CREATE INDEX idx_events_admin ON dbo.Events(created_by_admin);
    PRINT '✅ Created index on Events.created_by_admin';
END
ELSE
BEGIN
    PRINT 'ℹ️  Index idx_events_admin already exists';
END
GO

-- ==========================================
-- STEP 6: ตรวจสอบผลลัพธ์
-- ==========================================

PRINT '========================================';
PRINT '📊 Migration Summary';
PRINT '========================================';

-- จำนวน Admin แต่ละ Faculty
SELECT 
    faculty,
    COUNT(*) as admin_count
FROM dbo.admins
GROUP BY faculty
ORDER BY faculty;

-- จำนวน Event แต่ละ Faculty
SELECT 
    created_by_faculty,
    COUNT(*) as event_count
FROM dbo.Events
GROUP BY created_by_faculty
ORDER BY created_by_faculty;

-- เช็ค Admin ที่ไม่มี faculty
DECLARE @admins_without_faculty INT;
SELECT @admins_without_faculty = COUNT(*) FROM dbo.admins WHERE faculty IS NULL;
PRINT 'Admins without faculty: ' + CAST(@admins_without_faculty AS VARCHAR);

-- เช็ค Event ที่ไม่มี faculty
DECLARE @events_without_faculty INT;
SELECT @events_without_faculty = COUNT(*) FROM dbo.Events WHERE created_by_faculty IS NULL;
PRINT 'Events without faculty: ' + CAST(@events_without_faculty AS VARCHAR);

PRINT '========================================';
PRINT '✅ Migration completed successfully!';
PRINT '========================================';
GO
