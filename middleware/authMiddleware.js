const authMiddleware = {
  ensureAuthenticated: function (req, res, next) {
    if (req.isAuthenticated()) {
      return next();
    } else {
      req.flash('error', 'You must be logged in to view this page');
      res.redirect("/login");
    }
  },

  ensureTeacher: function (req, res, next) {
    if (req.isAuthenticated() && req.user.role === "teacher") {
      return next();
    } else {
      req.flash('error', 'You must be a teacher to access this page');
      res.redirect("/");
    }
  },

  ensureAdmin: function (req, res, next) {
    if (req.isAuthenticated() && req.user.role === "admin") {
      return next();
    } else {
      req.flash('error', 'You must be an admin to access this page');
      res.redirect("/");
    }
  },

  ensureStudent: function (req, res, next) {
    if (req.isAuthenticated() && req.user.role === "student") {
      return next();
    } else {
      req.flash('error', 'You must be a student to access this page');
      res.redirect("/");
    }
  },

  checkRole: function (roles) {
    return function (req, res, next) {
      if (req.isAuthenticated() && roles.includes(req.user.role)) {
        return next();
      } else {
        req.flash('error', 'You do not have permission to access this page');
        res.redirect("/");
      }
    };
  },

  setLocals: function (req, res, next) {
    res.locals.user = req.user || null;
    res.locals.isAuthenticated = req.isAuthenticated();
    next();
  }
};

module.exports = authMiddleware;