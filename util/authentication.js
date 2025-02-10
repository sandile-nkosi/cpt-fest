function createUserSession(req, user, action) {
    req.session.uid = user._id.toString();
    req.session.isAdmin = user.isAdmin;
    req.session.save(action);
  }
  
  function destroyVoterAuthSession(req) {
    req.session.uid = null;
    req.session.isAdmin = null;
  }
  
  
  module.exports = {
    createUserSession,
    destroyVoterAuthSession,
  };