const User = require("../models/User");
const Admin = require("../models/Admin");
const authenticationUtil = require("../util/authentication");
const validationUtil = require("../util/validation");
const sessionFlash = require("../util/session-flash");
const bcrypt = require("bcryptjs");

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
  res.render("user/user-signin");
}

function getAdminSignIn(req, res) {
  res.render("admin/admin-signin");
}

// POST Routes

async function signUp(req, res, next) {
  const { fullName, city, email, password, passwordConfirm } = req.body;

  if (
    !validationUtil.userDetailsValid(email, password, fullName, city) ||
    !validationUtil.passwordMatch(password, passwordConfirm)
  ) {
    return sessionFlash.flashDataToSession(req, {
      errorMessage:
        "Invalid input. Ensure passwords match, email is valid, and password is at least 6 characters.",
      fullName,
      city,
      email,
    }, () => res.redirect("/auth/signup"));
  }

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return sessionFlash.flashDataToSession(req, {
        errorMessage: "User already exists.",
        fullName,
        city,
        email,
      }, () => res.redirect("/auth/signup"));
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const user = await User.create({ fullName, city, email, password: hashedPassword });

    if (!user) {
      console.error("User creation failed");
      return res.status(400).redirect("/auth/signup");
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
      return handleAuthError(req, res, "User does not exist. Please register.", email, "/auth/signin");
    }

    const passwordMatch = await bcrypt.compare(password, existingUser.password);
    if (!passwordMatch) {
      return handleAuthError(req, res, "Incorrect password. Try again.", email, "/auth/signin");
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
      return handleAuthError(req, res, "Admin does not exist. Please register.", email, "/auth/admin/signin");
    }

    const passwordMatch = await bcrypt.compare(password, existingAdmin.password);
    if (!passwordMatch) {
      return handleAuthError(req, res, "Incorrect password. Try again.", email, "/auth/admin/signin");
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

// Helper Function for Authentication Errors
function handleAuthError(req, res, message, email, redirectPath) {
  req.session.inputData = { hasError: true, message, email, password: "" };
  req.session.save(() => res.redirect(redirectPath));
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
