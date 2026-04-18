-- ============================================================
-- Project Rabbit - Complete MySQL Database Schema
-- Database: kanak_digifex_project_mart
-- Run this file in phpMyAdmin or MySQL CLI to setup DB
-- ============================================================

CREATE DATABASE IF NOT EXISTS `kanak_digifex_project_mart`
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE `kanak_digifex_project_mart`;

-- ========================
-- CATEGORIES
-- ========================
CREATE TABLE IF NOT EXISTS `categories` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `image` VARCHAR(500) DEFAULT '',
  `price` DECIMAL(10,2) DEFAULT 0,
  `description` TEXT,
  `link` VARCHAR(500) DEFAULT '',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ========================
-- READY PROJECTS
-- ========================
CREATE TABLE IF NOT EXISTS `ready_projects` (
  `ProjectID` INT AUTO_INCREMENT PRIMARY KEY,
  `ProjectTitle` VARCHAR(300) NOT NULL,
  `ProjectCategory` VARCHAR(200) DEFAULT '',
  `ProjectDescription` TEXT,
  `ProjectImage` VARCHAR(500) DEFAULT '',
  `ProjectZIPFile` VARCHAR(500) DEFAULT '',
  `Price` DECIMAL(10,2) DEFAULT 0,
  `Rating` DECIMAL(3,1) DEFAULT 0,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ========================
-- MINI PROJECTS
-- ========================
CREATE TABLE IF NOT EXISTS `mini_projects` (
  `ProjectID` INT AUTO_INCREMENT PRIMARY KEY,
  `ProjectTitle` VARCHAR(300) NOT NULL,
  `ProjectCategory` VARCHAR(200) DEFAULT '',
  `ProjectDescription` TEXT,
  `ProjectImage` VARCHAR(500) DEFAULT '',
  `ProjectZIPFile` VARCHAR(500) DEFAULT '',
  `Price` DECIMAL(10,2) DEFAULT 0,
  `Rating` DECIMAL(3,1) DEFAULT 0,
  `Author` VARCHAR(200) DEFAULT '',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ========================
-- BUNDLE PROJECTS
-- ========================
CREATE TABLE IF NOT EXISTS `bundle_projects` (
  `ProjectID` INT AUTO_INCREMENT PRIMARY KEY,
  `ProjectTitle` VARCHAR(300) NOT NULL,
  `ProjectCategory` VARCHAR(200) DEFAULT '',
  `ProjectDescription` TEXT,
  `ProjectImage` VARCHAR(500) DEFAULT '',
  `ProjectZIPFile` VARCHAR(500) DEFAULT '',
  `Documentation` VARCHAR(500) DEFAULT '',
  `PPT` VARCHAR(500) DEFAULT '',
  `Report` VARCHAR(500) DEFAULT '',
  `Price` DECIMAL(10,2) DEFAULT 0,
  `Rating` DECIMAL(3,1) DEFAULT 0,
  `Author` VARCHAR(200) DEFAULT '',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ========================
-- CUSTOMIZED PROJECTS (REQUESTS)
-- ========================
CREATE TABLE IF NOT EXISTS `customized_projects` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(200) NOT NULL,
  `email` VARCHAR(200) NOT NULL,
  `phone` VARCHAR(20) DEFAULT '',
  `technology` VARCHAR(300) DEFAULT '',
  `description` TEXT,
  `status` ENUM('NEW','IN_PROGRESS','COMPLETED','REJECTED') DEFAULT 'NEW',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ========================
-- ECOMMERCE PROJECTS
-- ========================
CREATE TABLE IF NOT EXISTS `ecommerce_projects` (
  `ProjectID` INT AUTO_INCREMENT PRIMARY KEY,
  `ProjectTitle` VARCHAR(300) NOT NULL,
  `ProjectCategory` VARCHAR(200) DEFAULT '',
  `ProjectDescription` TEXT,
  `ProjectImage` VARCHAR(500) DEFAULT '',
  `ProjectZIPFile` VARCHAR(500) DEFAULT '',
  `Price` DECIMAL(10,2) DEFAULT 0,
  `Rating` DECIMAL(3,1) DEFAULT 0,
  `Author` VARCHAR(200) DEFAULT '',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ========================
-- WEB DEVELOPMENT PROJECTS
-- ========================
CREATE TABLE IF NOT EXISTS `web_development_projects` (
  `ProjectID` INT AUTO_INCREMENT PRIMARY KEY,
  `ProjectTitle` VARCHAR(300) NOT NULL,
  `ProjectCategory` VARCHAR(200) DEFAULT '',
  `ProjectDescription` TEXT,
  `ProjectImage` VARCHAR(500) DEFAULT '',
  `ProjectZIPFile` VARCHAR(500) DEFAULT '',
  `Price` DECIMAL(10,2) DEFAULT 0,
  `Rating` DECIMAL(3,1) DEFAULT 0,
  `Technologies` VARCHAR(500) DEFAULT '',
  `Compatibility` VARCHAR(300) DEFAULT '',
  `Author` VARCHAR(200) DEFAULT '',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ========================
-- FULLSTACK PROJECTS
-- ========================
CREATE TABLE IF NOT EXISTS `fullstack_projects` (
  `ProjectID` INT AUTO_INCREMENT PRIMARY KEY,
  `ProjectTitle` VARCHAR(300) NOT NULL,
  `ProjectCategory` VARCHAR(200) DEFAULT '',
  `ProjectDescription` TEXT,
  `ProjectImage` VARCHAR(500) DEFAULT '',
  `ProjectZIPFile` VARCHAR(500) DEFAULT '',
  `Price` DECIMAL(10,2) DEFAULT 0,
  `Rating` DECIMAL(3,1) DEFAULT 0,
  `Author` VARCHAR(200) DEFAULT '',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ========================
-- MOBILE APP PROJECTS
-- ========================
CREATE TABLE IF NOT EXISTS `mobile_projects` (
  `ProjectID` INT AUTO_INCREMENT PRIMARY KEY,
  `ProjectTitle` VARCHAR(300) NOT NULL,
  `ProjectCategory` VARCHAR(200) DEFAULT '',
  `ProjectDescription` TEXT,
  `ProjectImage` VARCHAR(500) DEFAULT '',
  `ProjectZIPFile` VARCHAR(500) DEFAULT '',
  `Price` DECIMAL(10,2) DEFAULT 0,
  `Rating` DECIMAL(3,1) DEFAULT 0,
  `Author` VARCHAR(200) DEFAULT '',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ========================
-- AI / ML / IoT PROJECTS
-- ========================
CREATE TABLE IF NOT EXISTS `ai_projects` (
  `ProjectID` INT AUTO_INCREMENT PRIMARY KEY,
  `ProjectTitle` VARCHAR(300) NOT NULL,
  `ProjectType` VARCHAR(200) DEFAULT '',
  `ProjectDescription` TEXT,
  `ProjectImage` VARCHAR(500) DEFAULT '',
  `ProjectZIPFile` VARCHAR(500) DEFAULT '',
  `Price` DECIMAL(10,2) DEFAULT 0,
  `Rating` DECIMAL(3,1) DEFAULT 0,
  `Author` VARCHAR(200) DEFAULT '',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ========================
-- DATA SCIENCE / BIG DATA PROJECTS
-- ========================
CREATE TABLE IF NOT EXISTS `ds_projects` (
  `ProjectID` INT AUTO_INCREMENT PRIMARY KEY,
  `ProjectTitle` VARCHAR(300) NOT NULL,
  `ProjectDescription` TEXT,
  `ProjectImage` VARCHAR(500) DEFAULT '',
  `ProjectZIPFile` VARCHAR(500) DEFAULT '',
  `Price` DECIMAL(10,2) DEFAULT 0,
  `Rating` DECIMAL(3,1) DEFAULT 0,
  `Author` VARCHAR(200) DEFAULT '',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ========================
-- GAMING PROJECTS
-- ========================
CREATE TABLE IF NOT EXISTS `gaming_projects` (
  `ProjectID` INT AUTO_INCREMENT PRIMARY KEY,
  `ProjectTitle` VARCHAR(300) NOT NULL,
  `ProjectDescription` TEXT,
  `ProjectImage` VARCHAR(500) DEFAULT '',
  `ProjectZIPFile` VARCHAR(500) DEFAULT '',
  `Price` DECIMAL(10,2) DEFAULT 0,
  `Rating` DECIMAL(3,1) DEFAULT 0,
  `Author` VARCHAR(200) DEFAULT '',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ========================
-- CYBER SECURITY PROJECTS
-- ========================
CREATE TABLE IF NOT EXISTS `cyber_projects` (
  `ProjectID` INT AUTO_INCREMENT PRIMARY KEY,
  `ProjectTitle` VARCHAR(300) NOT NULL,
  `ProjectDescription` TEXT,
  `ProjectImage` VARCHAR(500) DEFAULT '',
  `ProjectZIPFile` VARCHAR(500) DEFAULT '',
  `Price` DECIMAL(10,2) DEFAULT 0,
  `Rating` DECIMAL(3,1) DEFAULT 0,
  `Author` VARCHAR(200) DEFAULT '',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ========================
-- BLOCKCHAIN PROJECTS
-- ========================
CREATE TABLE IF NOT EXISTS `blockchain_projects` (
  `ProjectID` INT AUTO_INCREMENT PRIMARY KEY,
  `ProjectTitle` VARCHAR(300) NOT NULL,
  `ProjectDescription` TEXT,
  `ProjectImage` VARCHAR(500) DEFAULT '',
  `ProjectZIPFile` VARCHAR(500) DEFAULT '',
  `Price` DECIMAL(10,2) DEFAULT 0,
  `Rating` DECIMAL(3,1) DEFAULT 0,
  `Author` VARCHAR(200) DEFAULT '',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ========================
-- CLOUD & DEVOPS PROJECTS
-- ========================
CREATE TABLE IF NOT EXISTS `cloud_projects` (
  `ProjectID` INT AUTO_INCREMENT PRIMARY KEY,
  `ProjectTitle` VARCHAR(300) NOT NULL,
  `ProjectType` VARCHAR(200) DEFAULT '',
  `ProjectDescription` TEXT,
  `ProjectImage` VARCHAR(500) DEFAULT '',
  `ProjectZIPFile` VARCHAR(500) DEFAULT '',
  `Price` DECIMAL(10,2) DEFAULT 0,
  `Rating` DECIMAL(3,1) DEFAULT 0,
  `Author` VARCHAR(200) DEFAULT '',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ========================
-- E-LEARNING PROJECTS
-- ========================
CREATE TABLE IF NOT EXISTS `elearning_projects` (
  `ProjectID` INT AUTO_INCREMENT PRIMARY KEY,
  `ProjectTitle` VARCHAR(300) NOT NULL,
  `ProjectDescription` TEXT,
  `ProjectImage` VARCHAR(500) DEFAULT '',
  `ProjectZIPFile` VARCHAR(500) DEFAULT '',
  `Price` DECIMAL(10,2) DEFAULT 0,
  `Rating` DECIMAL(3,1) DEFAULT 0,
  `Author` VARCHAR(200) DEFAULT '',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ========================
-- ROADMAPS
-- ========================
CREATE TABLE IF NOT EXISTS `roadmaps` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `title` VARCHAR(300) NOT NULL,
  `short_description` TEXT,
  `image` VARCHAR(500) DEFAULT '',
  `category` VARCHAR(200) DEFAULT '',
  `duration` VARCHAR(100) DEFAULT '',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ========================
-- COMMENTS / CONTACT REQUESTS
-- ========================
CREATE TABLE IF NOT EXISTS `comments` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(200) NOT NULL,
  `email` VARCHAR(200) NOT NULL,
  `message` TEXT,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ========================
-- ORDERS (RAZORPAY PAYMENTS)
-- ========================
CREATE TABLE IF NOT EXISTS `orders` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `order_id` VARCHAR(100) NOT NULL UNIQUE,
  `payment_id` VARCHAR(100) NOT NULL,
  `project_id` VARCHAR(50) NOT NULL,
  `project_type` VARCHAR(100) NOT NULL,
  `project_title` VARCHAR(300) NOT NULL,
  `amount` DECIMAL(10,2) NOT NULL,
  `buyer_name` VARCHAR(200) NOT NULL,
  `buyer_email` VARCHAR(200) NOT NULL,
  `buyer_phone` VARCHAR(20) DEFAULT '',
  `status` ENUM('PAID','PENDING','FAILED','REFUNDED') DEFAULT 'PAID',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_buyer_email` (`buyer_email`),
  INDEX `idx_payment_id` (`payment_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ========================
-- SAMPLE DATA (Optional)
-- ========================
INSERT IGNORE INTO `categories` (`name`, `image`, `price`, `description`, `link`) VALUES
('Web Development', 'cat-web.jpg', 499.00, 'HTML, CSS, JS, PHP projects', '/ready-project-details'),
('Mini Projects', 'cat-mini.jpg', 299.00, 'Small academic mini projects', '/mini-project-details'),
('Bundle Projects', 'cat-bundle.jpg', 999.00, 'Full package with docs, PPT, report', '/bundle-project-details'),
('AI / ML Projects', 'cat-ai.jpg', 799.00, 'Artificial Intelligence & Machine Learning', '/ai-projects'),
('Mobile Apps', 'cat-mobile.jpg', 599.00, 'Android & Flutter app projects', '/mobile-projects'),
('Full Stack Projects', 'cat-fullstack.jpg', 699.00, 'Complete frontend + backend projects', '/fullstack-projects');
