USE [master]
GO
/****** Object:  Database [EventDB] ******/
IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = N'EventDB')
BEGIN
CREATE DATABASE [EventDB]
 CONTAINMENT = NONE
 ON  PRIMARY
( NAME = N'EventDB', FILENAME = N'/var/opt/mssql/data/EventDB.mdf' , SIZE = 8192KB , MAXSIZE = UNLIMITED, FILEGROWTH = 65536KB )
 LOG ON
( NAME = N'EventDB_log', FILENAME = N'/var/opt/mssql/data/EventDB_log.ldf' , SIZE = 8192KB , MAXSIZE = 2048GB , FILEGROWTH = 65536KB )
 WITH CATALOG_COLLATION = DATABASE_DEFAULT
END
GO

ALTER DATABASE [EventDB] SET COMPATIBILITY_LEVEL = 150
GO
ALTER DATABASE [EventDB] SET ANSI_NULL_DEFAULT OFF
GO
ALTER DATABASE [EventDB] SET ANSI_NULLS OFF
GO
ALTER DATABASE [EventDB] SET ANSI_PADDING OFF
GO
ALTER DATABASE [EventDB] SET ANSI_WARNINGS OFF
GO
ALTER DATABASE [EventDB] SET ARITHABORT OFF
GO
ALTER DATABASE [EventDB] SET AUTO_CLOSE OFF
GO
ALTER DATABASE [EventDB] SET AUTO_SHRINK OFF
GO
ALTER DATABASE [EventDB] SET AUTO_UPDATE_STATISTICS ON
GO
ALTER DATABASE [EventDB] SET CURSOR_CLOSE_ON_COMMIT OFF
GO
ALTER DATABASE [EventDB] SET CURSOR_DEFAULT  GLOBAL
GO
ALTER DATABASE [EventDB] SET CONCAT_NULL_YIELDS_NULL OFF
GO
ALTER DATABASE [EventDB] SET NUMERIC_ROUNDABORT OFF
GO
ALTER DATABASE [EventDB] SET QUOTED_IDENTIFIER OFF
GO
ALTER DATABASE [EventDB] SET RECURSIVE_TRIGGERS OFF
GO
ALTER DATABASE [EventDB] SET  DISABLE_BROKER
GO
ALTER DATABASE [EventDB] SET AUTO_UPDATE_STATISTICS_ASYNC OFF
GO
ALTER DATABASE [EventDB] SET DATE_CORRELATION_OPTIMIZATION OFF
GO
ALTER DATABASE [EventDB] SET TRUSTWORTHY OFF
GO
ALTER DATABASE [EventDB] SET ALLOW_SNAPSHOT_ISOLATION OFF
GO
ALTER DATABASE [EventDB] SET PARAMETERIZATION SIMPLE
GO
ALTER DATABASE [EventDB] SET READ_COMMITTED_SNAPSHOT OFF
GO
ALTER DATABASE [EventDB] SET HONOR_BROKER_PRIORITY OFF
GO
ALTER DATABASE [EventDB] SET RECOVERY FULL
GO
ALTER DATABASE [EventDB] SET  MULTI_USER
GO
ALTER DATABASE [EventDB] SET PAGE_VERIFY CHECKSUM
GO
ALTER DATABASE [EventDB] SET DB_CHAINING OFF
GO
ALTER DATABASE [EventDB] SET FILESTREAM( NON_TRANSACTED_ACCESS = OFF )
GO
ALTER DATABASE [EventDB] SET TARGET_RECOVERY_TIME = 60 SECONDS
GO
ALTER DATABASE [EventDB] SET DELAYED_DURABILITY = DISABLED
GO
ALTER DATABASE [EventDB] SET ACCELERATED_DATABASE_RECOVERY = OFF
GO
ALTER DATABASE [EventDB] SET QUERY_STORE = OFF
GO
USE [EventDB]
GO

/*******************************************************************************
 * Drop existing objects if they exist to ensure clean slate for new schema
 *******************************************************************************/

-- Drop Procedures
IF OBJECT_ID('[dbo].[sp_CheckParticipantApproval]', 'P') IS NOT NULL DROP PROCEDURE [dbo].[sp_CheckParticipantApproval];
IF OBJECT_ID('[dbo].[sp_CountParticipants]', 'P') IS NOT NULL DROP PROCEDURE [dbo].[sp_CountParticipants];
IF OBJECT_ID('[dbo].[sp_GetAllEvents]', 'P') IS NOT NULL DROP PROCEDURE [dbo].[sp_GetAllEvents];
IF OBJECT_ID('[dbo].[sp_GetEventParticipants]', 'P') IS NOT NULL DROP PROCEDURE [dbo].[sp_GetEventParticipants];
IF OBJECT_ID('[dbo].[sp_GetEventsByCategory]', 'P') IS NOT NULL DROP PROCEDURE [dbo].[sp_GetEventsByCategory];
IF OBJECT_ID('[dbo].[sp_IsAdmin]', 'P') IS NOT NULL DROP PROCEDURE [dbo].[sp_IsAdmin];

-- Drop Functions
IF OBJECT_ID('[dbo].[fn_IsParticipantApproved]', 'FN') IS NOT NULL DROP FUNCTION [dbo].[fn_IsParticipantApproved];

-- Drop Views
IF OBJECT_ID('[dbo].[vw_OpenEvents]', 'V') IS NOT NULL DROP VIEW [dbo].[vw_OpenEvents];
IF OBJECT_ID('[dbo].[vw_EventStatistics]', 'V') IS NOT NULL DROP VIEW [dbo].[vw_EventStatistics];
IF OBJECT_ID('[dbo].[vw_ParticipantsWithEventDetails]', 'V') IS NOT NULL DROP VIEW [dbo].[vw_ParticipantsWithEventDetails];
IF OBJECT_ID('[dbo].[vw_EventParticipantStatistics]', 'V') IS NOT NULL DROP VIEW [dbo].[vw_EventParticipantStatistics];

-- Drop Tables (Order matters due to foreign keys)
IF OBJECT_ID('[dbo].[notification_queue]', 'U') IS NOT NULL DROP TABLE [dbo].[notification_queue];
IF OBJECT_ID('[dbo].[login_history]', 'U') IS NOT NULL DROP TABLE [dbo].[login_history];
IF OBJECT_ID('[dbo].[favorites]', 'U') IS NOT NULL DROP TABLE [dbo].[favorites];
IF OBJECT_ID('[dbo].[event_participants]', 'U') IS NOT NULL DROP TABLE [dbo].[event_participants];
IF OBJECT_ID('[dbo].[event_feedbacks]', 'U') IS NOT NULL DROP TABLE [dbo].[event_feedbacks];
IF OBJECT_ID('[dbo].[admins]', 'U') IS NOT NULL DROP TABLE [dbo].[admins];
IF OBJECT_ID('[dbo].[events]', 'U') IS NOT NULL DROP TABLE [dbo].[events];
IF OBJECT_ID('[dbo].[users]', 'U') IS NOT NULL DROP TABLE [dbo].[users];

GO

/*******************************************************************************
 * Create Tables
 *******************************************************************************/

SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

-- 1. Users Table
CREATE TABLE [dbo].[users](
	[id] [bigint] IDENTITY(1,1) NOT NULL,
	[username] [nvarchar](50) NOT NULL,
	[displayname_th] [nvarchar](100) NOT NULL, -- Matches @Column(name = "displayname_th")
	[email] [nvarchar](255) NULL,
	[faculty] [nvarchar](100) NULL,
	[department] [nvarchar](100) NULL,
	[theme] [varchar](20) DEFAULT 'light',
	[created_at] [datetime2](7) NULL, -- Matches @Column(name = "created_at")
	[updated_at] [datetime2](7) NULL, -- Matches @Column(name = "updated_at")
PRIMARY KEY CLUSTERED ([id] ASC),
UNIQUE NONCLUSTERED ([username] ASC)
) ON [PRIMARY]
GO

-- 2. Events Table
CREATE TABLE [dbo].[events](
	[id] [bigint] IDENTITY(1,1) NOT NULL,
	[title] [nvarchar](200) NOT NULL,
	[description] [nvarchar](2000) NULL,
	[location] [nvarchar](300) NULL,
	[startTime] [datetime2](7) NOT NULL, -- Matches @Column(name = "startTime")
	[endTime] [datetime2](7) NULL,        -- Matches @Column(name = "endTime")
	[category] [nvarchar](100) NULL,
	[organizer] [nvarchar](200) NULL,
	[maxCapacity] [int] NULL,             -- Matches @Column(name = "maxCapacity")
	[currentParticipants] [int] DEFAULT 0, -- Matches @Column(name = "currentParticipants")
	[status] [nvarchar](50) DEFAULT 'OPEN',
	[fee] [float] DEFAULT 0.0,
	[imageUrl] [nvarchar](500) NULL,      -- Matches @Column(name = "imageUrl")
	[created_by_admin] [nvarchar](200) NULL,   -- Matches @Column(name = "created_by_admin")
	[created_by_faculty] [nvarchar](200) NULL, -- Matches @Column(name = "created_by_faculty")
	[view_count] [int] NULL,               -- Matches @Column(name = "view_count")
	[tags] [nvarchar](500) NULL,
	[isPublic] [bit] DEFAULT 0,            -- Matches @Column(name = "isPublic")
PRIMARY KEY CLUSTERED ([id] ASC)
) ON [PRIMARY]
GO

