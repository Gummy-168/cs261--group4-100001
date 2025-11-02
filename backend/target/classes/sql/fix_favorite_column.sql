-- Fix Favorite table: Rename activityId to eventId
USE EventDB;
GO

-- Check if the column exists before renaming
IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('dbo.favorites') AND name = 'activityId')
BEGIN
    EXEC sp_rename 'dbo.favorites.activityId', 'eventId', 'COLUMN';
    PRINT '✅ Column renamed from activityId to eventId';
END
ELSE
BEGIN
    PRINT '⚠️ Column activityId does not exist or already renamed';
END
GO

-- Verify the change
SELECT 
    c.name AS ColumnName,
    t.name AS DataType,
    c.max_length AS MaxLength
FROM sys.columns c
INNER JOIN sys.types t ON c.user_type_id = t.user_type_id
WHERE c.object_id = OBJECT_ID('dbo.favorites');
GO
