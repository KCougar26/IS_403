/**
 * @param { import("knex").Knex } knex
 */
exports.seed = async function (knex) {
  // Clear all
  await knex("Dancer_Registration").del();
  await knex("Judge_Registration").del();
  await knex("Event").del();
  await knex("AddCodes").del();
  await knex("Competition").del();
  await knex("Admins").del();
  await knex("Dancer").del();
  await knex("Judge").del();
  await knex("Organizer").del();
  await knex("User").del();

  // USER
  const users = await knex("User").insert(
    [
      {
        First_name: "Alice",
        Last_name: "Johnson",
        Username: "alicej",
        Password: "password123",
        Phone_number: "555-111-2222",
        Birthday: "1990-05-15",
      },
      {
        First_name: "Bob",
        Last_name: "Smith",
        Username: "bobsmith",
        Password: "securepass",
        Phone_number: "555-333-4444",
        Birthday: "1985-08-20",
      },
      {
        First_name: "Carol",
        Last_name: "Davis",
        Username: "carold",
        Password: "mypassword",
        Phone_number: "555-555-6666",
        Birthday: "1992-12-01",
      },
      {
        First_name: "David",
        Last_name: "Lee",
        Username: "davidl",
        Password: "passw0rd",
        Phone_number: "555-777-8888",
        Birthday: "1988-03-10",
      },
      {
        First_name: "Allen",
        Last_name: "Schultz",
        Username: "a",
        Password: "a",
        Phone_number: "555-999-0000",
        Birthday: "1980-01-01",
      },
    ],
    ["User_ID"]
  );

  // ORGANIZER
  await knex("Organizer").insert([
    { User_ID: users[0].User_ID, Recognized: true, addcodeused: "ORG-9F3KD2" },
    { User_ID: users[1].User_ID, Recognized: false, addcodeused: "ORG-PQ8ZL1" },
  ]);

  // JUDGE
  await knex("Judge").insert([
    {
      User_ID: users[2].User_ID,
      Highest_to_judge: "Professional",
      ISTD_certified: true,
      addcodeused: "JDG-AB12CD",
    },
    {
      User_ID: users[3].User_ID,
      Highest_to_judge: "Amateur",
      ISTD_certified: false,
      addcodeused: "JDG-X91PLT",
    },
  ]);

  // DANCER
  await knex("Dancer").insert([
    {
      User_ID: users[0].User_ID,
      NDCA_number: 12345,
      NDCA_expiration: "2026-05-15",
      Type: "Lead",
    },
    {
      User_ID: users[1].User_ID,
      NDCA_number: 67890,
      NDCA_expiration: "2026-08-20",
      Type: "Follow",
    },
    {
      User_ID: users[2].User_ID,
      NDCA_number: 54321,
      NDCA_expiration: "2026-12-01",
      Type: "Lead",
    },
  ]);

  // ADMIN
  await knex("Admins").insert([{ User_ID: users[4].User_ID }]);

  // COMPETITION
  const comps = await knex("Competition").insert(
    [
      { Organizer_ID: 1, Location: "New York City Ballroom", Sanctioned: true },
      { Organizer_ID: 2, Location: "Los Angeles Dance Hall", Sanctioned: false },
    ],
    ["Competition_ID"]
  );

  // ADDCODES
  await knex("AddCodes").insert([
    { Competition_ID: null, Code: "ORG-9F3KD2", CodeType: "Organizer" },
    { Competition_ID: null, Code: "ORG-PQ8ZL1", CodeType: "Organizer" },
    { Competition_ID: null, Code: "ORG-K27MHD", CodeType: "Organizer" },
    { Competition_ID: comps[0].Competition_ID, Code: "JDG-AB12CD", CodeType: "Judge" },
    { Competition_ID: comps[1].Competition_ID, Code: "JDG-X91PLT", CodeType: "Judge" },
    { Competition_ID: comps[1].Competition_ID, Code: "JDG-FF72QW", CodeType: "Judge" },
  ]);

  // EVENTS
  const events = await knex("Event").insert(
    [
      {
        Competition_ID: comps[0].Competition_ID,
        Title: "Waltz Championship",
        Start_date_time: "2025-11-20 18:00:00",
        End_date_time: "2025-11-20 21:00:00",
        Rounds: 3,
      },
      {
        Competition_ID: comps[0].Competition_ID,
        Title: "Tango Showdown",
        Start_date_time: "2025-11-21 19:00:00",
        End_date_time: "2025-11-21 22:00:00",
        Rounds: 4,
      },
      {
        Competition_ID: comps[1].Competition_ID,
        Title: "Foxtrot Classic",
        Start_date_time: "2025-12-05 17:00:00",
        End_date_time: "2025-12-05 20:00:00",
        Rounds: 2,
      },
    ],
    ["Event_ID"]
  );

  // JUDGE REG
  await knex("Judge_Registration").insert([
    { Competition_ID: comps[0].Competition_ID, Judge_ID: 1 },
    { Competition_ID: comps[1].Competition_ID, Judge_ID: 2 },
  ]);

  // DANCER REG
  await knex("Dancer_Registration").insert([
    {
      Competition_ID: comps[0].Competition_ID,
      Dancer_ID: 1,
      Event_ID: 1,
      Lead: true,
    },
    {
      Competition_ID: comps[0].Competition_ID,
      Dancer_ID: 2,
      Event_ID: 1,
      Lead: false,
    },
    {
      Competition_ID: comps[0].Competition_ID,
      Dancer_ID: 3,
      Event_ID: 2,
      Lead: true,
    },
  ]);
};