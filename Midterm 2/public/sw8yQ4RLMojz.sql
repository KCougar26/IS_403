-- ==========================================
-- IS403 Workshop App - Schema Creation Script
-- ==========================================

-- CREATE DATABASE is403;

-- Drop tables if they exist (for clean re-runs)
DROP TABLE IF EXISTS workshops;
DROP TABLE IF EXISTS users;

-- ==========================
-- users table
-- ==========================
CREATE TABLE users (
    id            SERIAL PRIMARY KEY,
    username      VARCHAR(50) NOT NULL UNIQUE,
    password      VARCHAR(100) NOT NULL,   -- plain string (not encrypted)
    level         CHAR(1) NOT NULL CHECK (level IN ('M', 'U')),
    created_date  DATE NOT NULL DEFAULT CURRENT_DATE
);

-- ==========================
-- workshops table
-- ==========================
CREATE TABLE workshops (
    id             SERIAL PRIMARY KEY,
    title          VARCHAR(200) NOT NULL,
    description    TEXT NOT NULL,
    event_date     DATE NOT NULL,
    location       VARCHAR(200) NOT NULL,
    max_seats      INTEGER NOT NULL,
    created_date   DATE NOT NULL DEFAULT CURRENT_DATE,
    updated_date   DATE NOT NULL DEFAULT CURRENT_DATE
);

-- ==========================================
-- Seed Users (Manager + Standard User)
-- ==========================================

INSERT INTO users (username, password, level)
VALUES 
    ('manager1', 'managerpass', 'M'),
    ('user1', 'userpass', 'U');