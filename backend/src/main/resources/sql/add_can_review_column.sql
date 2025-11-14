-- ============================================
-- เพิ่ม column can_review ในตาราง event_participants
-- ============================================
USE EventDB;
GO

-- เพิ่ม column can_review
IF NOT EXISTS (SELECT * FROM sys.columns
               WHERE object_id = OBJECT_ID(N'[dbo].[event_participants]')
               AND name = 'can_review')
BEGIN
    ALTER TABLE dbo.event_participants
    ADD can_review BIT NOT NULL DEFAULT 0;

    PRINT '✅ Added column can_review to event_participants table';
END
ELSE
BEGIN
    PRINT 'ℹ️  Column can_review already exists';
END
GO

-- อัปเดต participants ที่มีอยู่แล้วให้สามารถรีวิวได้ทั้งหมด (optional)
-- หากต้องการให้เฉพาะคนที่อัปโหลดใหม่เท่านั้น ให้ comment บรรทัดนี้ออก
UPDATE dbo.event_participants
SET can_review = 1
WHERE can_review = 0;

PRINT '✅ Updated existing participants to allow review';
GO

PRINT '';
PRINT '================================================';
PRINT '✅ Migration completed successfully!';
PRINT '================================================';
GO