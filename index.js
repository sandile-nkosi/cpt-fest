const express = require('express');
const db = require("./config/database");
const dotenv = require("dotenv").config();
const PORT = process.env.PORT || 3000;
const bodyParser = require('body-parser');
const session = require("express-session");
const createSessionConfig = require("./config/session");
const path = require('path');
const apiKey = process.env.GOOGLE_MAPS_API_KEY;

const authRoutes = require("./routes/authRoute");
const eventRoutes = require("./routes/eventRoute");
const userRoutes = require("./routes/userRoute");
const adminRoutes = require("./routes/adminRoute");

const app = express();

app.set('view engine', 'ejs');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use('/events/assets/images', express.static(path.join(__dirname, 'public/event-data/images')));
app.use(session(createSessionConfig()));

// Routes
app.use((req, res, next) => {
  // Default values to prevent "not defined" errors
  res.locals.admin = null;
  res.locals.user = null;

  if (req.session) {
    // Check if admin data exists in session
    if (req.session.admin) {
      res.locals.admin = req.session.admin; // Or fetch full admin data as needed
    }

    // Check if user data exists in session
    if (req.session.user) {
      res.locals.user = req.session.user; // Or fetch full user data as needed
    }
  }

  next();
});
app.use('/auth', authRoutes);
app.use('/', eventRoutes);
app.use('/user', userRoutes);
app.use("/admin", adminRoutes);



// connect to database
db()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server started on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.log("Failed to connect to the database!");
    console.log(err);
  });

