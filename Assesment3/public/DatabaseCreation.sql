-- Create the pokemon table
CREATE TABLE IF NOT EXISTS pokemon (
    id SERIAL PRIMARY KEY,
    description VARCHAR(30) NOT NULL,
    base_total INTEGER NOT NULL
);

-- Insert sample Pokémon
INSERT INTO pokemon (description, base_total) VALUES
('Bulbasaur', 318),
('Ivysaur', 405),
('Charizard', 634),
('Venusaur', 625),
('Squirtle', 314)
ON CONFLICT DO NOTHING;

-- Create the users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL,
    password VARCHAR(255) NOT NULL,
    type CHAR(1) NOT NULL CHECK (type IN ('M', 'U'))
);

-- Insert sample users
INSERT INTO users (username, password, type) VALUES
('manager1', 'password123', 'M'),
('user1', 'password456', 'U')
ON CONFLICT DO NOTHING;