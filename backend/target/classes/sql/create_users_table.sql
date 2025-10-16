-- ============================================
-- สร้างตาราง Users สำหรับเก็บข้อมูลผู้ใช้จาก TU API
-- ============================================

USE EventDB;
GO

-- ลบตารางเก่าถ้ามี (ระวัง: จะลบข้อมูลทั้งหมด)
IF OBJECT_ID('dbo.users', 'U') IS NOT NULL
    DROP TABLE dbo.users;
GO

-- สร้างตาราง users
CREATE TABLE dbo.users (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    username NVARCHAR(50) NOT NULL UNIQUE,      -- รหัสนักศึกษา/บุคลากร
    displayname_th NVARCHAR(255) NOT NULL,      -- ชื่อภาษาไทย
    email NVARCHAR(255),                         -- อีเมล์
    faculty NVARCHAR(255),                       -- คณะ
    department NVARCHAR(255),                    -- สาขา/หน่วยงาน
    created_at DATETIME2 DEFAULT GETDATE(),      -- วันที่สร้างบันทึก
    updated_at DATETIME2 DEFAULT GETDATE()       -- วันที่อัพเดทล่าสุด
);
GO

-- สร้าง Index สำหรับค้นหาเร็วขึ้น
CREATE INDEX idx_users_username ON dbo.users(username);
CREATE INDEX idx_users_email ON dbo.users(email);
GO

-- สร้าง Trigger สำหรับอัพเดท updated_at อัตโนมัติ
CREATE TRIGGER trg_users_updated_at
ON dbo.users
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE dbo.users
    SET updated_at = GETDATE()
    FROM dbo.users u
    INNER JOIN inserted i ON u.id = i.id;
END;
GO

PRINT 'Table users created successfully!';
