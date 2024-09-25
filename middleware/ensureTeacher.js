module.exports = function (req, res, next) {
  if (req.isAuthenticated() && req.user.role === "teacher") {
    return next();
  } else {
    res.redirect("/login");
  }
};