-- 3. Admins Table
CREATE TABLE [dbo].[admins](
	[id] [bigint] IDENTITY(1,1) NOT NULL,
	[username] [nvarchar](50) NOT NULL,
	[displayName] [nvarchar](1000) NULL,   -- Unified to match Java field name
	[email] [nvarchar](255) NULL,
	[password] [nvarchar](255) NULL,
	[role] [nvarchar](100) DEFAULT 'ADMIN',
	[faculty] [nvarchar](100) NULL,
	[is_active] [bit] DEFAULT 1,           -- Matches @Column(name = "is_active")
	[created_at] [datetime2](7) DEFAULT GETDATE(),
	[updated_at] [datetime2](7) DEFAULT GETDATE(),
	[created_by] [nvarchar](50) NULL,      -- Matches @Column(name = "created_by")
	[last_login] [datetime2](7) NULL,      -- Matches @Column(name = "last_login")
PRIMARY KEY CLUSTERED ([id] ASC),
UNIQUE NONCLUSTERED ([username] ASC)
) ON [PRIMARY]
GO

-- 4. Favorites Table (FIXED: Matches @UniqueConstraint(columnNames = {"userId", "eventId"}))
CREATE TABLE [dbo].[favorites](
	[id] [bigint] IDENTITY(1,1) NOT NULL,
	[userId] [bigint] NOT NULL,
	[eventId] [bigint] NOT NULL,
PRIMARY KEY CLUSTERED ([id] ASC),
CONSTRAINT [UK_Favorites_User_Event] UNIQUE NONCLUSTERED ([userId] ASC, [eventId] ASC)
) ON [PRIMARY]
GO

-- 5. Event Feedbacks Table
CREATE TABLE [dbo].[event_feedbacks](
	[id] [bigint] IDENTITY(1,1) NOT NULL,
	[event_id] [bigint] NOT NULL,         -- Matches @Column(name = "event_id")
	[username] [nvarchar](50) NOT NULL,
	[comment] [nvarchar](2000) NULL,
	[rating] [int] NULL CHECK ([rating]>=(1) AND [rating]<=(5)),
	[is_edited] [bit] DEFAULT 0,          -- Matches @Column(name = "is_edited")
	[created_at] [datetime2](7) DEFAULT GETDATE(),
	[updated_at] [datetime2](7) DEFAULT GETDATE(),
PRIMARY KEY CLUSTERED ([id] ASC),
CONSTRAINT [UK_Feedback_Event_User] UNIQUE NONCLUSTERED ([event_id] ASC, [username] ASC)
) ON [PRIMARY]
GO

-- 6. Event Participants Table
CREATE TABLE [dbo].[event_participants](
	[id] [bigint] IDENTITY(1,1) NOT NULL,
	[event_id] [bigint] NOT NULL,         -- Matches @Column(name = "event_id")
	[username] [nvarchar](50) NOT NULL,
	[student_name] [nvarchar](255) NULL,  -- Matches @Column(name = "student_name")
	[email] [nvarchar](255) NULL,
	[approved_at] [datetime2](7) NULL,    -- Matches @Column(name = "approved_at")
	[approved_by] [nvarchar](50) NULL,    -- Matches @Column(name = "approved_by")
	[can_review] [bit] NOT NULL DEFAULT 0,-- Matches @Column(name = "can_review")
	[created_at] [datetime2](7) DEFAULT GETDATE(),
PRIMARY KEY CLUSTERED ([id] ASC),
CONSTRAINT [UK_Participant_Event_User] UNIQUE NONCLUSTERED ([event_id] ASC, [username] ASC)
) ON [PRIMARY]
GO

-- 7. Notification Queue Table
CREATE TABLE [dbo].[notification_queue](
	[id] [bigint] IDENTITY(1,1) NOT NULL,
	[user_id] [bigint] NOT NULL,          -- Matches @Column(name = "user_id")
	[event_id] [bigint] NOT NULL,         -- Matches @Column(name = "event_id")
	[send_at] [datetime2](7) NOT NULL,    -- Matches @Column(name = "send_at")
	[status] [nvarchar](20) NOT NULL DEFAULT 'PENDING',
	[created_at] [datetime2](7) DEFAULT GETDATE(),
	[updated_at] [datetime2](7) DEFAULT GETDATE(),
PRIMARY KEY CLUSTERED ([id] ASC)
) ON [PRIMARY]
GO

-- 8. Login History Table
CREATE TABLE [dbo].[login_history](
	[id] [bigint] IDENTITY(1,1) NOT NULL,
	[user_id] [bigint] NULL,              -- Matches @Column(name = "user_id")
	[username] [nvarchar](50) NOT NULL,
	[login_time] [datetime2](7) DEFAULT GETDATE(), -- Matches @Column(name = "login_time")
	[ip_address] [nvarchar](50) NULL,     -- Matches @Column(name = "ip_address")
	[status] [nvarchar](20) DEFAULT 'SUCCESS',
PRIMARY KEY CLUSTERED ([id] ASC)
) ON [PRIMARY]
GO

/*******************************************************************************
 * Foreign Keys
 *******************************************************************************/

ALTER TABLE [dbo].[favorites]  WITH CHECK ADD  CONSTRAINT [FK_favorites_event] FOREIGN KEY([eventId])
REFERENCES [dbo].[events] ([id])
ON DELETE CASCADE
GO
ALTER TABLE [dbo].[favorites] CHECK CONSTRAINT [FK_favorites_event]
GO
ALTER TABLE [dbo].[favorites]  WITH CHECK ADD  CONSTRAINT [FK_favorites_user] FOREIGN KEY([userId])
REFERENCES [dbo].[users] ([id])
ON DELETE CASCADE
GO
ALTER TABLE [dbo].[favorites] CHECK CONSTRAINT [FK_favorites_user]
GO

ALTER TABLE [dbo].[event_feedbacks]  WITH CHECK ADD  CONSTRAINT [FK_feedback_event] FOREIGN KEY([event_id])
REFERENCES [dbo].[events] ([id])
ON DELETE CASCADE
GO
ALTER TABLE [dbo].[event_feedbacks] CHECK CONSTRAINT [FK_feedback_event]
GO

ALTER TABLE [dbo].[event_participants]  WITH CHECK ADD  CONSTRAINT [FK_participant_event] FOREIGN KEY([event_id])
REFERENCES [dbo].[events] ([id])
ON DELETE CASCADE
GO
ALTER TABLE [dbo].[event_participants] CHECK CONSTRAINT [FK_participant_event]
GO

ALTER TABLE [dbo].[notification_queue]  WITH CHECK ADD  CONSTRAINT [FK_notification_queue_event] FOREIGN KEY([event_id])
REFERENCES [dbo].[events] ([id])
ON DELETE CASCADE
GO
ALTER TABLE [dbo].[notification_queue] CHECK CONSTRAINT [FK_notification_queue_event]
GO
ALTER TABLE [dbo].[notification_queue]  WITH CHECK ADD  CONSTRAINT [FK_notification_queue_user] FOREIGN KEY([user_id])
REFERENCES [dbo].[users] ([id])
ON DELETE CASCADE
GO
ALTER TABLE [dbo].[notification_queue] CHECK CONSTRAINT [FK_notification_queue_user]
GO

ALTER TABLE [dbo].[login_history]  WITH CHECK ADD  CONSTRAINT [FK_login_history_user] FOREIGN KEY([user_id])
REFERENCES [dbo].[users] ([id])
ON DELETE SET NULL
GO
ALTER TABLE [dbo].[login_history] CHECK CONSTRAINT [FK_login_history_user]
GO

/*******************************************************************************
 * Insert Data
 *******************************************************************************/
-- Users
SET IDENTITY_INSERT [dbo].[users] ON
INSERT [dbo].[users] ([id], [username], [displayname_th], [email], [faculty], [department], [created_at], [updated_at], [theme]) VALUES (2, N'6709490038', N'ฑีฆายุ ด้วงใส', N'teekayu.dua@dome.tu.ac.th', N'คณะวิทยาศาสตร์และเทคโนโลยี', N'ภาควิชาวิทยาการคอมพิวเตอร์', CAST(N'2025-11-16T23:43:35.7800470' AS DateTime2), CAST(N'2025-11-16T20:14:31.4900000' AS DateTime2), N'light')
SET IDENTITY_INSERT [dbo].[users] OFF
GO

