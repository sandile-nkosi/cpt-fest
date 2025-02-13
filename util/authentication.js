function createUserSession(req, user, action) {
    req.session.uid = user._id.toString();
    req.session.isAdmin = user.isAdmin;
    req.session.save(action);
  }
  
  function destroyUserAuthSession(req) {
    req.session.uid = null;
    req.session.isAdmin = null;
  }

  function createAdminSession(req, admin, action) {
    req.session.uid = admin._id.toString();
    req.session.isAdmin = admin.isAdmin;
    req.session.save(action);
  }
  
  function destroyAdminAuthSession(req) {
    req.session.uid = null;
    req.session.isAdmin = null;
  }
  
  
  module.exports = {
    createUserSession,
    destroyUserAuthSession,
    createAdminSession,
    destroyAdminAuthSession
  };