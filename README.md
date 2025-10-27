CREATE TYPE user_role AS ENUM ('employee', 'admin');
CREATE TYPE reaction_type AS ENUM ('like', 'clap', 'star');

-- #################################
-- ## 2. CREATE TABLES
-- #################################

-- Users table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    hashed_password VARCHAR(200) NOT NULL, -- Changed from 'password' and VARCHAR(100)
    department VARCHAR(100),
    role user_role NOT NULL,
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ShoutOuts table
CREATE TABLE shoutouts (
    id SERIAL PRIMARY KEY,
    sender_id INT REFERENCES users(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ShoutOutRecipients table
CREATE TABLE shoutout_recipients (
    id SERIAL PRIMARY KEY,
    shoutout_id INT REFERENCES shoutouts(id) ON DELETE CASCADE,
    recipient_id INT REFERENCES users(id) ON DELETE CASCADE
);

-- Comments table
CREATE TABLE comments (
    id SERIAL PRIMARY KEY,
    shoutout_id INT REFERENCES shoutouts(id) ON DELETE CASCADE,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Reactions table
CREATE TABLE reactions (
    id SERIAL PRIMARY KEY,
    shoutout_id INT REFERENCES shoutouts(id) ON DELETE CASCADE,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    type reaction_type NOT NULL
);

-- Reports table
CREATE TABLE reports (
    id SERIAL PRIMARY KEY,
    shoutout_id INT REFERENCES shoutouts(id) ON DELETE CASCADE,
    reported_by INT REFERENCES users(id) ON DELETE CASCADE,
    reason TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- AdminLogs table
CREATE TABLE admin_logs (
    id SERIAL PRIMARY KEY,
    admin_id INT REFERENCES users(id) ON DELETE CASCADE,
    action TEXT NOT NULL,
    target_id INT NOT NULL,
    target_type VARCHAR(100) NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);# Brag_Board_Team6
