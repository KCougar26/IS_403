require("dotenv").config();
const express = require("express");
const session = require("express-session");
const knex = require("knex");
const path = require("path");
const bodyParser = require("body-parser");
const { type } = require("os");

// ---- Express Config ----
const app = express();
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(
  session({
    secret: process.env.SESSION_SECRET || "fallback-secret-key",
    resave: false,
    saveUninitialized: false,
  })
);
// ---- Knex Setup ----
const db = knex({
    client: "pg",
    connection: {
        host: process.env.DB_HOST || "localhost",
        user: process.env.DB_USER || "postgres",
        password: process.env.DB_PASSWORD || "killme66",
        database: process.env.DB_NAME || "is403",
        port: process.env.DB_PORT || 5432,
    },
});

// Global authentication middleware - runs on EVERY request 
app.use((req, res, next) => {
    // Skip authentication for login routes 
    if (req.path === '/' || req.path === '/login' || req.path === '/logout' || req.path === '/register') { 
        return next(); // Just process the request 
    } 
    if (req.session.isLoggedIn) { 
        next(); // User is logged in, continue 
    } 
    else { 
        res.render("login", { error_message: "Please log in to access this page" }); 
    } 
});

// User creation and usage routes
app.get('/logout', (req, res) => {
  req.session.destroy()
  res.redirect('/login');
});

app.get('/login', (req, res) => {
  res.render('login', { error_message: '' });
});

app.post('/login', (req, res) => {
  const sName = req.body.username;
  const sPassword = req.body.password;
  db("users")
    .where({ username: sName, password: sPassword })
    .then(users => {
      if (users.length === 0) {
        // Return here to prevent further execution
        return res.render('login', { error_message: 'Invalid username or password' });
      }
      req.session.user = {
        id: users[0].id,
        username: users[0].username,
        isManager: false
      };
      // Set session and redirect
      req.session.user.isManager = users[0].type === 'M';
      req.session.isLoggedIn = true;
      res.redirect('/');
    })
    .catch(err => {
      console.error('Login error:', err);
      res.render('login', { error_message: 'An error occurred during login' });
    });
});

app.get('/register', (req, res) => {
  res.render('register', { error_message: '' });
});

app.post('/register', (req, res) => {
  const sName = req.body.username;
  const sPassword = req.body.password;
  const role = req.body.role;
  db("users")
    .where({ username: sName })
    .then(users => {
      if (users.length > 0) {
        return res.render('register', { error_message: 'Username already exists' });
      }
      else {
        return db("users").insert({ username: sName, password: sPassword, type: role })
        .then(() => {
          res.redirect('/');
        });
      }
    });
  });
// Home route: display all Pokémon ordered by name
app.get("/", (req, res) => {
  if (!req.session.isLoggedIn) {
    res.render("login", { error_message: "" });
  }
  else {
  db("pokemon")
    .select("*")
    .orderBy("description", "asc")
    .then((pokemonList) => {
      res.render("index", { pokemonList, user: req.session.user });
    })
    .catch((err) => {
      console.error("Error fetching Pokémon:", err);
      res.status(500).send("Database error occurred");
    });
  }
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

// ---- User List Routes ----
app.get("/user_list", (req, res) => {
  db("users")
    .select("*")
    .orderBy("id", "asc")
    .then((users) => {
      res.render("user_list", { users, user: req.session.user });
    })
    .catch((err) => {
      console.error("Error fetching users:", err);
      res.status(500).send("Database error occurred");
    });
});

app.get("/user_edit/:id", (req, res) => {
  const userId = req.params.id;
  db("users").where("id", userId).first()
    .then((userToEdit) => {
      res.render("user_edit", { userToEdit, user: req.session.user });
    });
});

app.post("/user_edit/:id", function (req, res) {
  const userId = req.params.id;
  const updatedUsername = req.body.username;
  const updatedPassword = req.body.password;
  const updatedType = req.body.role;
  db("users").where("id", userId).update({
    password: updatedPassword,
    type: updatedType
  })
    .then(function() {
      res.redirect("/user_list");
    });
});

app.post("/user_delete/:id", function (req, res) {
  db("users").where("id", req.params.id).del()
    .then(function() {
      res.redirect("/user_list");
    });
});

// ---- Start Server ----
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Server listening at http://localhost:${PORT}`);
});