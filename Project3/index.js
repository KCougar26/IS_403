require('dotenv').config();
const express = require("express");
const session = require("express-session");
const path = require("path");
const knex = require("knex")({
  client: "pg",
  connection: {
    host : process.env.RDS_HOST || "localhost",
    user : process.env.RDS_USER || "bigal66",
    password : process.env.RDS_PASSWORD || "killme66",
    database : process.env.RDS_NAME || "ballroom",
    port : process.env.RDS_PORT || 5432
  }
});

const app = express();
const port = process.env.PORT || 3000;

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

app.use(
  session({
    secret: process.env.SESSION_SECRET || "fallback-secret-key",
    resave: false,
    saveUninitialized: false,
  })
);

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

// Root route
app.get("/", function (req, res) {
  if (req.session.isLoggedIn) {
    res.render("index");
  } else {
    res.render("login", { error_message: "" });
  }
});

app.get('/login', (req, res) => {
  res.render('login', { error_message: '' });
});

app.get('/logout', (req, res) => {
  req.session.destroy()
  res.redirect('/login');
});

app.post('/login', (req, res) => {
  const sName = req.body.username;
  const sPassword = req.body.password;

  knex.select('*')
    .from('User')
    .where({ username: sName, password: sPassword })
    .then(users => {
      if (users.length > 0) {
        req.session.isLoggedIn = true;
        req.session.username = sName;
        res.redirect('/');
      } else {
        res.render('login', { error_message: 'Invalid username or password' });
      }
    })
    .catch(err => {
      console.error('Login error:', err);
      res.render('login', { error_message: 'Login failed. Try again.' });
    });
});

app.get('/register', (req, res) => {
  res.render('register', { error_message: '' });
});

app.post('/register', (req, res) => {
  const first_name = req.body.first_name;
  const last_name = req.body.last_name;
  const username = req.body.username;
  const password = req.body.password;
  const confirmPassword = req.body.confirmPassword;
  const phone = req.body.phone;
  const birthday = req.body.birthday;

  if (password !== confirmPassword) {
    return res.render('register', { error_message: 'Passwords do not match.' });
  }

  knex('User')
    .where({ username })
    .first()
    .then(existing => {
      if (existing) {
        return res.render('register', { error_message: 'Username already exists.' });
      }

      return knex('User')
        .insert({
          first_name: first_name,
          last_name: last_name,
          username: username,
          password: password,
          phone_number: phone,
          birthday: birthday
        })
        .then(() => {
          console.log('User registered successfully');
          res.redirect('/login');
        });
    })
    .catch(err => {
      console.error('Registration error:', err);
      res.render('register', { error_message: 'Registration failed.' });
    });
});

// --------------------- USERS CRUD ---------------------

app.get("/users", function (req, res) {
  knex.select().from("User")
    .then(function(users) {
      res.render("displayUsers", { users: users });
    })
    .catch(function(err) {
      console.error(err);
      res.send("Error retrieving users");
    });
});

app.get("/users/add", function (req, res) {
  res.render("users_form", { user: {}, action: "/users/add" });
});

app.post("/users/add", function (req, res) {
  const userData = {
    First_name: req.body.First_name,
    Last_name: req.body.Last_name,
    Username: req.body.Username,
    Password: req.body.Password,
    Phone_number: req.body.Phone_number,
    Birthday: req.body.Birthday
  };

  knex("User").insert(userData)
    .returning("User_ID")
    .then(function(ids) {
      const userId = ids[0];
      const role = req.body.role;

      if (role === "Judge") {
        return knex("judge").insert({
          User_ID: userId,
          Highest_to_judge: req.body.Highest_to_judge,
          ISTD_certified: req.body.ISTD_certified === "on"
        });
      } else if (role === "Dancer") {
        return knex("dancer").insert({
          User_ID: userId,
          NDCA_number: req.body.NDCA_number,
          NDCA_expiration: req.body.NDCA_expiration,
          Type: req.body.Type
        });
      } else if (role === "Organizer") {
        return knex("organizer").insert({
          User_ID: userId,
          Recognized: req.body.Recognized === "on"
        });
      }
    })
    .then(function() {
      res.redirect("/users");
    })
    .catch(function(err) {
      console.error(err);
      res.send("Error adding user");
    });
});

