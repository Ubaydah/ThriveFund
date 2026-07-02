-- Backfill schema drift for older webhook_events tables.

SET @schema_name = DATABASE();

SET @has_provider = (
  SELECT COUNT(*)
  FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = @schema_name
    AND TABLE_NAME = 'webhook_events'
    AND COLUMN_NAME = 'provider'
);

SET @sql = IF(
  @has_provider = 0,
  'ALTER TABLE webhook_events ADD COLUMN provider ENUM(''nomba'') NOT NULL DEFAULT ''nomba'' AFTER id',
  'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @has_status = (
  SELECT COUNT(*)
  FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = @schema_name
    AND TABLE_NAME = 'webhook_events'
    AND COLUMN_NAME = 'status'
);

SET @sql = IF(
  @has_status = 0,
  'ALTER TABLE webhook_events ADD COLUMN status ENUM(''received'',''processed'',''failed'',''duplicate'') NOT NULL DEFAULT ''received'' AFTER payload',
  'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

UPDATE webhook_events
SET status = IF(processed = 1, 'processed', 'received')
WHERE status = 'received';

SET @has_error_message = (
  SELECT COUNT(*)
  FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = @schema_name
    AND TABLE_NAME = 'webhook_events'
    AND COLUMN_NAME = 'error_message'
);

SET @sql = IF(
  @has_error_message = 0,
  'ALTER TABLE webhook_events ADD COLUMN error_message TEXT NULL AFTER processed_at',
  'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @has_status_index = (
  SELECT COUNT(*)
  FROM information_schema.STATISTICS
  WHERE TABLE_SCHEMA = @schema_name
    AND TABLE_NAME = 'webhook_events'
    AND INDEX_NAME = 'idx_webhook_events_status'
);

SET @sql = IF(
  @has_status_index = 0,
  'CREATE INDEX idx_webhook_events_status ON webhook_events (status)',
  'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
