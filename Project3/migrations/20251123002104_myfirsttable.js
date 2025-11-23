/**
 * @param { import("knex").Knex } knex
 */

exports.up = async function (knex) {
  // USER
  await knex.schema.createTable("User", (table) => {
    table.increments("User_ID").primary();
    table.string("First_name", 50).notNullable();
    table.string("Last_name", 50).notNullable();
    table.string("Username", 50).notNullable().unique();
    table.string("Password", 255).notNullable();
    table.string("Phone_number", 20);
    table.date("Birthday");
  });

  // ORGANIZER
  await knex.schema.createTable("Organizer", (table) => {
    table.increments("Organizer_ID").primary();
    table
      .integer("User_ID")
      .references("User_ID")
      .inTable("User")
      .onDelete("CASCADE");
    table.boolean("Recognized").defaultTo(false);
    table.string("addcodeused", 20).notNullable();
  });

  // JUDGE
  await knex.schema.createTable("Judge", (table) => {
    table.increments("Judge_ID").primary();
    table
      .integer("User_ID")
      .references("User_ID")
      .inTable("User")
      .onDelete("CASCADE");
    table.string("Highest_to_judge", 50);
    table.boolean("ISTD_certified").defaultTo(false);
    table.string("addcodeused", 20).notNullable();
  });

  // DANCER
  await knex.schema.createTable("Dancer", (table) => {
    table.increments("Dancer_ID").primary();
    table
      .integer("User_ID")
      .references("User_ID")
      .inTable("User")
      .onDelete("CASCADE");
    table.integer("NDCA_number");
    table.date("NDCA_expiration");
    table.string("Type", 20);
  });

  // ADMINS
  await knex.schema.createTable("Admins", (table) => {
    table.increments("Admin_ID").primary();
    table
      .integer("User_ID")
      .references("User_ID")
      .inTable("User")
      .onDelete("CASCADE");
  });

  // COMPETITION
  await knex.schema.createTable("Competition", (table) => {
    table.increments("Competition_ID").primary();
    table
      .integer("Organizer_ID")
      .references("Organizer_ID")
      .inTable("Organizer")
      .onDelete("SET NULL");
    table.string("Location", 100);
    table.boolean("Sanctioned").defaultTo(false);
  });

  // ADDCODES
  await knex.schema.createTable("AddCodes", (table) => {
    table.increments("Code_ID").primary();
    table
      .integer("Competition_ID")
      .references("Competition_ID")
      .inTable("Competition")
      .onDelete("CASCADE");
    table.string("Code", 20).unique().notNullable();
    table
      .string("CodeType", 20)
      .notNullable()
      .checkIn(["Organizer", "Judge"]);
  });

  // EVENT
  await knex.schema.createTable("Event", (table) => {
    table.increments("Event_ID").primary();
    table
      .integer("Competition_ID")
      .references("Competition_ID")
      .inTable("Competition")
      .onDelete("CASCADE");
    table.string("Title", 100);
    table.timestamp("Start_date_time");
    table.timestamp("End_date_time");
    table.integer("Rounds");
  });

  // JUDGE REGISTRATION
  await knex.schema.createTable("Judge_Registration", (table) => {
    table.increments("JRegistration_ID").primary();
    table
      .integer("Competition_ID")
      .references("Competition_ID")
      .inTable("Competition")
      .onDelete("CASCADE");
    table
      .integer("Judge_ID")
      .references("Judge_ID")
      .inTable("Judge")
      .onDelete("CASCADE");
    table.date("JRegistration_date").defaultTo(knex.fn.now());
  });

  // DANCER REGISTRATION
  await knex.schema.createTable("Dancer_Registration", (table) => {
    table.increments("DRegistration_ID").primary();
    table
      .integer("Competition_ID")
      .references("Competition_ID")
      .inTable("Competition")
      .onDelete("CASCADE");
    table
      .integer("Dancer_ID")
      .references("Dancer_ID")
      .inTable("Dancer")
      .onDelete("CASCADE");
    table
      .integer("Event_ID")
      .references("Event_ID")
      .inTable("Event")
      .onDelete("CASCADE");
    table.date("DRegistration_date").defaultTo(knex.fn.now());
    table.boolean("Lead");
  });
};

exports.down = async function (knex) {
  await knex.schema.dropTableIfExists("Dancer_Registration");
  await knex.schema.dropTableIfExists("Judge_Registration");
  await knex.schema.dropTableIfExists("Event");
  await knex.schema.dropTableIfExists("AddCodes");
  await knex.schema.dropTableIfExists("Competition");
  await knex.schema.dropTableIfExists("Admins");
  await knex.schema.dropTableIfExists("Dancer");
  await knex.schema.dropTableIfExists("Judge");
  await knex.schema.dropTableIfExists("Organizer");
  await knex.schema.dropTableIfExists("User");
};