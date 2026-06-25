-- ThriveFund Database Schema — MySQL 8.0
-- Run once: mysql -h <host> -u admin -p thrivefund < database/schema.sql

-- ─────────────────────────────────────────────────────────────────────────────
-- USERS
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id            VARCHAR(36)   NOT NULL,
  full_name     VARCHAR(255)  NOT NULL,
  email         VARCHAR(255)  NOT NULL,
  phone_number  VARCHAR(20)   NULL,
  password_hash VARCHAR(255)  NOT NULL,
  role          ENUM('user','admin') NOT NULL DEFAULT 'user',
  created_at    DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME      NULL     ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_users_email (email)
);

-- ─────────────────────────────────────────────────────────────────────────────
-- AUTH
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS refresh_tokens (
  id         BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  token      VARCHAR(512)    NOT NULL,
  user_id    VARCHAR(36)     NOT NULL,
  expires_at DATETIME        NOT NULL,
  created_at DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_refresh_tokens_token (token(255)),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS password_resets (
  id         BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  token      VARCHAR(512)    NOT NULL,
  user_id    VARCHAR(36)     NOT NULL,
  used       TINYINT(1)      NOT NULL DEFAULT 0,
  expires_at DATETIME        NOT NULL,
  created_at DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_password_resets_token (token(255)),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ─────────────────────────────────────────────────────────────────────────────
-- NOTIFICATION PREFERENCES
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS notification_preferences (
  user_id   VARCHAR(36) NOT NULL,
  payments  TINYINT(1)  NOT NULL DEFAULT 1,
  goals     TINYINT(1)  NOT NULL DEFAULT 1,
  reminders TINYINT(1)  NOT NULL DEFAULT 0,
  marketing TINYINT(1)  NOT NULL DEFAULT 0,
  PRIMARY KEY (user_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ─────────────────────────────────────────────────────────────────────────────
-- GOALS
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS goals (
  id              VARCHAR(36)    NOT NULL,
  user_id         VARCHAR(36)    NOT NULL,
  title           VARCHAR(255)   NOT NULL,
  description     TEXT           NULL,
  target_amount   DECIMAL(15,2)  NOT NULL,
  current_amount  DECIMAL(15,2)  NOT NULL DEFAULT 0.00,
  category        VARCHAR(100)   NOT NULL,
  status          ENUM('active','completed','paused','cancelled') NOT NULL DEFAULT 'active',
  color           VARCHAR(20)    NULL,
  deadline        DATE           NOT NULL,
  slug            VARCHAR(255)   NULL,
  allow_anonymous TINYINT(1)     NOT NULL DEFAULT 1,
  created_at      DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME       NULL     ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_goals_slug (slug),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_goals_user_status (user_id, status),
  INDEX idx_goals_category (category)
);

-- ─────────────────────────────────────────────────────────────────────────────
-- VIRTUAL ACCOUNTS
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS virtual_accounts (
  id                 VARCHAR(36)  NOT NULL,
  goal_id            VARCHAR(36)  NOT NULL,
  nomba_account_id   VARCHAR(255) NOT NULL,
  account_number     VARCHAR(20)  NOT NULL,
  account_name       VARCHAR(255) NOT NULL,
  bank_name          VARCHAR(255) NOT NULL,
  provider_reference VARCHAR(255) NOT NULL,
  status             ENUM('active','inactive') NOT NULL DEFAULT 'active',
  created_at         DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_virtual_accounts_number (account_number),
  UNIQUE KEY uq_virtual_accounts_provider_ref (provider_reference),
  FOREIGN KEY (goal_id) REFERENCES goals(id) ON DELETE CASCADE,
  INDEX idx_virtual_accounts_goal (goal_id)
);

-- ─────────────────────────────────────────────────────────────────────────────
-- TRANSACTIONS
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS transactions (
  id                 VARCHAR(36)    NOT NULL,
  goal_id            VARCHAR(36)    NOT NULL,
  virtual_account_id VARCHAR(36)    NOT NULL,
  contributor_name   VARCHAR(255)   NOT NULL,
  amount             DECIMAL(15,2)  NOT NULL,
  reference          VARCHAR(255)   NOT NULL,
  provider_reference VARCHAR(255)   NOT NULL,
  status             ENUM('pending','successful','failed') NOT NULL DEFAULT 'pending',
  paid_at            DATETIME       NULL,
  created_at         DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_transactions_provider_ref (provider_reference),
  FOREIGN KEY (goal_id) REFERENCES goals(id) ON DELETE CASCADE,
  FOREIGN KEY (virtual_account_id) REFERENCES virtual_accounts(id),
  INDEX idx_transactions_goal_status (goal_id, status),
  INDEX idx_transactions_paid_at (paid_at)
);

-- ─────────────────────────────────────────────────────────────────────────────
-- CONTRIBUTORS
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS contributors (
  id               VARCHAR(36)  NOT NULL,
  goal_id          VARCHAR(36)  NOT NULL,
  name             VARCHAR(255) NOT NULL,
  email            VARCHAR(255) NULL,
  phone_number     VARCHAR(20)  NULL,
  unique_reference VARCHAR(255) NOT NULL,
  created_at       DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_contributors_reference (unique_reference),
  FOREIGN KEY (goal_id) REFERENCES goals(id) ON DELETE CASCADE
);

-- ─────────────────────────────────────────────────────────────────────────────
-- INVITATIONS
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS invitations (
  id      VARCHAR(36)  NOT NULL,
  goal_id VARCHAR(36)  NOT NULL,
  email   VARCHAR(255) NOT NULL,
  name    VARCHAR(255) NULL,
  channel VARCHAR(50)  NOT NULL DEFAULT 'email',
  status  ENUM('sent','accepted','declined') NOT NULL DEFAULT 'sent',
  sent_at DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  FOREIGN KEY (goal_id) REFERENCES goals(id) ON DELETE CASCADE,
  INDEX idx_invitations_email (email)
);

-- ─────────────────────────────────────────────────────────────────────────────
-- NOTIFICATIONS
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS notifications (
  id         VARCHAR(36)  NOT NULL,
  user_id    VARCHAR(36)  NOT NULL,
  type       VARCHAR(100) NOT NULL,
  title      VARCHAR(255) NOT NULL,
  body       TEXT         NOT NULL,
  unread     TINYINT(1)   NOT NULL DEFAULT 1,
  created_at DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_notifications_user_unread (user_id, unread)
);

-- ─────────────────────────────────────────────────────────────────────────────
-- WEBHOOK EVENTS
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS webhook_events (
  id                 VARCHAR(36)  NOT NULL,
  event_type         VARCHAR(100) NOT NULL,
  provider_reference VARCHAR(255) NOT NULL,
  payload            JSON         NOT NULL,
  processed          TINYINT(1)   NOT NULL DEFAULT 0,
  processed_at       DATETIME     NULL,
  received_at        DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_webhook_events_provider_ref (provider_reference),
  INDEX idx_webhook_events_processed (processed),
  INDEX idx_webhook_events_received_at (received_at)
);
