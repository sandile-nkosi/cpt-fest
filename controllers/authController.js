const User = require("../models/User");
const authenticationUtil = require("../util/authentication");
const sessionFlash = require("../util/session-flash");

//get routes

function getRegister(req, res) {
  let sessionData = sessionFlash.getSessionData(req);

  if (!sessionData) {
    sessionData = {
      email: "",
      confirmEmail: "",
      password: "",
      firstName: "",
      lastName: "",
      idNumber: "",
      street: "",
      city: "",
      postalCode: "",
      province: "",
    };
  }
  res.render("user/user-register", { sessionData });
}

//post routes
//register
async function register(req, res, next) {
  let existingVoter;

  const enteredData = ({
    fullName,
    city,
    email,
    confirmEmail,
    password,
  } = req.body);

  if (
    !validationUtil.voterDetailsValid(
      email,
      password,
      firstName,
      lastName,
      idNumber,
      street,
      city,
      postalCode,
      province
    ) ||
    !validationUtil.emailMatch(email, confirmEmail)
  ) {
    sessionFlash.flashDataToSession(
      req,
      {
        errorMessage:
          "Please check your input. Emails must match. Disposable emails are not allowed. Password must be at least 6 characters long, ID number must be 13 digits long, postal code must be 4 digits long.",
        ...enteredData,
      },
      () => {
        res.redirect("/api/voter/register");
      }
    );
    return;
  }

  try {
    emailStatus = await checkEmail(email);
    if (emailStatus.disposable) {
      sessionFlash.flashDataToSession(
        req,
        {
          errorMessage:
            "Email Address not allowed - please use a different one",
          ...enteredData,
        },
        () => {
          res.status(401).redirect("/api/voter/register");
        }
      );
    }
  } catch (error) {
    next(error);
    return;
  }

  try {
    existingVoter = await Voter.findOne({ email: email });

    if (existingVoter) {
      sessionFlash.flashDataToSession(
        req,
        {
          errorMessage: "Voter Already exists",
          ...enteredData,
        },
        () => {
          res.status(400).redirect("/api/voter/register");
        }
      );
    } else {
      const voter = await Voter.create({
        ...enteredData,
      });

      if (voter) {
        await Voter.updateOne({ _id: voter._id }, { isVerified: true });
        res.status(201).redirect("/api/voter/login");
      } else {
        res.status(400);
      }
    }
  } catch (error) {
    next(error);
    return;
  }
}

module.exports = { getRegister };