function createSession(req, user, action) {
  req.session.uid = user._id.toString();
  req.session.isAdmin = !!user.isAdmin;

  req.session.save(err => {
    if (err) {
      console.error("Session save error:", err);
    }
    action && action(); // Ensures action (e.g., redirect) happens after session is saved
  });
}

function destroySession(req, action) {
  req.session.destroy(err => {
    if (err) {
      console.error("Error destroying session:", err);
      return action && action(err);
    }
    action && action(); // Ensures action (e.g., redirect) happens after session is destroyed
  });
}

module.exports = {
  createUserSession: createSession,
  destroyUserAuthSession: destroySession,
  createAdminSession: createSession,
  destroyAdminAuthSession: destroySession
};
