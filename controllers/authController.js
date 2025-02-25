const User = require("../models/User");
const Admin = require("../models/Admin");
const authenticationUtil = require("../util/authentication");
const validationUtil = require("../util/validation");
const sessionFlash = require("../util/session-flash");
const bcrypt = require("bcryptjs");
const sendMail = require("../middleware/mailer");

// GET Routes

function getSignUp(req, res) {
  if (req.session.user) return res.redirect("/user/events");

  const sessionData = sessionFlash.getSessionData(req) || {
    email: "",
    password: "",
    passwordConfirm: "",
    fullName: "",
    city: "",
  };

  res.render("user/user-signup", { sessionData });
}

function getSignIn(req, res) {
  if (req.session.user) return res.redirect("/user/events");

  const sessionData = sessionFlash.getSessionData(req) || {
    email: "",
  };

  res.render("user/user-signin", { sessionData });
}

function getAdminSignIn(req, res) {
  const sessionData = sessionFlash.getSessionData(req) || {
    email: "",
  };

  res.render("admin/admin-signin", { sessionData });
}

// POST Routes

async function signUp(req, res, next) {
  const {
    fullName,
    displayName,
    email,
    password,
    passwordConfirm,
    age,
    gender,
    province,
  } = req.body;

  // Validate user details
  if (
    !validationUtil.userDetailsValid(
      email,
      password,
      fullName,
      displayName,
      age,
      gender,
      province
    ) ||
    !validationUtil.passwordMatch(password, passwordConfirm)
  ) {
    return sessionFlash.flashDataToSession(
      req,
      {
        errorMessage:
          "Invalid input. Ensure passwords match, email is valid, and all fields are filled.",
        fullName,
        displayName,
        email,
        age,
        gender,
        province,
      },
      () => res.redirect("/auth/signup")
    );
  }

  try {
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return sessionFlash.flashDataToSession(
        req,
        {
          errorMessage: "User already exists. Please sign in.",
          fullName,
          displayName,
          email,
          age,
          gender,
          province,
        },
        () => res.redirect("/auth/signup")
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create new user
    const user = await User.create({
      fullName,
      displayName,
      email,
      password: hashedPassword,
      age,
      gender,
      province,
    });

    if (!user) {
      return sessionFlash.flashDataToSession(
        req,
        {
          errorMessage: "User creation failed. Please try again.",
          fullName,
          displayName,
          email,
          age,
          gender,
          province,
        },
        () => res.redirect("/auth/signup")
      );
    }

    // Send welcome email
    const mailOptions = {
      from: "One City Event Company <sankosi.uct@gmail.com>",
      to: user.email,
      subject: `🎉 Welcome to ONE festival, ${user.fullName}!`,
      html: `
        <div style="max-width: 600px; margin: auto; padding: 20px; background-color: #f9f9f9; text-align: center;">
          <h2>Welcome to ONE festival, ${user.fullName}! 🎉</h2>
          <p>Your account has been created. You’re now part of the One City community.</p>
          <hr>
          <p>&copy; 2025 One City Event Company. All rights reserved.</p>
        </div>
      `,
    };
    sendMail(mailOptions);

    // Redirect to sign-in page
    res.redirect("/auth/signin");
  } catch (error) {
    next(error);
  }
}

async function signIn(req, res, next) {
  const { email, password } = req.body;
  const lowerEmail = email.toLowerCase();

  try {
    const existingUser = await User.findOne({ email: lowerEmail });
    if (!existingUser) {
      return sessionFlash.flashDataToSession(req, {
        errorMessage: "User does not exist. Please register.",
        email,
      }, () => res.redirect("/auth/signin"));
    }

    const passwordMatch = await bcrypt.compare(password, existingUser.password);
    if (!passwordMatch) {
      return sessionFlash.flashDataToSession(req, {
        errorMessage: "Incorrect password. Try again.",
        email,
      }, () => res.redirect("/auth/signin"));
    }

    req.session.user = { uid: existingUser._id, email: existingUser.email };
    req.session.save(() => res.redirect("/user/events"));
  } catch (error) {
    next(error);
  }
}

function signOut(req, res) {
  authenticationUtil.destroyUserAuthSession(req);
  res.redirect("/");
}

// Admin Authentication

async function adminSignUp(req, res, next) {
  const { fullName, email, password, passwordConfirm } = req.body;

  try {
    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      return sessionFlash.flashDataToSession(req, {
        errorMessage: "Admin already exists.",
        fullName,
        email,
      }, () => res.redirect("/auth/admin/signup"));
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const admin = await Admin.create({ fullName, email, password: hashedPassword });

    if (!admin) {
      console.error("Admin creation failed");
      return res.status(400).redirect("/auth/admin/signup");
    }

    res.redirect("/auth/admin/signin");
  } catch (error) {
    next(error);
  }
}

async function adminSignIn(req, res, next) {
  const { email, password } = req.body;
  const lowerEmail = email.toLowerCase();

  try {
    const existingAdmin = await Admin.findOne({ email: lowerEmail });
    if (!existingAdmin) {
      return sessionFlash.flashDataToSession(req, {
        errorMessage: "Admin does not exist. Please register.",
        email,
      }, () => res.redirect("/auth/admin/signin"));
    }

    const passwordMatch = await bcrypt.compare(password, existingAdmin.password);
    if (!passwordMatch) {
      return sessionFlash.flashDataToSession(req, {
        errorMessage: "Incorrect password. Try again.",
        email,
      }, () => res.redirect("/auth/admin/signin"));
    }

    req.session.admin = { uid: existingAdmin._id, email: existingAdmin.email };
    req.session.save(() => res.redirect("/admin/dashboard"));
  } catch (error) {
    next(error);
  }
}

function adminSignOut(req, res) {
  authenticationUtil.destroyAdminAuthSession(req);
  res.redirect("/");
}


module.exports = {
  getSignUp,
  getSignIn,
  signUp,
  signIn,
  signOut,
  adminSignUp,
  getAdminSignIn,
  adminSignIn,
  adminSignOut,
};
