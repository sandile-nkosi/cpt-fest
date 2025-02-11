const express = require('express');
const db = require("./config/database");
const dotenv = require("dotenv").config();
const PORT = process.env.PORT || 3000;
const bodyParser = require('body-parser');
const session = require("express-session");
const createSessionConfig = require("./config/session");

const authRoutes = require("./routes/authRoute");
const baseRoutes = require("./routes/baseRoute");
const eventRoutes = require("./routes/eventRoute");

const app = express();

app.set('view engine', 'ejs');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));
//app.use("/assets/images", express.static("candidate-data"));
app.use(session(createSessionConfig()));

// Routes
app.use('/auth', authRoutes);
app.use('/', baseRoutes);
app.use('/events', eventRoutes);


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