app.get("/users/edit/:id", function (req, res) {
  const id = req.params.id;
  knex("User").where("User_ID", id).first()
    .then(function(user) {
      res.render("users_form", { user: user, action: "/users/edit/" + id });
    });
});

app.post("/users/edit/:id", function (req, res) {
  const id = req.params.id;
  knex("User").where("User_ID", id)
    .update({
      First_name: req.body.First_name,
      Last_name: req.body.Last_name,
      Username: req.body.Username,
      Password: req.body.Password,
      Phone_number: req.body.Phone_number,
      Birthday: req.body.Birthday
    })
    .then(function() {
      res.redirect("/users");
    });
});

app.get("/users/delete/:id", function (req, res) {
  knex("User").where("User_ID", req.params.id).del()
    .then(function() {
      res.redirect("/users");
    });
});


// --------------------- COMPETITIONS CRUD ---------------------

app.get("/competitions", function (req, res) {
  knex.select().from("competition")
    .then(function(competitions) {
      res.render("competitions_list", { competitions: competitions });
    });
});

app.get("/competitions/add", function (req, res) {
  res.render("competitions_form", { competition: {}, action: "/competitions/add" });
});

app.post("/competitions/add", function (req, res) {
  knex("competition").insert({
    Organizer_ID: req.body.Organizer_ID || null,
    Location: req.body.Location,
    Sanctioned: req.body.Sanctioned === "on"
  })
  .then(function() {
    res.redirect("/competitions");
  });
});

app.get("/competitions/edit/:id", function (req, res) {
  knex("competition").where("Competition_ID", req.params.id).first()
    .then(function(competition) {
      res.render("competitions_form", { competition: competition, action: "/competitions/edit/" + req.params.id });
    });
});

app.post("/competitions/edit/:id", function (req, res) {
  knex("competition").where("Competition_ID", req.params.id)
    .update({
      Organizer_ID: req.body.Organizer_ID || null,
      Location: req.body.Location,
      Sanctioned: req.body.Sanctioned === "on"
    })
    .then(function() {
      res.redirect("/competitions");
    });
});

app.get("/competitions/delete/:id", function (req, res) {
  knex("competition").where("Competition_ID", req.params.id).del()
    .then(function() {
      res.redirect("/competitions");
    });
});


// --------------------- EVENTS CRUD ---------------------

app.get("/events", function (req, res) {
  knex.select().from("event")
    .then(function(events) {
      res.render("events_list", { events: events });
    });
});

app.get("/events/add", function (req, res) {
  res.render("events_form", { event: {}, action: "/events/add" });
});

app.post("/events/add", function (req, res) {
  knex("event").insert({
    Competition_ID: req.body.Competition_ID || null,
    Title: req.body.Title,
    Start_date_time: req.body.Start_date_time,
    End_date_time: req.body.End_date_time,
    Rounds: req.body.Rounds
  })
  .then(function() {
    res.redirect("/events");
  });
});

app.get("/events/edit/:id", function (req, res) {
  knex("event").where("Event_ID", req.params.id).first()
    .then(function(event) {
      res.render("events_form", { event: event, action: "/events/edit/" + req.params.id });
    });
});

app.post("/events/edit/:id", function (req, res) {
  knex("event").where("Event_ID", req.params.id)
    .update({
      Competition_ID: req.body.Competition_ID || null,
      Title: req.body.Title,
      Start_date_time: req.body.Start_date_time,
      End_date_time: req.body.End_date_time,
      Rounds: req.body.Rounds
    })
    .then(function() {
      res.redirect("/events");
    });
});

app.get("/events/delete/:id", function (req, res) {
  knex("event").where("Event_ID", req.params.id).del()
    .then(function() {
      res.redirect("/events");
    });
});

app.listen(port, function () {
  console.log("Server running on port " + port);
});