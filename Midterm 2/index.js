require("dotenv").config();
const express = require("express");
const session = require("express-session");
const knex = require("knex");
const path = require("path");
const bodyParser = require("body-parser");
const { type } = require("os");
const e = require("express");

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
      req.session.user.isManager = users[0].level === 'M';
      req.session.isLoggedIn = true;
      res.redirect('/');
    })
    .catch(err => {
      console.error('Login error:', err);
      res.render('login', { error_message: 'An error occurred during login' });
    });
});

// ---- User Registration Routes ----
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
        return db("users").insert({ username: sName, password: sPassword, level: role })
        .then(() => {
          res.redirect('/');
        });
      }
    });
  });

// ---- Home Route ----
app.get("/", (req, res) => {
  if (!req.session.isLoggedIn) {
    res.render("login", { error_message: "" });
  }
  else {
  db("workshops")
    .select("*")
    .orderBy("event_date", "asc")
    .then((worshopList) => {
      res.render("index", { worshopList, user: req.session.user});
    })
    .catch((err) => {
      console.error("Error fetching Workshops:", err);
      res.status(500).send("Database error occurred");
    });
  }
});

// ---- Workshop Add Routes ----
app.get('/workshop_add', (req, res) => {
  if (!req.session.user.isManager) {
    res.render('login', { error_message: 'Access denied: Managers only'});
  }
  else {
    res.render('workshop_add', { error_message: '', user: req.session.user });
  }
});

app.post('/workshop_add', (req, res) => {
  const sTitle = req.body.title;
  const sDescription = req.body.description;
  const dEvent_date = req.body.event_date;
  const sLocation = req.body.location;
  const iMax_seats = req.body.max_seats;
  db("workshops")
      return db("workshops").insert({ title: sTitle, description: sDescription, event_date: dEvent_date, location: sLocation,max_seats: iMax_seats })
      .then(() => {
        res.redirect('/');
      });
});

// ---- Workshop Edit Routes ----
app.get('/workshop_edit/:id', (req, res) => {
  if (!req.session.user.isManager) {
      res.render('login', { error_message: 'Access denied: Managers only'});
  }
  else {
    const workshopId = req.params.id;
    db("workshops").where("id", workshopId).first()
      .then((workshopToEdit) => {
        res.render("workshop_edit", { workshopToEdit, user: req.session.user, error_message: '' });
      });
  }
});

app.post('/workshop_edit/:id', (req, res) => {
  const workshopId = req.params.id;
  const updatedTitle = req.body.title;
  const updatedDescription = req.body.description;
  const updatedEvent_date = req.body.event_date;
  const updatedLocation = req.body.location;
  const updatedMax_seats = req.body.max_seats;
  db("workshops").where("id", workshopId).update({
    title: updatedTitle,
    description: updatedDescription,
    event_date: updatedEvent_date,
    location: updatedLocation,
    max_seats: updatedMax_seats
  })
    .then(function() {
      res.redirect("/");
    });
});

// ---- Workshop Delete Route ----
app.post('/workshop_delete/:id', (req, res) => {
  if (!req.session.user.isManager) {
      res.render('login', { error_message: 'Access denied: Managers only'});
  }
  else {
    db("workshops").where("id", req.params.id).del()
      .then(function() {
        res.redirect("/");
      });
  }
});

// ---- Catch-All Route (just send to "/")----
app.use((req, res) => {
  if (!req.session.isLoggedIn) {
    res.render("login", { error_message: "" });
  }
  else {
  db("workshops")
    .select("*")
    .orderBy("event_date", "asc")
    .then((worshopList) => {
      res.render("index", { worshopList, user: req.session.user});
    })
    .catch((err) => {
      console.error("Error fetching Workshops:", err);
      res.status(500).send("Database error occurred");
    });
  }
});

// ---- Start Server ----
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Server listening at http://localhost:${PORT}`);
});