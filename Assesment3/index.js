require("dotenv").config();
const express = require("express");
const knex = require("knex");
const path = require("path");
const bodyParser = require("body-parser");

// ---- Express Config ----
const app = express();
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));

// ---- Knex Setup ----
const db = knex({
    client: "pg",
    connection: {
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        port: process.env.DB_PORT,
    },
});

// ---- Routes ----
// Home route: display all Pokémon ordered by name
app.get("/", (req, res) => {
  db("pokemon")
    .select("*")
    .orderBy("description", "asc")
    .then((pokemonList) => {
      res.render("index", { pokemonList });
    })
    .catch((err) => {
      console.error("Error fetching Pokémon:", err);
      res.status(500).send("Database error occurred");
    });
});

// Search route: find Pokémon by name
app.post("/searchPokemon", (req, res) => {
  const { name } = req.body;

  db("pokemon")
    .select("description", "base_total")
    .whereILike("description", `%${name}%`)
    .first()
    .then((result) => {
      if (result) {
        res.render("searchResult", { pokemon: result });
      } else {
        res.render("searchResult", { pokemon: null, query: name });
      }
    })
    .catch((err) => {
      console.error("Error searching Pokémon:", err);
      res.status(500).send("Error searching Pokémon");
    });
});

// ---- Start Server ----
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Server listening at http://localhost:${PORT}`);
});