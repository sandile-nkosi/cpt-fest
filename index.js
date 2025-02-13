const express = require('express');
const db = require("./config/database");
const dotenv = require("dotenv").config();
const PORT = process.env.PORT || 3000;
const bodyParser = require('body-parser');
const session = require("express-session");
const createSessionConfig = require("./config/session");
const path = require('path');

const authRoutes = require("./routes/authRoute");
const baseRoutes = require("./routes/baseRoute");
const eventRoutes = require("./routes/eventRoute");
const adminRoutes = require("./routes/adminRoute");

const app = express();

app.set('view engine', 'ejs');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use('/events/assets/images', express.static(path.join(__dirname, 'public/event-data/images')));
app.use(session(createSessionConfig()));

// Routes
app.use('/auth', authRoutes);
app.use('/', baseRoutes);
app.use('/events', eventRoutes);
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

