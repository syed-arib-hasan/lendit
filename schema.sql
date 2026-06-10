-- LendIt - Neon Postgres Schema
-- Run this in your Neon SQL editor to set up the database

CREATE TABLE IF NOT EXISTS users (
  id        SERIAL PRIMARY KEY,
  email     TEXT UNIQUE NOT NULL,
  name      TEXT NOT NULL,
  password  TEXT NOT NULL,  -- bcrypt hashed
  phone     TEXT,
  location  TEXT,
  latitude  DECIMAL(10,8),
  longitude DECIMAL(10,8),
  image_url TEXT,
  penalty_score INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS items (
  id         SERIAL PRIMARY KEY,
  owner_email TEXT NOT NULL REFERENCES users(email) ON DELETE CASCADE,
  status     TEXT NOT NULL DEFAULT 'available', -- 'available' | 'borrowed'
  category   TEXT NOT NULL,                     -- 'book' | 'electronic' | 'gear'
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS books (
  item_id     INT PRIMARY KEY REFERENCES items(id) ON DELETE CASCADE,
  title       TEXT NOT NULL,
  author      TEXT NOT NULL,
  publisher   TEXT NOT NULL,
  description TEXT,
  image_url   TEXT
);

CREATE TABLE IF NOT EXISTS electronics (
  item_id     INT PRIMARY KEY REFERENCES items(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  brand       TEXT NOT NULL,
  model       TEXT NOT NULL,
  description TEXT,
  image_url   TEXT
);

CREATE TABLE IF NOT EXISTS gear (
  item_id     INT PRIMARY KEY REFERENCES items(id) ON DELETE CASCADE,
  type        TEXT NOT NULL,
  spec        TEXT,
  brand       TEXT NOT NULL,
  description TEXT,
  image_url   TEXT
);

CREATE TABLE IF NOT EXISTS borrow_requests (
  id            SERIAL PRIMARY KEY,
  item_id       INT NOT NULL REFERENCES items(id) ON DELETE CASCADE,
  borrower_email TEXT NOT NULL REFERENCES users(email),
  lender_email  TEXT NOT NULL REFERENCES users(email),
  status        TEXT NOT NULL DEFAULT 'pending', -- 'pending' | 'accepted' | 'rejected'
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS active_borrows (
  id             SERIAL PRIMARY KEY,
  item_id        INT NOT NULL REFERENCES items(id),
  borrower_email TEXT NOT NULL REFERENCES users(email),
  lender_email   TEXT NOT NULL REFERENCES users(email),
  due_date       DATE NOT NULL DEFAULT (CURRENT_DATE + INTERVAL '14 days'),
  borrowed_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS history (
  id             SERIAL PRIMARY KEY,
  item_id        INT NOT NULL,
  borrower_email TEXT NOT NULL,
  lender_email   TEXT NOT NULL,
  penalty        INT DEFAULT 0,
  returned_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ratings (
  id             SERIAL PRIMARY KEY,
  borrower_email TEXT NOT NULL REFERENCES users(email),
  lender_email   TEXT NOT NULL REFERENCES users(email),
  rating         DECIMAL(2,1) NOT NULL CHECK (rating >= 1 AND rating <= 5),
  created_at     TIMESTAMPTZ DEFAULT NOW()
);

-- Seed some demo data (optional)
INSERT INTO users (email, name, password, phone, location, latitude, longitude, image_url) VALUES
('alice@demo.com', 'Alice Chen',    '$2b$10$rQJ5RxuGmxpEQAH1w3VPnOExC5FxFPc3hVx3wQPv2Z5vW3qKDSFOq', '+1 212 555 0101', 'New York, NY',     40.7128, -74.0060, 'https://api.dicebear.com/7.x/personas/svg?seed=alice'),
('bob@demo.com',   'Bob Martinelli','$2b$10$rQJ5RxuGmxpEQAH1w3VPnOExC5FxFPc3hVx3wQPv2Z5vW3qKDSFOq', '+1 213 555 0187', 'Los Angeles, CA',  34.0522, -118.2437,'https://api.dicebear.com/7.x/personas/svg?seed=bob')
ON CONFLICT DO NOTHING;
-- demo password for both: "password123"
