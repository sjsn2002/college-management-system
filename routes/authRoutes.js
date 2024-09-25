const express = require("express");
const router = express.Router();
const passport = require("passport");
const User = require("../models/user");
const bcrypt = require("bcryptjs");
const { body, validationResult } = require("express-validator");

// GET route for registration page
router.get("/register", (req, res) => {
  res.render("register", { messages: req.flash() });
});

// POST route for registration
router.post(
  "/register",
  body("name").trim().escape().not().isEmpty().withMessage("Name is required"),
  body("email")
    .isEmail()
    .normalizeEmail()
    .withMessage("Valid email is required"),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long"),
  body("role")
    .isIn(["student", "teacher", "admin"])
    .withMessage("Invalid role"),
  async (req, res) => {
    console.log("Registration attempt:", req.body);

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log("Validation errors:", errors.array());
      req.flash(
        "error",
        errors
          .array()
          .map((err) => err.msg)
          .join(", "),
      );
      return res.redirect("/register");
    }

    const { name, email, password, role } = req.body;
    try {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        console.log("User already exists:", email);
        req.flash("error", "Email already in use");
        return res.redirect("/register");
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const user = new User({ name, email, password: hashedPassword, role });
      console.log("New user object:", user);

      const savedUser = await user.save();
      console.log("User saved successfully:", savedUser);

      req.flash("success", "Registration successful. Please log in.");
      res.redirect("/login");
    } catch (err) {
      console.error("Registration error:", err);
      req.flash("error", "An error occurred during registration");
      res.redirect("/register");
    }
  },
);

// GET route for login page
router.get("/login", (req, res) => {
  res.render("login", { messages: req.flash() });
});

// POST route for login
router.post("/login", (req, res, next) => {
  passport.authenticate("local", (err, user, info) => {
    if (err) {
      return next(err);
    }
    if (!user) {
      req.flash("error", info.message);
      return res.redirect("/login");
    }
    req.logIn(user, (err) => {
      if (err) {
        return next(err);
      }
      return res.redirect("/dashboard");
    });
  })(req, res, next);
});

// Logout route
router.get("/logout", (req, res) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    req.flash("success", "You have been logged out successfully");
    res.redirect("/login");
  });
});
module.exports = router;
