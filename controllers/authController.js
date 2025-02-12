const User = require("../models/User");
const authenticationUtil = require("../util/authentication");
var validationUtil = require("../util/validation");
const sessionFlash = require("../util/session-flash");
const bcrypt = require("bcryptjs");
const Admin = require("../models/Admin");

//get routes

function getSignUp(req, res) {
  let sessionData = sessionFlash.getSessionData(req);

  if (!sessionData) {
    sessionData = {
      email: "",
      password: "",
      passwordConfirm: "",
      fullName: "",
      city: "",
    };
  }
  res.render("user/user-signup", { sessionData });
}

function getSignIn(req, res) {
  res.render("user/user-signin");
};

function getAdminSignIn(req, res) {
  res.render("admin/admin-signin");
};

//post routes
//sign up route
async function signUp(req, res, next) {
  let existingUser;

  const enteredData = ({
    fullName,
    city,
    email,
    password,
    passwordConfirm,
  } = req.body);

  if (
    !validationUtil.userDetailsValid(
      email,
      password,
      fullName,
      city,
    ) ||
    !validationUtil.passwordMatch(password, passwordConfirm)
  ) {
    sessionFlash.flashDataToSession(
      req,
      {
        errorMessage:
          "Please check your input. Passwords must match. Disposable emails are not allowed. Password must be at least 6 characters long",
        ...enteredData,
      },
      () => {
        console.log("Bad deets");
        res.redirect("/auth/signup");
      }
    );
    return;
  }

  try {
    existingUser = await User.findOne({ email: email });

    if (existingUser) {
      sessionFlash.flashDataToSession(
        req,
        {
          errorMessage: "User already exists",
          ...enteredData,
        },
        () => {
          res.status(400).redirect("/auth/signup");
        }
      );
    } else {
      // Hash the password before saving
      const hashedPassword = await bcrypt.hash(password, 12);

      const user = await User.create({
        fullName,
        city,
        email,
        password: hashedPassword, // Store the hashed password
      });

      if (user) {
        res.status(201).redirect("/auth/signin");
      } else {
        console.log("Not created");
        res.status(400);
      }
    }
  } catch (error) {
    next(error);
    return;
  }
}


//user sign in route

async function signIn(req, res, next) {
  const userData = req.body;
  const email = userData.email.toLowerCase();
  const password = userData.password;

  try {
    const existingUser = await User.findOne({ email: email }).exec();
    if (!existingUser) {
      req.session.inputData = {
        hasError: true,
        message: "User does not exist - please register",
        email: email,
        password: password
      };

      req.session.save(()=>{
        res.redirect("/auth/signin");
      });

      return;
    }

    const passwordMatch = await bcrypt.compare(
      password,
      existingUser.password
    );

    if (!passwordMatch) {
      req.session.inputData = {
        hasError: true,
        message: "Password incorrect - please try again",
        email: email,
        password: password
      };

      req.session.save(()=>{
        res.redirect("/auth/signin");
      });

      return;
    }

    req.session.user = {
      id: existingUser._id,
      email: existingUser.email,
    };
    req.session.save(() => {
      res.redirect("/events");
    });
  } catch (err) {
    console.log(err);
    return res.status(401).render("shared/401");
  }
}

//sign out route
function signOut(req, res) {
  authenticationUtil.destroyUserAuthSession(req);
  res.redirect("/");
}


//admin sign in
async function adminSignIn(req, res, next) {
  const adminData = req.body;
  const email = adminData.email.toLowerCase();
  const password = adminData.password;

  try {
    const existingAdmin = await Admin.findOne({ email: email }).exec();
    if (!existingAdmin) {
      req.session.inputData = {
        hasError: true,
        message: "User does not exist - please register",
        email: email,
        password: password
      };

      req.session.save(()=>{
        res.redirect("/auth/admin/signin");
      });

      return;
    }

    const passwordMatch = await bcrypt.compare(
      password,
      existingAdmin.password
    );

    if (!passwordMatch) {
      req.session.inputData = {
        hasError: true,
        message: "Password incorrect - please try again",
        email: email,
        password: password
      };

      req.session.save(()=>{
        res.redirect("/auth/admin/signin");
      });

      return;
    }

    req.session.admin = {
      id: existingAdmin._id,
      email: existingAdmin.email,
    };
    req.session.save(() => {
      res.redirect("/admin/dashboard");
    });
  } catch (err) {
    console.log(err);
    return res.status(401).render("shared/401");
  }
}


//admin sign up - temp
async function adminSignUp(req, res, next) {
  let existingAdmin;

  const enteredData = ({
    fullName,
    email,
    password,
    passwordConfirm,
  } = req.body);


  try {
    existingAdmin = await Admin.findOne({ email: email });

    if (existingAdmin) {
      sessionFlash.flashDataToSession(
        req,
        {
          errorMessage: "User already exists",
          ...enteredData,
        },
        () => {
          res.status(400).redirect("/auth/admin/signup");
        }
      );
    } else {
      // Hash the password before saving
      const hashedPassword = await bcrypt.hash(password, 12);

      const admin = await Admin.create({
        fullName,
        email,
        password: hashedPassword, // Store the hashed password
      });

      if (admin) {
        res.status(201).redirect("/auth/admin/signin");
      } else {
        console.log("Not created");
        res.status(400);
      }
    }
  } catch (error) {
    next(error);
    return;
  }
}

module.exports = { getSignUp, getSignIn, signUp, signIn, signOut, adminSignUp, getAdminSignIn, adminSignIn };