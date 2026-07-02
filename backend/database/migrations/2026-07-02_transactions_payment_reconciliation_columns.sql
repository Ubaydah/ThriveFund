-- Backfill schema drift for older transactions tables used by webhook reconciliation.

SET @schema_name = DATABASE();

SET @has_organization_id = (
  SELECT COUNT(*)
  FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = @schema_name
    AND TABLE_NAME = 'transactions'
    AND COLUMN_NAME = 'organization_id'
);

SET @sql = IF(
  @has_organization_id = 0,
  'ALTER TABLE transactions ADD COLUMN organization_id VARCHAR(36) NULL AFTER goal_id',
  'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

UPDATE transactions t
JOIN goals g ON g.id = t.goal_id
SET t.organization_id = g.organization_id
WHERE t.organization_id IS NULL
  AND g.organization_id IS NOT NULL;

SET @has_payment_id = (
  SELECT COUNT(*)
  FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = @schema_name
    AND TABLE_NAME = 'transactions'
    AND COLUMN_NAME = 'payment_id'
);

SET @sql = IF(
  @has_payment_id = 0,
  'ALTER TABLE transactions ADD COLUMN payment_id VARCHAR(36) NULL AFTER virtual_account_id',
  'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @has_reconciliation_id = (
  SELECT COUNT(*)
  FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = @schema_name
    AND TABLE_NAME = 'transactions'
    AND COLUMN_NAME = 'reconciliation_id'
);

SET @sql = IF(
  @has_reconciliation_id = 0,
  'ALTER TABLE transactions ADD COLUMN reconciliation_id VARCHAR(36) NULL AFTER payment_id',
  'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

ALTER TABLE transactions
  MODIFY COLUMN status ENUM('pending','successful','failed','duplicate','pending_review') NOT NULL DEFAULT 'pending';

SET @has_org_index = (
  SELECT COUNT(*)
  FROM information_schema.STATISTICS
  WHERE TABLE_SCHEMA = @schema_name
    AND TABLE_NAME = 'transactions'
    AND INDEX_NAME = 'idx_transactions_org'
);

SET @sql = IF(
  @has_org_index = 0,
  'CREATE INDEX idx_transactions_org ON transactions (organization_id)',
  'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
