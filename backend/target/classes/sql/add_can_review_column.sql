-- ============================================
-- เพิ่ม column can_review ในตาราง event_participants
-- และอัปเดตข้อมูลเก่าให้รีวิวได้
-- ============================================
USE EventDB;
GO

PRINT '================================================';
PRINT '▶ Start migration: add [can_review] to [event_participants]';
PRINT '================================================';

------------------------------------------------------
-- 1) เพิ่ม column can_review ถ้ายังไม่มี
------------------------------------------------------
IF COL_LENGTH('dbo.event_participants', 'can_review') IS NULL
BEGIN
    ALTER TABLE dbo.event_participants
    ADD can_review BIT NOT NULL
        CONSTRAINT DF_event_participants_can_review DEFAULT (0);

    PRINT '✅ Added column [can_review] with DEFAULT(0) to [event_participants]';
END
ELSE
BEGIN
    PRINT 'ℹ️  Column [can_review] already exists, skip ADD';
END
GO

------------------------------------------------------
-- 2) อัปเดตข้อมูลเก่าให้สามารถรีวิวได้ทั้งหมด (optional)
--    ถ้าไม่ต้องการให้ทุกคนรีวิวได้ ให้ COMMENT บล็อกนี้ทิ้ง
------------------------------------------------------
IF COL_LENGTH('dbo.event_participants', 'can_review') IS NOT NULL
BEGIN
    UPDATE ep
    SET can_review = 1
    FROM dbo.event_participants ep
    WHERE ep.can_review = 0;

    PRINT '✅ Updated existing participants: set can_review = 1 where it was 0';
END
ELSE
BEGIN
    PRINT '⚠️ Column [can_review] not found, skip UPDATE';
END
GO

PRINT '================================================';
PRINT '✅ Migration completed successfully!';
PRINT '================================================';
GO
