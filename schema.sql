-- ============================================================================
-- CONTACT MANAGEMENT SYSTEM - MYSQL SCHEMA DEFINITION & MIGRATION GUIDE
-- Database: contactdb
-- ============================================================================

CREATE DATABASE IF NOT EXISTS `contactdb`
  DEFAULT CHARACTER SET utf8mb4
  DEFAULT COLLATE utf8mb4_unicode_ci;

USE `contactdb`;

-- ----------------------------------------------------------------------------
-- Table structure for table `users`
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `users` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `full_name` VARCHAR(120) NOT NULL,
  `email` VARCHAR(150) NOT NULL,
  `password_hash` VARCHAR(255) NOT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_users_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- Table structure for table `contacts`
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `contacts` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(120) NOT NULL,
  `email` VARCHAR(150) DEFAULT NULL,
  `phone` VARCHAR(25) NOT NULL,
  `company` VARCHAR(120) DEFAULT NULL,
  `job_title` VARCHAR(120) DEFAULT NULL,
  `address` VARCHAR(255) DEFAULT NULL,
  `notes` VARCHAR(1000) DEFAULT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `user_id` BIGINT NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_contacts_user_id` (`user_id`),
  KEY `idx_contacts_name` (`name`),
  KEY `idx_contacts_phone` (`phone`),
  KEY `idx_contacts_email` (`email`),
  KEY `idx_contacts_company` (`company`),
  CONSTRAINT `fk_contacts_user` FOREIGN KEY (`user_id`)
    REFERENCES `users` (`id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- SAFE DATABASE MIGRATION SCRIPT (For existing deployments upgrading to auth)
-- ============================================================================
-- If you already have an existing `contacts` table without `user_id`:
-- DO NOT drop the table or assign existing contacts to arbitrary users.
-- Follow these 4 safe migration steps:
--
-- STEP 1: Create the users table first:
--   CREATE TABLE IF NOT EXISTS users (...);
--
-- STEP 2: Add user_id column as NULLABLE initially:
--   ALTER TABLE contacts ADD COLUMN user_id BIGINT NULL AFTER updated_at;
--   ALTER TABLE contacts ADD INDEX idx_contacts_user_id (user_id);
--
-- STEP 3: Handle legacy contacts securely:
--   Option A: Assign legacy contacts to a designated system migration administrator:
--     INSERT INTO users (full_name, email, password_hash, created_at)
--     VALUES ('System Administrator', 'admin@yourdomain.com', '$2a$12$EXAMPLE_HASH_HERE', NOW());
--     UPDATE contacts SET user_id = (SELECT id FROM users WHERE email = 'admin@yourdomain.com') WHERE user_id IS NULL;
--
--   Option B: Or if contacts contain an existing owner column/email, map each contact to matching user:
--     UPDATE contacts c JOIN users u ON LOWER(c.legacy_owner_email) = LOWER(u.email)
--     SET c.user_id = u.id WHERE c.user_id IS NULL;
--
-- STEP 4: Enforce NOT NULL and Foreign Key Constraint after data is verified:
--   ALTER TABLE contacts MODIFY COLUMN user_id BIGINT NOT NULL;
--   ALTER TABLE contacts ADD CONSTRAINT fk_contacts_user
--     FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE;
-- ============================================================================