-- Admins (Unified displayName)
SET IDENTITY_INSERT [dbo].[admins] ON
INSERT [dbo].[admins] ([id], [username], [displayName], [email], [role], [is_active], [created_at], [created_by], [updated_at], [faculty], [last_login], [password]) VALUES (1, N'6414421234', N'นายผู้ดูแล ระบบ', N'admin@tu.ac.th', N'SUPER_ADMIN', 1, CAST(N'2025-11-15T05:13:32.2066667' AS DateTime2), N'system', CAST(N'2025-11-17T02:37:05.7050340' AS DateTime2), NULL, CAST(N'2025-11-17T02:37:05.6852230' AS DateTime2), N'12345')
INSERT [dbo].[admins] ([id], [username], [displayName], [email], [role], [is_active], [created_at], [created_by], [updated_at], [faculty], [last_login], [password]) VALUES (2, N'6414421235', N'นางสาวผู้ช่วย ระบบ', N'assistant@tu.ac.th', N'ADMIN', 1, CAST(N'2025-11-15T05:13:32.2066667' AS DateTime2), N'system', CAST(N'2025-11-15T05:13:32.2066667' AS DateTime2), NULL, NULL, NULL)
SET IDENTITY_INSERT [dbo].[admins] OFF
GO

-- Events
SET IDENTITY_INSERT [dbo].[events] ON
INSERT [dbo].[events] ([id], [title], [description], [location], [startTime], [endTime], [imageUrl], [category], [tags], [maxCapacity], [currentParticipants], [status], [organizer], [fee], [created_by_admin], [created_by_faculty], [isPublic]) VALUES (22, N'Scitu Video Contest', N'รอกันนานมั้ยยย…ในที่สุดก็มาแล้ว! 🤩
รายละเอียดการประกวดคลิปสุดเจ๋ง Scitu Video Contest พร้อมเปิดตัวแล้ว! 🌟

✨ ชิงรางวัลรวมกว่า 120,000 บาท 💰
พร้อม เกียรติบัตรสุดพิเศษ สำหรับผู้ชนะทุกประเภท 🏆

📅 ระยะเวลาส่งคลิป
1 - 20 ตุลาคม 2568

🔥 เตรียมกล้องให้พร้อม เก็บไอเดียให้แน่น แล้วมาปล่อยของกัน!
ครั้งนี้ใครจะคว้ารางวัลใหญ่…ต้องติดตาม! 🎬

⸻

📌 สอบถามเพิ่มเติมได้ที่
Facebook : คณะกรรมการนักศึกษา คณะวิทยาศาสตร์และเทคโนโลยี - กน.วท มหาวิทยาลัยธรรมศาสตร์
IG : vidya.tu', N'LC2', CAST(N'2025-10-01T00:01:00.0000000' AS DateTime2), CAST(N'2025-10-31T23:55:00.0000000' AS DateTime2), N'/images/events/vidya.png ', N'คณะวิทยาศาสตร์', N'บันเทิง', NULL, 0, N'OPEN', NULL, 0.0, NULL, NULL, 1)

INSERT [dbo].[events] ([id], [title], [description], [location], [startTime], [endTime], [imageUrl], [category], [tags], [maxCapacity], [currentParticipants], [status], [organizer], [fee], [created_by_admin], [created_by_faculty], [isPublic]) VALUES (23, N'ห้องเรียนจำลอง', N'เปิดรับสมัคร 📨 ‘ ห้องเรียนจำลอง ‘ โครงการรัฐศาสตร์วิชาการ ครั้งที่ 33 📮

เปิดประสบการณ์การเรียนการสอนจากอาจารย์ประจำคณะรัฐศาสตร์ในทั้ง 3 สาขาวิชา

📍สมัครได้ตั้งแต่วันที่ 8 ต.ค. - 22 ต.ค.
‼️รับจำนวนจำกัด‼️หากเต็มแล้วปิดรับทันที

🗓️ พบกัน วันที่ 7 พฤศจิกายน 2568
เวลา 11:30 น. - 15:30 น.
ณ ร.402 ชั้น 4 ตึกคณะรัฐศาสตร์ การเมืองการปกครอง (GOV) : https://forms.gle/vVhgtKUobFCFaS5m8

การระหว่างประเทศ (IA) : https://docs.google.com/forms/d/e/1FAIpQLSfNsHAe0hkKSGBPmCcASCKI1FhgDzUbo4_FgWN52zymV4Am9w/viewform?usp=share_link&ouid=110812500263153260642

บริหารรัฐกิจ (PA) : https://docs.google.com/forms/d/e/1FAIpQLSfFMNLrgBKZMWtv_VXKGVC6FDlwkx2eKwRRrH48Fr1m1ZRjrA/viewform?usp=share_link&ouid=110812500263153260642', N'ร.402 ชั้น 4 ตึกคณะรัฐศาสตร์', CAST(N'2025-10-08T00:01:00.0000000' AS DateTime2), CAST(N'2025-10-22T23:55:00.0000000' AS DateTime2), N'/images/events/polsci.png', N'คณะรัฐศาสตร์', N'วิชาการ', NULL, 0, N'OPEN', NULL, 0.0, NULL, NULL, 1)

INSERT [dbo].[events] ([id], [title], [description], [location], [startTime], [endTime], [imageUrl], [category], [tags], [maxCapacity], [currentParticipants], [status], [organizer], [fee], [created_by_admin], [created_by_faculty], [isPublic]) VALUES (24, N'Thammasat openhouse', N'เปิดบ้านธรรมศาสตร์:', N'Thammasat', CAST(N'2025-11-07T02:00:00.0000000' AS DateTime2), CAST(N'2025-11-08T23:55:00.0000000' AS DateTime2), N'/images/events/openhouse.png', N'ธรรมศาสตร์ ศูนย์รังสิต', N'วิชาการ', NULL, 12, N'OPEN', NULL, 0.0, NULL, NULL, 1)

INSERT [dbo].[events] ([id], [title], [description], [location], [startTime], [endTime], [imageUrl], [category], [tags], [maxCapacity], [currentParticipants], [status], [organizer], [fee], [created_by_admin], [created_by_faculty], [isPublic]) VALUES (29, N'TU Folksong Audition 2025', N'มาแล้วลูกจ๋า TU Folksong Audition 2025 ที่หนูอยากได้

เรามาเสิร์ฟแล้วว สำหรับฟอร์มการลงทะเบียนออดิชัน พร้อมตารางวันออดิชันของทั้งนักร้อง และนักดนตรี ที่สนใจจะมาเป็น TU Folksong 2025✨✨✨

รายละเอียดเพิ่มเติม สำหรับนักร้องและนักดนตรี สามารถดูได้ที่หน้าอินสตาแกรมของพวกเรา หรือรายละเอียดใน Google Forms การลงทะเบียนได้เลยยย !

หากมีข้อสงสัย อยากสอบถามเพิ่มเติม สามารถสแกน QR Code เพื่อเข้า Line Openchat สำหรับ TU Folksong Audition 2025 มาสอบถามพูดคุยกับแอดมินกันได้เลยย
‼️ ไม่แนะนำให้ถามในแพลตฟอร์มอื่น เพื่อให้แอดมินไม่พลาดคำถามไหนไปน้าา

**สำหรับนักดนตรีที่สนใจออดิชันมากกว่า 1 พาร์ต สามารถกรอกฟอร์มซ้ำและเลือกพาร์ตที่ต้องการได้เลยย

อย่าลืมมาสมัคร และเคลียร์เวลาว่างของทุกคนไว้ให้ดี แล้วมาเจอกันนนน 🎶🔥', N'ตึกกิจกรรม', CAST(N'2025-08-03T00:01:00.0000000' AS DateTime2), CAST(N'2025-08-10T23:55:00.0000000' AS DateTime2), N'/images/events/Folksong.png', N'TU Folksong', N'บันเทิง', NULL, 12, N'OPEN', NULL, 0.0, NULL, NULL, 1)

INSERT [dbo].[events] ([id], [title], [description], [location], [startTime], [endTime], [imageUrl], [category], [tags], [maxCapacity], [currentParticipants], [status], [organizer], [fee], [created_by_admin], [created_by_faculty], [isPublic]) VALUES (34, N'MC of Thammasat รุ่นถัดไป', N'เสริฟแล้ววสำหรับกำหนดการการเฟ้นหาพิธิกรแห่งมหาวิทยาลัยธรรมศาสตร์ MC of Thammasat รุ่นถัดไป รายละเอียดกำหนดการ
✶ 20 สิงหาคม 2568: First Meet MC of Thammasat
สถานที่: อาคารเรียนรวมสังคมศาสตร์ 3 หรือ SC3 มหาวิทยาลัยธรรมศาสตร์ ศูนย์รังสิต

✶ 21-23 สิงหาคม 2568: First Audition
วันที่ 21 สิงหาคม 2568 ณ อาคารกิจกรรมนักศึกษา มหาวิทยาลัยธรรมศาสตร์ ท่าพระจันทร์
วันที่ 22-23 สิงหาคม 2568 ณ อาคารปิยชาติ 2 มหาวิทยาลัยธรรมศาสตร์ ศูนย์รังสิต

✶ 26-28 สิงหาคม 2568: Semi-Finalists Workshop
สถานที่: อาคารเรียนรวมสังคมศาสตร์ 3 หรือ SC3 มหาวิทยาลัยธรรมศาสตร์ ศูนย์รังสิต

✶ 30 สิงหาคม - 6 กันยายน 2568: Finalists Workshop
สถานที่: อาคารเรียนรวมสังคมศาสตร์ 3 หรือ SC3 มหาวิทยาลัยธรรมศาสตร์ ศูนย์รังสิต

✶ 9 สิงหาคม 2568: Final Audition
สถานที่: อุทยานการเรียนรู้ป๋วย 100 ปี มหาวิทยาลัยธรรมศาสตร์ ศูนย์รังสิต

🗓เปิดรับสมัครแล้ว ตั้งแต่วันนี้ – 20 สิงหาคม 2568
🔗โดยสามารถสมัครได้ที่: https://docs.google.com/forms/d/e/1FAIpQLSdviRSnRWJ-19bAw4eUNB0apk7x0pCeGv-EuQkhs8NbHMRlGA/viewform', N'อาคารเรียนรวมสังคมศาสตร์ 3 หรือ SC3 มหาวิทยาลัยธรรมศาสตร์ ศูนย์รังสิต', CAST(N'2025-08-07T00:01:00.0000000' AS DateTime2), CAST(N'2025-08-20T23:55:00.0000000' AS DateTime2), N'/images/events/MCthammasat.png ', N'MC of Thammasat', N'วิชาการ,บันเทิง,พัฒนาตน,อาสา', NULL, 0, N'OPEN', NULL, 0.0, NULL, NULL, 1)

INSERT [dbo].[events] ([id], [title], [description], [location], [startTime], [endTime], [imageUrl], [category], [tags], [maxCapacity], [currentParticipants], [status], [organizer], [fee], [created_by_admin], [created_by_faculty], [isPublic]) VALUES (35, N'เชียงรากแฟร์ เอ็กซ์โป', N'เปิดคัดเลือกรอบ2 🎉✨️ รับสมัครร้านค้าโซนนักศึกษาธรรมศาสตร์ ในงานเชียงรากเอ็กซ์โป 13-26 ต.ค. 68 นี้ เทศกาลสตรีทฟู้ดและดนตรี ที่ธรรมศาสตร์รังสิต บริเวณเชียงรากมาร์เก็ต(ตลาดนัดเชียงราก) - ลานพญานาค

สมัครได้แล้ววันนี้ จนกว่าจะเต็ม❤️', N'บริเวณเชียงรากมาร์เก็ต(ตลาดนัดเชียงราก) - ลานพญานาค', CAST(N'2025-10-13T00:01:00.0000000' AS DateTime2), CAST(N'2025-10-26T23:55:00.0000000' AS DateTime2), N'/images/events/Expo.png ', N'thammasatmarket', N'บันเทิง', NULL, 12, N'OPEN', NULL, 0.0, NULL, NULL, 1)

INSERT [dbo].[events] ([id], [title], [description], [location], [startTime], [endTime], [imageUrl], [category], [tags], [maxCapacity], [currentParticipants], [status], [organizer], [fee], [created_by_admin], [created_by_faculty], [isPublic]) VALUES (36, N'ThammasatxKhonkaen Camp', N'✨ฮ๊ายฮายยวันนี้น้องตุ๊กจะมาบอกความลับ (ที่ไม่ลับ)
❗️ค่ายสานฝันน้องกับเพื่อนพ้องลูกแม่โดม ครั้งที่ 15 เปิดรับสตาฟอย่างเป็นทางการครบทุกฝ่ายแล้วเด้อออ❗️

เปิดรับสมัครสตาฟค่าย
1.👶🏻 ฝ่ายพี่เลี้ยง
2.📸 ฝ่ายประชาสัมพันธ์และโสตฯ
3.💡 ฝ่าย content creator
4.📦 ฝ่ายพัสดุและอุปกรณ์
5.🏡 ฝ่ายสถานที่
6.🍱 ฝ่ายสวัสดิการ
7.🎟️ ฝ่ายสปอนเซอร์
8.💻 ฝ่ายทะเบียน
9.📚 ฝ่ายวิชาการ

🌟เปิดรับสมัครตั้งแต่ วันที่ 1 - 13 สิงหาคม 2568 ถึงเวลา 23.59 น.⚠️
🌟ประกาศรายชื่อผู้มีสิทธิสัมภาษณ์ วันที่ 16 สิงหาคม 2568
🌟สัมภาษณ์ รายละเอียดเวลาและสถานที่จะแจ้งให้ทราบในภายหลัง

🙌🏻หากมีการเปลี่ยนแปลงจะแจ้งให้ทราบในภายหลัง

**ผู้ที่ผ่านการสัมภาษณ์ จะต้องมีการชำระค่าสวัสดิการสตาฟบางส่วน**

ติดตามข่าวสารได้ทาง🔽
IG : tukk15thcamp
Facebook : ค่ายสานฝันน้องกับเพื่อนพ้องลูกแม่โดม

มาร่วมเป็นส่วนหนึ่งไปกับค่าย TUKK 15 กันน้าา♥️', N'ขอนแก่น', CAST(N'2025-08-01T00:01:00.0000000' AS DateTime2), CAST(N'2025-08-15T23:00:00.0000000' AS DateTime2), N'/images/events/KK.png ', N'tukk15thcamp', N'อาสา,พัฒนาตน,บันเทิง', NULL, 12, N'OPEN', NULL, 0.0, NULL, NULL, 1)

INSERT [dbo].[events] ([id], [title], [description], [location], [startTime], [endTime], [imageUrl], [category], [tags], [maxCapacity], [currentParticipants], [status], [organizer], [fee], [created_by_admin], [created_by_faculty], [isPublic]) VALUES (42, N'ค่ายธรรมศาสตร์เชียงใหม่', N'🌟 ว้าว ว้าว ว้าว ใกล้เข้ามาแล้วกับค่ายธรรมศาสตร์ - เชียงใหม่ครั้งที่ 1 👀

🔖 ครั้งแรกที่ชาวธรรมศาสตร์จะขึ้นเหนือไปแนะแนวเพื่อน ๆ ชาวภาคเหนือที่สนใจและอยากก้าวเข้าสู่รั้วเหลือง - แดงไปกับพวกเรา 🤟🏻

และในครั้งนี้พวกเราจะมาในคอนเซ็ปต์อะไรกันน้า ❔ รอติดตามชมได้เลย 💨

ครั้งแรก ครั้งยิ่งใหญ่ ครั้งนี้พลาดไม่ได้
เตรียมตัวให้พร้อม แล้วจะได้ปะกั๋นเร็ว ๆ นี้เน้อเจ้า ⛰️🌿', N'เชียงใหม่', CAST(N'2025-12-14T00:00:00.0000000' AS DateTime2), CAST(N'2025-12-28T17:00:00.0000000' AS DateTime2), N'/images/events/TUCM.jpg', N'TUCM', N'อาสา,พัฒนาตน,บันเทิง', 40, 40, N'CLOSED', N'TUCM', 0, NULL, NULL, 1)
SET IDENTITY_INSERT [dbo].[events] OFF
GO

-- Event Feedbacks
SET IDENTITY_INSERT [dbo].[event_feedbacks] ON
INSERT [dbo].[event_feedbacks] ([id], [event_id], [username], [rating], [comment], [created_at], [is_edited], [updated_at]) VALUES (6, 24, N'เซฟซ่า098', 5, N'สนุกมากเลยค้าบ กิจกรรมมากมาย', CAST(N'2025-11-16T17:05:31.3800000' AS DateTime2), 0, NULL)
INSERT [dbo].[event_feedbacks] ([id], [event_id], [username], [rating], [comment], [created_at], [is_edited], [updated_at]) VALUES (7, 24, N'วิท', 5, N'ได้ความรู้เยอะมาก', CAST(N'2025-11-16T19:16:02.5033333' AS DateTime2), 0, NULL)
INSERT [dbo].[event_feedbacks] ([id], [event_id], [username], [rating], [comment], [created_at], [is_edited], [updated_at]) VALUES (8, 24, N'ตี้ตีั', 1, N'รถโครตติดเลย อยากให้ปรับปรุงเยอะๆนะครับมอตั้งใหญ่ การบริหารไม่ดีเลย', CAST(N'2025-11-08T12:00:00.0000000' AS DateTime2), 0, NULL)
INSERT [dbo].[event_feedbacks] ([id], [event_id], [username], [rating], [comment], [created_at], [is_edited], [updated_at]) VALUES (11, 24, N'SafeSQL', 4, N'โดยรวมดีครับ แต่แอร์หนาวไปหน่อย', CAST(N'2025-11-17T01:00:00.0000000' AS DateTime2), 0, NULL)
INSERT [dbo].[event_feedbacks] ([id], [event_id], [username], [rating], [comment], [created_at], [is_edited], [updated_at]) VALUES (12, 22, N'Titi_Dev', 5, N'กิจกรรมดีมากครับ เนื้อหาแน่น!', CAST(N'2025-11-10T09:15:00.0000000' AS DateTime2), 0, NULL)
INSERT [dbo].[event_feedbacks] ([id], [event_id], [username], [rating], [comment], [created_at], [is_edited], [updated_at]) VALUES (13, 22, N'AongSama', 2, N'คนเยอะไปหน่อยครับ ดูวุ่นวาย', CAST(N'2025-11-10T10:30:00.0000000' AS DateTime2), 0, NULL)
INSERT [dbo].[event_feedbacks] ([id], [event_id], [username], [rating], [comment], [created_at], [is_edited], [updated_at]) VALUES (14, 23, N'RinRacer', 4, N'สนุกดีครับ แต่เวลาสั้นไปนิด', CAST(N'2025-10-20T14:00:00.0000000' AS DateTime2), 0, NULL)
INSERT [dbo].[event_feedbacks] ([id], [event_id], [username], [rating], [comment], [created_at], [is_edited], [updated_at]) VALUES (15, 35, N'PhuMaster', 3, N'เฉยๆ ครับ พอดูได้', CAST(N'2025-11-08T11:00:00.0000000' AS DateTime2), 0, NULL)
INSERT [dbo].[event_feedbacks] ([id], [event_id], [username], [rating], [comment], [created_at], [is_edited], [updated_at]) VALUES (16, 35, N'Titi_Dev', 3, N'รอบที่แล้วดีกว่านี้ครับ', CAST(N'2025-11-09T10:00:00.0000000' AS DateTime2), 0, NULL)
INSERT [dbo].[event_feedbacks] ([id], [event_id], [username], [rating], [comment], [created_at], [is_edited], [updated_at]) VALUES (17, 29, N'PangPang', 5, N'ประทับใจมากค่ะ ทีมงานดูแลดีสุดๆ', CAST(N'2025-09-10T16:00:00.0000000' AS DateTime2), 0, NULL)
INSERT [dbo].[event_feedbacks] ([id], [event_id], [username], [rating], [comment], [created_at], [is_edited], [updated_at]) VALUES (18, 34, N'A-care_Code', 1, N'มีปัญหาเทคนิคเยอะมาก เสียเวลา', CAST(N'2025-08-10T12:00:00.0000000' AS DateTime2), 0, NULL)
INSERT [dbo].[event_feedbacks] ([id], [event_id], [username], [rating], [comment], [created_at], [is_edited], [updated_at]) VALUES (19, 34, N'WitWizard', 5, N'พิธีกรเก่งมากครับ เอาอยู่', CAST(N'2025-08-10T12:05:00.0000000' AS DateTime2), 0, NULL)
INSERT [dbo].[event_feedbacks] ([id], [event_id], [username], [rating], [comment], [created_at], [is_edited], [updated_at]) VALUES (20, 36, N'WitWizard', 5, N'สุดยอดครับ ได้ความรู้เยอะเลย', CAST(N'2025-08-15T17:00:00.0000000' AS DateTime2), 0, NULL)
INSERT [dbo].[event_feedbacks] ([id], [event_id], [username], [rating], [comment], [created_at], [is_edited], [updated_at]) VALUES (21, 42, N'BonusHunter', 2, N'อาหารเที่ยงไม่อร่อยเลยค่ะ', CAST(N'2025-12-15T13:00:00.0000000' AS DateTime2), 0, NULL)
INSERT [dbo].[event_feedbacks] ([id], [event_id], [username], [rating], [comment], [created_at], [is_edited], [updated_at]) VALUES (22, 42, N'SafeSQL', 5, N'เป็นค่ายที่ดีมากๆ ครับ น้องๆ ได้แรงบันดาลใจเยอะ', CAST(N'2025-12-15T15:00:00.0000000' AS DateTime2), 0, NULL)
SET IDENTITY_INSERT [dbo].[event_feedbacks] OFF
GO

-- Event Participants
SET IDENTITY_INSERT [dbo].[event_participants] ON
INSERT [dbo].[event_participants] ([id], [event_id], [username], [student_name], [email], [approved_at], [approved_by], [created_at], [can_review]) VALUES (9, 24, N'6709616780', N'Somchai Sukjai', N'somchai.s@dome.tu.ac.th', CAST(N'2025-11-17T01:30:25.1322370' AS DateTime2), N'admin@tu.ac.th', CAST(N'2025-11-17T01:30:25.1322370' AS DateTime2), 1)
INSERT [dbo].[event_participants] ([id], [event_id], [username], [student_name], [email], [approved_at], [approved_by], [created_at], [can_review]) VALUES (10, 24, N'6709616781', N'Siriwan Thongdee', N'siriwan.t@dome.tu.ac.th', CAST(N'2025-11-17T01:30:25.1745890' AS DateTime2), N'admin@tu.ac.th', CAST(N'2025-11-17T01:30:25.1745890' AS DateTime2), 1)
INSERT [dbo].[event_participants] ([id], [event_id], [username], [student_name], [email], [approved_at], [approved_by], [created_at], [can_review]) VALUES (11, 24, N'6709616782', N'Pongsakorn Rattana', N'pongsakorn.r@dome.tu.ac.th', CAST(N'2025-11-17T01:30:25.1767000' AS DateTime2), N'admin@tu.ac.th', CAST(N'2025-11-17T01:30:25.1767000' AS DateTime2), 1)
INSERT [dbo].[event_participants] ([id], [event_id], [username], [student_name], [email], [approved_at], [approved_by], [created_at], [can_review]) VALUES (12, 24, N'6709616783', N'Nutchanat Pimjai', N'nutchanat.p@dome.tu.ac.th', CAST(N'2025-11-17T01:30:25.1782730' AS DateTime2), N'admin@tu.ac.th', CAST(N'2025-11-17T01:30:25.1782730' AS DateTime2), 1)
INSERT [dbo].[event_participants] ([id], [event_id], [username], [student_name], [email], [approved_at], [approved_by], [created_at], [can_review]) VALUES (13, 24, N'6709616784', N'Thanawat Kaewkham', N'thanawat.k@dome.tu.ac.th', CAST(N'2025-11-17T01:30:25.1808880' AS DateTime2), N'admin@tu.ac.th', CAST(N'2025-11-17T01:30:25.1808880' AS DateTime2), 1)
INSERT [dbo].[event_participants] ([id], [event_id], [username], [student_name], [email], [approved_at], [approved_by], [created_at], [can_review]) VALUES (14, 24, N'6709616785', N'Apinya Somboon', N'apinya.s@dome.tu.ac.th', CAST(N'2025-11-17T01:30:25.1829850' AS DateTime2), N'admin@tu.ac.th', CAST(N'2025-11-17T01:30:25.1829850' AS DateTime2), 1)
INSERT [dbo].[event_participants] ([id], [event_id], [username], [student_name], [email], [approved_at], [approved_by], [created_at], [can_review]) VALUES (15, 24, N'6709616786', N'Kittipat Wongsa', N'kittipat.w@dome.tu.ac.th', CAST(N'2025-11-17T01:30:25.1845260' AS DateTime2), N'admin@tu.ac.th', CAST(N'2025-11-17T01:30:25.1845260' AS DateTime2), 1)
INSERT [dbo].[event_participants] ([id], [event_id], [username], [student_name], [email], [approved_at], [approved_by], [created_at], [can_review]) VALUES (16, 24, N'6709616787', N'Natthida Chaiya', N'natthida.c@dome.tu.ac.th', CAST(N'2025-11-17T01:30:25.1869300' AS DateTime2), N'admin@tu.ac.th', CAST(N'2025-11-17T01:30:25.1874530' AS DateTime2), 1)
INSERT [dbo].[event_participants] ([id], [event_id], [username], [student_name], [email], [approved_at], [approved_by], [created_at], [can_review]) VALUES (17, 24, N'6709616788', N'Wuttipong Sangwan', N'wuttipong.s@dome.tu.ac.th', CAST(N'2025-11-17T01:30:25.1889300' AS DateTime2), N'admin@tu.ac.th', CAST(N'2025-11-17T01:30:25.1889300' AS DateTime2), 1)
INSERT [dbo].[event_participants] ([id], [event_id], [username], [student_name], [email], [approved_at], [approved_by], [created_at], [can_review]) VALUES (18, 24, N'6709616789', N'Pornpimol Khunthong', N'pornpimol.k@dome.tu.ac.th', CAST(N'2025-11-17T01:30:25.1915970' AS DateTime2), N'admin@tu.ac.th', CAST(N'2025-11-17T01:30:25.1915970' AS DateTime2), 1)
INSERT [dbo].[event_participants] ([id], [event_id], [username], [student_name], [email], [approved_at], [approved_by], [created_at], [can_review]) VALUES (19, 24, N'6709616418', N'Chatchaporn Angkanrungrat', N'chatchaporn.ang@dome.tu.ac.th', CAST(N'2025-11-17T01:30:25.1937310' AS DateTime2), N'admin@tu.ac.th', CAST(N'2025-11-17T01:30:25.1937310' AS DateTime2), 1)
INSERT [dbo].[event_participants] ([id], [event_id], [username], [student_name], [email], [approved_at], [approved_by], [created_at], [can_review]) VALUES (20, 24, N'6709490038', N'Teekayu', N'teekayu.dua@dome.tu.ac.th', CAST(N'2025-11-17T01:30:25.1953060' AS DateTime2), N'admin@tu.ac.th', CAST(N'2025-11-17T01:30:25.1953060' AS DateTime2), 1)
INSERT [dbo].[event_participants] ([id], [event_id], [username], [student_name], [email], [approved_at], [approved_by], [created_at], [can_review]) VALUES (25, 35, N'6709616780', N'Somchai Sukjai', N'somchai.s@dome.tu.ac.th', CAST(N'2025-11-17T02:40:46.7133460' AS DateTime2), N'admin@tu.ac.th', CAST(N'2025-11-17T02:40:46.7133460' AS DateTime2), 1)
INSERT [dbo].[event_participants] ([id], [event_id], [username], [student_name], [email], [approved_at], [approved_by], [created_at], [can_review]) VALUES (26, 35, N'6709616781', N'Siriwan Thongdee', N'siriwan.t@dome.tu.ac.th', CAST(N'2025-11-17T02:40:46.7165710' AS DateTime2), N'admin@tu.ac.th', CAST(N'2025-11-17T02:40:46.7165710' AS DateTime2), 1)
INSERT [dbo].[event_participants] ([id], [event_id], [username], [student_name], [email], [approved_at], [approved_by], [created_at], [can_review]) VALUES (27, 35, N'6709616782', N'Pongsakorn Rattana', N'pongsakorn.r@dome.tu.ac.th', CAST(N'2025-11-17T02:40:46.7189040' AS DateTime2), N'admin@tu.ac.th', CAST(N'2025-11-17T02:40:46.7189040' AS DateTime2), 1)
INSERT [dbo].[event_participants] ([id], [event_id], [username], [student_name], [email], [approved_at], [approved_by], [created_at], [can_review]) VALUES (28, 35, N'6709616783', N'Nutchanat Pimjai', N'nutchanat.p@dome.tu.ac.th', CAST(N'2025-11-17T02:40:46.7199070' AS DateTime2), N'admin@tu.ac.th', CAST(N'2025-11-17T02:40:46.7199070' AS DateTime2), 1)
INSERT [dbo].[event_participants] ([id], [event_id], [username], [student_name], [email], [approved_at], [approved_by], [created_at], [can_review]) VALUES (29, 35, N'6709616784', N'Thanawat Kaewkham', N'thanawat.k@dome.tu.ac.th', CAST(N'2025-11-17T02:40:46.7221150' AS DateTime2), N'admin@tu.ac.th', CAST(N'2025-11-17T02:40:46.7221150' AS DateTime2), 1)
INSERT [dbo].[event_participants] ([id], [event_id], [username], [student_name], [email], [approved_at], [approved_by], [created_at], [can_review]) VALUES (30, 35, N'6709616785', N'Apinya Somboon', N'apinya.s@dome.tu.ac.th', CAST(N'2025-11-17T02:40:46.7231170' AS DateTime2), N'admin@tu.ac.th', CAST(N'2025-11-17T02:40:46.7231170' AS DateTime2), 1)
INSERT [dbo].[event_participants] ([id], [event_id], [username], [student_name], [email], [approved_at], [approved_by], [created_at], [can_review]) VALUES (31, 35, N'6709616786', N'Kittipat Wongsa', N'kittipat.w@dome.tu.ac.th', CAST(N'2025-11-17T02:40:46.7247840' AS DateTime2), N'admin@tu.ac.th', CAST(N'2025-11-17T02:40:46.7247840' AS DateTime2), 1)
INSERT [dbo].[event_participants] ([id], [event_id], [username], [student_name], [email], [approved_at], [approved_by], [created_at], [can_review]) VALUES (32, 35, N'6709616787', N'Natthida Chaiya', N'natthida.c@dome.tu.ac.th', CAST(N'2025-11-17T02:40:46.7272950' AS DateTime2), N'admin@tu.ac.th', CAST(N'2025-11-17T02:40:46.7272950' AS DateTime2), 1)
INSERT [dbo].[event_participants] ([id], [event_id], [username], [student_name], [email], [approved_at], [approved_by], [created_at], [can_review]) VALUES (33, 35, N'6709616788', N'Wuttipong Sangwan', N'wuttipong.s@dome.tu.ac.th', CAST(N'2025-11-17T02:40:46.7292960' AS DateTime2), N'admin@tu.ac.th', CAST(N'2025-11-17T02:40:46.7292960' AS DateTime2), 1)
INSERT [dbo].[event_participants] ([id], [event_id], [username], [student_name], [email], [approved_at], [approved_by], [created_at], [can_review]) VALUES (34, 35, N'6709616789', N'Pornpimol Khunthong', N'pornpimol.k@dome.tu.ac.th', CAST(N'2025-11-17T02:40:46.7307990' AS DateTime2), N'admin@tu.ac.th', CAST(N'2025-11-17T02:40:46.7307990' AS DateTime2), 1)
INSERT [dbo].[event_participants] ([id], [event_id], [username], [student_name], [email], [approved_at], [approved_by], [created_at], [can_review]) VALUES (35, 35, N'6709616418', N'Chatchaporn Angkanrungrat', N'chatchaporn.ang@dome.tu.ac.th', CAST(N'2025-11-17T02:40:46.7322910' AS DateTime2), N'admin@tu.ac.th', CAST(N'2025-11-17T02:40:46.7322910' AS DateTime2), 1)
INSERT [dbo].[event_participants] ([id], [event_id], [username], [student_name], [email], [approved_at], [approved_by], [created_at], [can_review]) VALUES (36, 35, N'6709490038', N'Teekayu', N'teekayu.dua@dome.tu.ac.th', CAST(N'2025-11-17T02:40:46.7338840' AS DateTime2), N'admin@tu.ac.th', CAST(N'2025-11-17T02:40:46.7338840' AS DateTime2), 1)
INSERT [dbo].[event_participants] ([id], [event_id], [username], [student_name], [email], [approved_at], [approved_by], [created_at], [can_review]) VALUES (37, 36, N'6709616780', N'Somchai Sukjai', N'somchai.s@dome.tu.ac.th', CAST(N'2025-11-17T02:41:05.5616450' AS DateTime2), N'admin@tu.ac.th', CAST(N'2025-11-17T02:41:05.5616450' AS DateTime2), 1)
INSERT [dbo].[event_participants] ([id], [event_id], [username], [student_name], [email], [approved_at], [approved_by], [created_at], [can_review]) VALUES (38, 36, N'6709616781', N'Siriwan Thongdee', N'siriwan.t@dome.tu.ac.th', CAST(N'2025-11-17T02:41:05.5631920' AS DateTime2), N'admin@tu.ac.th', CAST(N'2025-11-17T02:41:05.5631920' AS DateTime2), 1)
INSERT [dbo].[event_participants] ([id], [event_id], [username], [student_name], [email], [approved_at], [approved_by], [created_at], [can_review]) VALUES (39, 36, N'6709616782', N'Pongsakorn Rattana', N'pongsakorn.r@dome.tu.ac.th', CAST(N'2025-11-17T02:41:05.5647820' AS DateTime2), N'admin@tu.ac.th', CAST(N'2025-11-17T02:41:05.5647820' AS DateTime2), 1)
INSERT [dbo].[event_participants] ([id], [event_id], [username], [student_name], [email], [approved_at], [approved_by], [created_at], [can_review]) VALUES (40, 36, N'6709616783', N'Nutchanat Pimjai', N'nutchanat.p@dome.tu.ac.th', CAST(N'2025-11-17T02:41:05.5669280' AS DateTime2), N'admin@tu.ac.th', CAST(N'2025-11-17T02:41:05.5669280' AS DateTime2), 1)
INSERT [dbo].[event_participants] ([id], [event_id], [username], [student_name], [email], [approved_at], [approved_by], [created_at], [can_review]) VALUES (41, 36, N'6709616784', N'Thanawat Kaewkham', N'thanawat.k@dome.tu.ac.th', CAST(N'2025-11-17T02:41:05.5694520' AS DateTime2), N'admin@tu.ac.th', CAST(N'2025-11-17T02:41:05.5694520' AS DateTime2), 1)
INSERT [dbo].[event_participants] ([id], [event_id], [username], [student_name], [email], [approved_at], [approved_by], [created_at], [can_review]) VALUES (42, 36, N'6709616785', N'Apinya Somboon', N'apinya.s@dome.tu.ac.th', CAST(N'2025-11-17T02:41:05.5710460' AS DateTime2), N'admin@tu.ac.th', CAST(N'2025-11-17T02:41:05.5710460' AS DateTime2), 1)
INSERT [dbo].[event_participants] ([id], [event_id], [username], [student_name], [email], [approved_at], [approved_by], [created_at], [can_review]) VALUES (43, 36, N'6709616786', N'Kittipat Wongsa', N'kittipat.w@dome.tu.ac.th', CAST(N'2025-11-17T02:41:05.5727720' AS DateTime2), N'admin@tu.ac.th', CAST(N'2025-11-17T02:41:05.5727720' AS DateTime2), 1)
INSERT [dbo].[event_participants] ([id], [event_id], [username], [student_name], [email], [approved_at], [approved_by], [created_at], [can_review]) VALUES (44, 36, N'6709616787', N'Natthida Chaiya', N'natthida.c@dome.tu.ac.th', CAST(N'2025-11-17T02:41:05.5743550' AS DateTime2), N'admin@tu.ac.th', CAST(N'2025-11-17T02:41:05.5743550' AS DateTime2), 1)
INSERT [dbo].[event_participants] ([id], [event_id], [username], [student_name], [email], [approved_at], [approved_by], [created_at], [can_review]) VALUES (45, 36, N'6709616788', N'Wuttipong Sangwan', N'wuttipong.s@dome.tu.ac.th', CAST(N'2025-11-17T02:41:05.5754270' AS DateTime2), N'admin@tu.ac.th', CAST(N'2025-11-17T02:41:05.5754270' AS DateTime2), 1)
INSERT [dbo].[event_participants] ([id], [event_id], [username], [student_name], [email], [approved_at], [approved_by], [created_at], [can_review]) VALUES (46, 36, N'6709616789', N'Pornpimol Khunthong', N'pornpimol.k@dome.tu.ac.th', CAST(N'2025-11-17T02:41:05.5773940' AS DateTime2), N'admin@tu.ac.th', CAST(N'2025-11-17T02:41:05.5773940' AS DateTime2), 1)
INSERT [dbo].[event_participants] ([id], [event_id], [username], [student_name], [email], [approved_at], [approved_by], [created_at], [can_review]) VALUES (47, 36, N'6709616418', N'Chatchaporn Angkanrungrat', N'chatchaporn.ang@dome.tu.ac.th', CAST(N'2025-11-17T02:41:05.5792680' AS DateTime2), N'admin@tu.ac.th', CAST(N'2025-11-17T02:41:05.5792680' AS DateTime2), 1)
INSERT [dbo].[event_participants] ([id], [event_id], [username], [student_name], [email], [approved_at], [approved_by], [created_at], [can_review]) VALUES (48, 36, N'6709490038', N'Teekayu', N'teekayu.dua@dome.tu.ac.th', CAST(N'2025-11-17T02:41:05.5809080' AS DateTime2), N'admin@tu.ac.th', CAST(N'2025-11-17T02:41:05.5809080' AS DateTime2), 1)
INSERT [dbo].[event_participants] ([id], [event_id], [username], [student_name], [email], [approved_at], [approved_by], [created_at], [can_review]) VALUES (49, 29, N'6709616780', N'Somchai Sukjai', N'somchai.s@dome.tu.ac.th', CAST(N'2025-11-17T02:41:20.0244460' AS DateTime2), N'admin@tu.ac.th', CAST(N'2025-11-17T02:41:20.0244460' AS DateTime2), 1)
INSERT [dbo].[event_participants] ([id], [event_id], [username], [student_name], [email], [approved_at], [approved_by], [created_at], [can_review]) VALUES (50, 29, N'6709616781', N'Siriwan Thongdee', N'siriwan.t@dome.tu.ac.th', CAST(N'2025-11-17T02:41:20.0260660' AS DateTime2), N'admin@tu.ac.th', CAST(N'2025-11-17T02:41:20.0260660' AS DateTime2), 1)
INSERT [dbo].[event_participants] ([id], [event_id], [username], [student_name], [email], [approved_at], [approved_by], [created_at], [can_review]) VALUES (51, 29, N'6709616782', N'Pongsakorn Rattana', N'pongsakorn.r@dome.tu.ac.th', CAST(N'2025-11-17T02:41:20.0283340' AS DateTime2), N'admin@tu.ac.th', CAST(N'2025-11-17T02:41:20.0283340' AS DateTime2), 1)
INSERT [dbo].[event_participants] ([id], [event_id], [username], [student_name], [email], [approved_at], [approved_by], [created_at], [can_review]) VALUES (52, 29, N'6709616783', N'Nutchanat Pimjai', N'nutchanat.p@dome.tu.ac.th', CAST(N'2025-11-17T02:41:20.0303960' AS DateTime2), N'admin@tu.ac.th', CAST(N'2025-11-17T02:41:20.0303960' AS DateTime2), 1)
INSERT [dbo].[event_participants] ([id], [event_id], [username], [student_name], [email], [approved_at], [approved_by], [created_at], [can_review]) VALUES (53, 29, N'6709616784', N'Thanawat Kaewkham', N'thanawat.k@dome.tu.ac.th', CAST(N'2025-11-17T02:41:20.0325250' AS DateTime2), N'admin@tu.ac.th', CAST(N'2025-11-17T02:41:20.0325250' AS DateTime2), 1)
INSERT [dbo].[event_participants] ([id], [event_id], [username], [student_name], [email], [approved_at], [approved_by], [created_at], [can_review]) VALUES (54, 29, N'6709616785', N'Apinya Somboon', N'apinya.s@dome.tu.ac.th', CAST(N'2025-11-17T02:41:20.0344210' AS DateTime2), N'admin@tu.ac.th', CAST(N'2025-11-17T02:41:20.0344210' AS DateTime2), 1)
INSERT [dbo].[event_participants] ([id], [event_id], [username], [student_name], [email], [approved_at], [approved_by], [created_at], [can_review]) VALUES (55, 29, N'6709616786', N'Kittipat Wongsa', N'kittipat.w@dome.tu.ac.th', CAST(N'2025-11-17T02:41:20.0354840' AS DateTime2), N'admin@tu.ac.th', CAST(N'2025-11-17T02:41:20.0354840' AS DateTime2), 1)
INSERT [dbo].[event_participants] ([id], [event_id], [username], [student_name], [email], [approved_at], [approved_by], [created_at], [can_review]) VALUES (56, 29, N'6709616787', N'Natthida Chaiya', N'natthida.c@dome.tu.ac.th', CAST(N'2025-11-17T02:41:20.0370560' AS DateTime2), N'admin@tu.ac.th', CAST(N'2025-11-17T02:41:20.0370560' AS DateTime2), 1)
INSERT [dbo].[event_participants] ([id], [event_id], [username], [student_name], [email], [approved_at], [approved_by], [created_at], [can_review]) VALUES (57, 29, N'6709616788', N'Wuttipong Sangwan', N'wuttipong.s@dome.tu.ac.th', CAST(N'2025-11-17T02:41:20.0391640' AS DateTime2), N'admin@tu.ac.th', CAST(N'2025-11-17T02:41:20.0391640' AS DateTime2), 1)
INSERT [dbo].[event_participants] ([id], [event_id], [username], [student_name], [email], [approved_at], [approved_by], [created_at], [can_review]) VALUES (58, 29, N'6709616789', N'Pornpimol Khunthong', N'pornpimol.k@dome.tu.ac.th', CAST(N'2025-11-17T02:41:20.0417820' AS DateTime2), N'admin@tu.ac.th', CAST(N'2025-11-17T02:41:20.0417820' AS DateTime2), 1)
INSERT [dbo].[event_participants] ([id], [event_id], [username], [student_name], [email], [approved_at], [approved_by], [created_at], [can_review]) VALUES (59, 29, N'6709616418', N'Chatchaporn Angkanrungrat', N'chatchaporn.ang@dome.tu.ac.th', CAST(N'2025-11-17T02:41:20.0433340' AS DateTime2), N'admin@tu.ac.th', CAST(N'2025-11-17T02:41:20.0433340' AS DateTime2), 1)
INSERT [dbo].[event_participants] ([id], [event_id], [username], [student_name], [email], [approved_at], [approved_by], [created_at], [can_review]) VALUES (60, 29, N'6709490038', N'Teekayu', N'teekayu.dua@dome.tu.ac.th', CAST(N'2025-11-17T02:41:20.0448980' AS DateTime2), N'admin@tu.ac.th', CAST(N'2025-11-17T02:41:20.0448980' AS DateTime2), 1)
SET IDENTITY_INSERT [dbo].[event_participants] OFF
GO

-- Login History
SET IDENTITY_INSERT [dbo].[login_history] ON
INSERT [dbo].[login_history] ([id], [user_id], [username], [ip_address], [login_time], [status]) VALUES (1, 2, N'6709490038', N'0:0:0:0:0:0:0:1', CAST(N'2025-11-16T23:43:35.8026140' AS DateTime2), N'SUCCESS')
INSERT [dbo].[login_history] ([id], [user_id], [username], [ip_address], [login_time], [status]) VALUES (2, 2, N'6709490038', N'0:0:0:0:0:0:0:1', CAST(N'2025-11-16T23:47:32.6301350' AS DateTime2), N'SUCCESS')
INSERT [dbo].[login_history] ([id], [user_id], [username], [ip_address], [login_time], [status]) VALUES (3, 2, N'6709490038', N'0:0:0:0:0:0:0:1', CAST(N'2025-11-16T23:50:00.6346690' AS DateTime2), N'SUCCESS')
INSERT [dbo].[login_history] ([id], [user_id], [username], [ip_address], [login_time], [status]) VALUES (4, 2, N'6709490038', N'0:0:0:0:0:0:0:1', CAST(N'2025-11-16T23:55:19.5001610' AS DateTime2), N'SUCCESS')
INSERT [dbo].[login_history] ([id], [user_id], [username], [ip_address], [login_time], [status]) VALUES (5, 2, N'6709490038', N'0:0:0:0:0:0:0:1', CAST(N'2025-11-17T01:30:55.5231630' AS DateTime2), N'SUCCESS')
INSERT [dbo].[login_history] ([id], [user_id], [username], [ip_address], [login_time], [status]) VALUES (6, 2, N'6709490038', N'0:0:0:0:0:0:0:1', CAST(N'2025-11-17T02:42:09.3018360' AS DateTime2), N'SUCCESS')
INSERT [dbo].[login_history] ([id], [user_id], [username], [ip_address], [login_time], [status]) VALUES (7, 2, N'6709490038', N'0:0:0:0:0:0:0:1', CAST(N'2025-11-17T03:15:15.5535960' AS DateTime2), N'SUCCESS')
SET IDENTITY_INSERT [dbo].[login_history] OFF
GO

/*******************************************************************************
 * Views
 *******************************************************************************/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

-- View: OpenEvents
CREATE VIEW [dbo].[vw_OpenEvents]
AS
SELECT
    id,
    title,
    description,
    location,
    startTime,
    endTime,
    imageUrl,
    category,
    maxCapacity,
    currentParticipants,
    maxCapacity - currentParticipants AS available_slots,
    status,
    organizer,
    fee,
    tags
FROM dbo.events
WHERE status = 'OPEN' AND startTime > GETDATE();
GO

-- View: EventStatistics
CREATE VIEW [dbo].[vw_EventStatistics]
AS
SELECT
    category,
    COUNT(*) AS total_events,
    SUM(CASE WHEN status = 'OPEN' THEN 1 ELSE 0 END) AS open_events,
    SUM(CASE WHEN status = 'FULL' THEN 1 ELSE 0 END) AS full_events,
    SUM(CASE WHEN status = 'CLOSED' THEN 1 ELSE 0 END) AS closed_events,
    SUM(CASE WHEN status = 'CANCELLED' THEN 1 ELSE 0 END) AS cancelled_events,
    SUM(currentParticipants) AS total_participants,
    AVG(CAST(currentParticipants AS FLOAT)) AS avg_participants
FROM dbo.events
GROUP BY category;
GO

-- View: ParticipantsWithEventDetails
CREATE VIEW [dbo].[vw_ParticipantsWithEventDetails]
AS
SELECT
    p.id,
    p.event_id,
    e.title AS event_title,
    e.startTime AS event_start_time,
    e.location AS event_location,
    p.username,
    p.student_name,
    p.email,
    p.approved_at,
    p.approved_by,
    p.created_at,
    CASE
        WHEN f.id IS NOT NULL THEN 1
        ELSE 0
    END AS has_given_feedback
FROM dbo.event_participants p
INNER JOIN dbo.events e ON p.event_id = e.id
LEFT JOIN dbo.event_feedbacks f ON p.event_id = f.event_id AND p.username = f.username;
GO

-- View: EventParticipantStatistics
CREATE VIEW [dbo].[vw_EventParticipantStatistics]
AS
SELECT
    e.id AS event_id,
    e.title AS event_title,
    e.startTime AS event_start_time,
    e.maxCapacity AS max_capacity,
    COUNT(p.id) AS total_participants,
    COUNT(f.id) AS total_feedbacks,
    CAST(COUNT(f.id) AS FLOAT) / NULLIF(COUNT(p.id), 0) * 100 AS feedback_percentage
FROM dbo.events e
LEFT JOIN dbo.event_participants p ON e.id = p.event_id
LEFT JOIN dbo.event_feedbacks f ON p.event_id = f.event_id AND p.username = f.username
GROUP BY e.id, e.title, e.startTime, e.maxCapacity;
GO

/*******************************************************************************
 * Stored Procedures and Functions
 *******************************************************************************/

-- Function: IsParticipantApproved
CREATE FUNCTION [dbo].[fn_IsParticipantApproved](
    @event_id BIGINT,
    @username NVARCHAR(50)
)
RETURNS BIT
AS
BEGIN
    DECLARE @is_approved BIT;

    IF EXISTS (
        SELECT 1
        FROM dbo.event_participants
        WHERE event_id = @event_id AND username = @username
    )
        SET @is_approved = 1;
    ELSE
        SET @is_approved = 0;

    RETURN @is_approved;
END;
GO

-- Procedure: CheckParticipantApproval
CREATE PROCEDURE [dbo].[sp_CheckParticipantApproval]
    @event_id BIGINT,
    @username NVARCHAR(50)
AS
BEGIN
    SET NOCOUNT ON;
    IF EXISTS (
        SELECT 1
        FROM dbo.event_participants
        WHERE event_id = @event_id AND username = @username
    )
        SELECT 1 AS is_approved;
    ELSE
        SELECT 0 AS is_approved;
END;
GO

-- Procedure: CountParticipants
CREATE PROCEDURE [dbo].[sp_CountParticipants]
    @event_id BIGINT
AS
BEGIN
    SET NOCOUNT ON;
    SELECT
        @event_id AS event_id,
        COUNT(*) AS total_participants
    FROM dbo.event_participants
    WHERE event_id = @event_id;
END;
GO

-- Procedure: GetAllEvents
CREATE PROCEDURE [dbo].[sp_GetAllEvents]
AS
BEGIN
    SET NOCOUNT ON;
    SELECT id, title, description, location, startTime, endTime, imageUrl, category, maxCapacity, currentParticipants, status, organizer, fee, tags
    FROM dbo.events
    ORDER BY startTime;
END;
GO

-- Procedure: GetEventParticipants
CREATE PROCEDURE [dbo].[sp_GetEventParticipants]
    @event_id BIGINT
AS
BEGIN
    SET NOCOUNT ON;
    SELECT id, event_id, username, student_name, email, approved_at, approved_by, created_at
    FROM dbo.event_participants
    WHERE event_id = @event_id
    ORDER BY student_name;
END;
GO

-- Procedure: GetEventsByCategory
CREATE PROCEDURE [dbo].[sp_GetEventsByCategory]
    @category NVARCHAR(100)
AS
BEGIN
    SET NOCOUNT ON;
    SELECT id, title, description, location, startTime, endTime, imageUrl, category, maxCapacity, currentParticipants, status, organizer, fee, tags
    FROM dbo.events
    WHERE category = @category
    ORDER BY startTime;
END;
GO

-- Procedure: IsAdmin
CREATE PROCEDURE [dbo].[sp_IsAdmin]
    @username NVARCHAR(50)
AS
BEGIN
    SET NOCOUNT ON;

    IF EXISTS (
        SELECT 1
        FROM dbo.admins
        WHERE username = @username AND is_active = 1
    )
        SELECT 1 AS is_admin;
    ELSE
        SELECT 0 AS is_admin;
END;
GO