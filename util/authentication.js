function createUserSession(req, user, action) {
  req.session.uid = user._id.toString();
  req.session.isAdmin = user.isAdmin;
  req.session.save(err => {
    if (err) {
      console.error("Session save error:", err);
    }
    if (action) {
      action();
    }
  });
}

function destroyUserAuthSession(req, action) {
  req.session.destroy(err => {
    if (err) {
      console.error("Session destroy error:", err);
    }
    if (action) {
      action();
    }
  });
}

function createAdminSession(req, admin, action) {
  req.session.uid = admin._id.toString();
  req.session.isAdmin = admin.isAdmin;
  req.session.save(err => {
    if (err) {
      console.error("Session save error:", err);
    }
    if (action) {
      action();
    }
  });
}

function destroyAdminAuthSession(req, action) {
  req.session.destroy(err => {
    if (err) {
      console.error("Session destroy error:", err);
    }
    if (action) {
      action();
    }
  });
}

module.exports = {
  createUserSession,
  destroyUserAuthSession,
  createAdminSession,
  destroyAdminAuthSession,
};
