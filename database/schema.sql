CREATE DATABASE IF NOT EXISTS payment_api
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE payment_api;

CREATE TABLE IF NOT EXISTS users (
  id CHAR(36) NOT NULL,
  first_name VARCHAR(80) NOT NULL,
  last_name VARCHAR(80) NOT NULL,
  email VARCHAR(160) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  profile_image VARCHAR(255) NULL,
  balance DECIMAL(15,2) NOT NULL DEFAULT 0.00,
  status ENUM('ACTIVE', 'INACTIVE') NOT NULL DEFAULT 'ACTIVE',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY users_email_unique (email)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS services (
  id CHAR(36) NOT NULL,
  code VARCHAR(60) NOT NULL,
  name VARCHAR(120) NOT NULL,
  service_icon VARCHAR(255) NULL,
  service_tariff DECIMAL(15,2) NOT NULL,
  admin_fee DECIMAL(15,2) NOT NULL DEFAULT 0.00,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY services_code_unique (code),
  KEY services_is_active_index (is_active)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS wallet_transactions (
  id CHAR(36) NOT NULL,
  user_id CHAR(36) NOT NULL,
  type ENUM('TOPUP', 'PAYMENT', 'REFUND', 'ADJUSTMENT') NOT NULL,
  invoice_number VARCHAR(80) NOT NULL,
  amount DECIMAL(15,2) NOT NULL,
  balance_before DECIMAL(15,2) NOT NULL,
  balance_after DECIMAL(15,2) NOT NULL,
  status ENUM('PENDING', 'SUCCESS', 'FAILED') NOT NULL DEFAULT 'SUCCESS',
  description VARCHAR(255) NULL,
  reference_type VARCHAR(80) NULL,
  reference_id CHAR(36) NULL,
  external_reference VARCHAR(120) NULL,
  metadata JSON NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY wallet_transactions_invoice_unique (invoice_number),
  KEY wallet_transactions_user_id_index (user_id),
  KEY wallet_transactions_type_index (type),
  CONSTRAINT wallet_transactions_user_id_fk
    FOREIGN KEY (user_id) REFERENCES users (id)
    ON DELETE RESTRICT
    ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS payment_transactions (
  id CHAR(36) NOT NULL,
  user_id CHAR(36) NOT NULL,
  service_id CHAR(36) NOT NULL,
  invoice_number VARCHAR(80) NOT NULL,
  customer_number VARCHAR(80) NULL,
  amount DECIMAL(15,2) NOT NULL,
  admin_fee DECIMAL(15,2) NOT NULL DEFAULT 0.00,
  total_amount DECIMAL(15,2) NOT NULL,
  status ENUM('PENDING', 'SUCCESS', 'FAILED') NOT NULL DEFAULT 'SUCCESS',
  provider_reference VARCHAR(120) NULL,
  notes VARCHAR(255) NULL,
  metadata JSON NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY payment_transactions_invoice_unique (invoice_number),
  KEY payment_transactions_user_id_index (user_id),
  KEY payment_transactions_service_id_index (service_id),
  CONSTRAINT payment_transactions_user_id_fk
    FOREIGN KEY (user_id) REFERENCES users (id)
    ON DELETE RESTRICT
    ON UPDATE CASCADE,
  CONSTRAINT payment_transactions_service_id_fk
    FOREIGN KEY (service_id) REFERENCES services (id)
    ON DELETE RESTRICT
    ON UPDATE CASCADE
) ENGINE=InnoDB;

INSERT INTO services (id, code, name, service_icon, service_tariff, admin_fee, is_active)
VALUES
  (UUID(), 'PAJAK', 'Pajak PBB', 'https://nutech-integrasi.app/dummy.jpg', 40000.00, 0.00, 1),
  (UUID(), 'PLN', 'Listrik', 'https://nutech-integrasi.app/dummy.jpg', 10000.00, 0.00, 1),
  (UUID(), 'PDAM', 'PDAM Berlangganan', 'https://nutech-integrasi.app/dummy.jpg', 40000.00, 0.00, 1),
  (UUID(), 'PULSA', 'Pulsa', 'https://nutech-integrasi.app/dummy.jpg', 40000.00, 0.00, 1),
  (UUID(), 'PGN', 'PGN Berlangganan', 'https://nutech-integrasi.app/dummy.jpg', 50000.00, 0.00, 1),
  (UUID(), 'MUSIK', 'Musik Berlangganan', 'https://nutech-integrasi.app/dummy.jpg', 50000.00, 0.00, 1),
  (UUID(), 'TV', 'TV Berlangganan', 'https://nutech-integrasi.app/dummy.jpg', 50000.00, 0.00, 1),
  (UUID(), 'PAKET_DATA', 'Paket data', 'https://nutech-integrasi.app/dummy.jpg', 50000.00, 0.00, 1),
  (UUID(), 'VOUCHER_GAME', 'Voucher Game', 'https://nutech-integrasi.app/dummy.jpg', 100000.00, 0.00, 1),
  (UUID(), 'VOUCHER_MAKANAN', 'Voucher Makanan', 'https://nutech-integrasi.app/dummy.jpg', 100000.00, 0.00, 1),
  (UUID(), 'QURBAN', 'Qurban', 'https://nutech-integrasi.app/dummy.jpg', 200000.00, 0.00, 1),
  (UUID(), 'ZAKAT', 'Zakat', 'https://nutech-integrasi.app/dummy.jpg', 300000.00, 0.00, 1)
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  service_icon = VALUES(service_icon),
  service_tariff = VALUES(service_tariff),
  admin_fee = VALUES(admin_fee),
  is_active = VALUES(is_active);
