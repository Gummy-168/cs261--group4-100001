-- Add logout_time column to track user logout events
ALTER TABLE dbo.login_history
ADD logout_time DATETIME NULL;