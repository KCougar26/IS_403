-- Insert Users
INSERT INTO "User" (First_name, Last_name, Username, Password, Phone_number, Birthday)
VALUES
('Alice', 'Johnson', 'alicej', 'password123', '555-111-2222', '1990-05-15'),
('Bob', 'Smith', 'bobsmith', 'securepass', '555-333-4444', '1985-08-20'),
('Carol', 'Davis', 'carold', 'mypassword', '555-555-6666', '1992-12-01'),
('David', 'Lee', 'davidl', 'passw0rd', '555-777-8888', '1988-03-10');

-- Insert Organizers (linking to Users)
INSERT INTO Organizer (User_ID, Recognized)
VALUES
(1, TRUE),   -- Alice is an organizer
(2, FALSE);  -- Bob is an organizer

-- Insert Judges (linking to Users)
INSERT INTO Judge (User_ID, Highest_to_judge, ISTD_certified)
VALUES
(3, 'Professional', TRUE),  -- Carol is a judge
(4, 'Amateur', FALSE);      -- David is a judge

-- Insert Dancers (linking to Users)
INSERT INTO Dancer (User_ID, NDCA_number, NDCA_expiration, Type)
VALUES
(1, 12345, '2026-05-15', 'Lead'),
(2, 67890, '2026-08-20', 'Follow'),
(3, 54321, '2026-12-01', 'Lead');

-- Insert Competitions
INSERT INTO Competition (Organizer_ID, Location, Sanctioned)
VALUES
(1, 'New York City Ballroom', TRUE),
(2, 'Los Angeles Dance Hall', FALSE);

-- Insert Events
INSERT INTO Event (Competition_ID, Title, Start_date_time, End_date_time, Rounds)
VALUES
(1, 'Waltz Championship', '2025-11-20 18:00:00', '2025-11-20 21:00:00', 3),
(1, 'Tango Showdown', '2025-11-21 19:00:00', '2025-11-21 22:00:00', 4),
(2, 'Foxtrot Classic', '2025-12-05 17:00:00', '2025-12-05 20:00:00', 2);

-- Insert Judge Registrations
INSERT INTO Judge_Registration (Competition_ID, Judge_ID, JRegistration_date)
VALUES
(1, 1, CURRENT_DATE),  -- Carol judging NYC competition
(2, 2, CURRENT_DATE);  -- David judging LA competition

-- Insert Dancer Registrations
INSERT INTO Dancer_Registration (Competition_ID, Dancer_ID, Event_ID, DRegistration_date, Lead)
VALUES
(1, 1, 1, CURRENT_DATE, TRUE),   -- Alice dancing Waltz
(1, 2, 1, CURRENT_DATE, FALSE),  -- Bob dancing Waltz
(1, 3, 2, CURRENT_DATE, TRUE);   -- Carol dancing Tango