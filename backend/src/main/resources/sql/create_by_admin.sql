/*==============================================================
  1) Drop default constraint on created_by_admin (if exists)
==============================================================*/
DECLARE @c1 NVARCHAR(128);

SELECT @c1 = df.name
FROM sys.default_constraints df
JOIN sys.columns c
    ON df.parent_object_id = c.object_id
   AND df.parent_column_id = c.column_id
JOIN sys.tables t
    ON t.object_id = c.object_id
WHERE t.name = 'events'
  AND c.name = 'created_by_admin';

IF @c1 IS NOT NULL
BEGIN
    PRINT 'Dropping constraint: ' + @c1;
    EXEC('ALTER TABLE dbo.events DROP CONSTRAINT [' + @c1 + ']');
END;


/*==============================================================
  2) Change created_by_admin to NVARCHAR(200)
==============================================================*/
ALTER TABLE dbo.events
ALTER COLUMN created_by_admin NVARCHAR(200) NULL;



/*==============================================================
  3) Drop default constraint on created_by_faculty (if exists)
==============================================================*/
DECLARE @c2 NVARCHAR(128);

SELECT @c2 = df.name
FROM sys.default_constraints df
JOIN sys.columns c
    ON df.parent_object_id = c.object_id
   AND df.parent_column_id = c.column_id
JOIN sys.tables t
    ON t.object_id = c.object_id
WHERE t.name = 'events'
  AND c.name = 'created_by_faculty';

IF @c2 IS NOT NULL
BEGIN
    PRINT 'Dropping constraint: ' + @c2;
    EXEC('ALTER TABLE dbo.events DROP CONSTRAINT [' + @c2 + ']');
END;


/*==============================================================
  4) Change created_by_faculty to NVARCHAR(200)
==============================================================*/
ALTER TABLE dbo.events
ALTER COLUMN created_by_faculty NVARCHAR(200) NULL;



/*==============================================================
  5) Ensure isPublic exists and is BIT (Boolean)
==============================================================*/
IF NOT EXISTS (
    SELECT * FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_NAME = 'events'
      AND COLUMN_NAME = 'isPublic'
)
BEGIN
    ALTER TABLE dbo.events
    ADD isPublic BIT NOT NULL DEFAULT 0;
END;



/*==============================================================
  6) Ensure tags column exists
==============================================================*/
IF NOT EXISTS (
    SELECT * FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_NAME = 'events'
      AND COLUMN_NAME = 'tags'
)
BEGIN
    ALTER TABLE dbo.events
    ADD tags NVARCHAR(500) NULL;
END;
