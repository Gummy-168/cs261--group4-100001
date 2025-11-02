-- ============================================
-- 🔍 สคริปต์ตรวจสอบระบบหลัง Login
-- ============================================

USE EventDB;
GO

PRINT '================================================';
PRINT '🔍 ตรวจสอบการทำงานของระบบ Login';
PRINT '================================================';
PRINT '';

-- ============================================
-- 1. ตรวจสอบว่ามีตารางหรือยัง
-- ============================================
PRINT '1️⃣  ตรวจสอบตารางในฐานข้อมูล';
PRINT '-----------------------------------';

SELECT 
    name AS table_name,
    create_date,
    modify_date
FROM sys.tables 
WHERE name IN ('users', 'login_history')
ORDER BY name;

PRINT '';

-- ============================================
-- 2. ตรวจสอบโครงสร้างตาราง users
-- ============================================
PRINT '2️⃣  โครงสร้างตาราง users';
PRINT '-----------------------------------';

SELECT 
    COLUMN_NAME,
    DATA_TYPE,
    CHARACTER_MAXIMUM_LENGTH,
    IS_NULLABLE,
    COLUMN_DEFAULT
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_NAME = 'users'
ORDER BY ORDINAL_POSITION;

PRINT '';

-- ============================================
-- 3. ตรวจสอบโครงสร้างตาราง login_history
-- ============================================
PRINT '3️⃣  โครงสร้างตาราง login_history';
PRINT '-----------------------------------';

SELECT 
    COLUMN_NAME,
    DATA_TYPE,
    CHARACTER_MAXIMUM_LENGTH,
    IS_NULLABLE,
    COLUMN_DEFAULT
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_NAME = 'login_history'
ORDER BY ORDINAL_POSITION;

PRINT '';

-- ============================================
-- 4. ตรวจสอบ Foreign Key
-- ============================================
PRINT '4️⃣  ตรวจสอบ Foreign Key Relations';
PRINT '-----------------------------------';

SELECT 
    fk.name AS foreign_key_name,
    OBJECT_NAME(fk.parent_object_id) AS table_name,
    COL_NAME(fkc.parent_object_id, fkc.parent_column_id) AS column_name,
    OBJECT_NAME(fk.referenced_object_id) AS referenced_table,
    COL_NAME(fkc.referenced_object_id, fkc.referenced_column_id) AS referenced_column
FROM sys.foreign_keys fk
INNER JOIN sys.foreign_key_columns fkc ON fk.object_id = fkc.constraint_object_id
WHERE OBJECT_NAME(fk.parent_object_id) = 'login_history';

PRINT '';

-- ============================================
-- 5. นับจำนวนข้อมูลในตาราง
-- ============================================
PRINT '5️⃣  จำนวนข้อมูลในแต่ละตาราง';
PRINT '-----------------------------------';

DECLARE @user_count INT, @history_count INT;

SELECT @user_count = COUNT(*) FROM dbo.users;
SELECT @history_count = COUNT(*) FROM dbo.login_history;

PRINT 'Users: ' + CAST(@user_count AS VARCHAR(10)) + ' records';
PRINT 'Login History: ' + CAST(@history_count AS VARCHAR(10)) + ' records';
PRINT '';

-- ============================================
-- 6. แสดงข้อมูล Users ล่าสุด (5 คนล่าสุด)
-- ============================================
PRINT '6️⃣  ข้อมูล Users ล่าสุด (5 คนล่าสุด)';
PRINT '-----------------------------------';

SELECT TOP 5
    id,
    username,
    displayname_th,
    email,
    faculty,
    department,
    created_at
FROM dbo.users
ORDER BY created_at DESC;

PRINT '';

-- ============================================
-- 7. แสดงประวัติ Login ล่าสุด (10 ครั้งล่าสุด)
-- ============================================
PRINT '7️⃣  ประวัติ Login ล่าสุด (10 ครั้งล่าสุด)';
PRINT '-----------------------------------';

SELECT TOP 10
    lh.id,
    lh.user_id,
    lh.username,
    u.displayname_th,
    lh.ip_address,
    lh.login_time,
    lh.status
FROM dbo.login_history lh
LEFT JOIN dbo.users u ON lh.user_id = u.id
ORDER BY lh.login_time DESC;

PRINT '';

-- ============================================
-- 8. สถิติการ Login แยกตาม User
-- ============================================
PRINT '8️⃣  สถิติการ Login แยกตาม User';
PRINT '-----------------------------------';

SELECT 
    lh.username,
    u.displayname_th,
    COUNT(*) AS login_count,
    MAX(lh.login_time) AS last_login,
    MIN(lh.login_time) AS first_login
FROM dbo.login_history lh
LEFT JOIN dbo.users u ON lh.user_id = u.id
GROUP BY lh.username, u.displayname_th
ORDER BY login_count DESC;

PRINT '';

-- ============================================
-- 9. ตรวจสอบ Login ที่ไม่มี user_id (ถ้ามี)
-- ============================================
PRINT '9️⃣  Login History ที่ไม่มี user_id (ควรไม่มี)';
PRINT '-----------------------------------';

SELECT COUNT(*) AS null_user_id_count
FROM dbo.login_history
WHERE user_id IS NULL;

IF EXISTS (SELECT 1 FROM dbo.login_history WHERE user_id IS NULL)
BEGIN
    SELECT 
        id,
        username,
        ip_address,
        login_time,
        status
    FROM dbo.login_history
    WHERE user_id IS NULL
    ORDER BY login_time DESC;
END
ELSE
BEGIN
    PRINT '✅ ไม่มี Login History ที่ user_id เป็น NULL';
END

PRINT '';

-- ============================================
-- 10. สรุปผล
-- ============================================
PRINT '================================================';
PRINT '📊 สรุปผลการตรวจสอบ';
PRINT '================================================';

-- ตรวจสอบว่าตารางมีครบไหม
DECLARE @tables_count INT;
SELECT @tables_count = COUNT(*) 
FROM sys.tables 
WHERE name IN ('users', 'login_history');

IF @tables_count = 2
    PRINT '✅ มีตารางครบ 2 ตาราง (users, login_history)';
ELSE
    PRINT '❌ ตารางไม่ครบ! กรุณาสร้างตารางก่อน';

-- ตรวจสอบว่า column username มีไหม
IF EXISTS (
    SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_NAME = 'users' AND COLUMN_NAME = 'username'
)
    PRINT '✅ ตาราง users มี column username';
ELSE
    PRINT '❌ ตาราง users ไม่มี column username!';

-- ตรวจสอบ Foreign Key
IF EXISTS (
    SELECT 1 FROM sys.foreign_keys 
    WHERE name = 'FK_login_history_user'
)
    PRINT '✅ Foreign Key relation ถูกต้อง';
ELSE
    PRINT '⚠️  ไม่มี Foreign Key relation';

PRINT '';
PRINT '================================================';
PRINT 'เสร็จสิ้นการตรวจสอบ!';
PRINT '================================================';
GO
