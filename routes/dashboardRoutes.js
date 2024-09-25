const express = require("express");
const router = express.Router();
const Course = require("../models/course");
const User = require("../models/user");
const Attendance = require("../models/attendance");
const Timetable = require("../models/timetable");

// Middleware to check if user is authenticated
function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect("/login");
}

// Dashboard route
router.get("/", ensureAuthenticated, (req, res) => {
    if (req.user.role === "student") {
        res.redirect("/dashboard/student");
    } else {
        res.redirect("/dashboard/admin");
    }
});

// Student dashboard route
router.get("/student", ensureAuthenticated, async (req, res) => {
    if (req.user.role !== "student") {
        return res.redirect("/dashboard");
    }

    try {
        // Fetch the necessary data
        const courses = await Course.find({ students: req.user._id });
        const faculty = await User.find({ role: "teacher" });
        const attendance = await Attendance.find({ student: req.user._id });
        const timetable = await Timetable.findOne({ student: req.user._id });

        res.render("studentDashboard", {
            user: req.user,
            courses: courses,
            faculty: faculty,
            attendance: attendance,
            timetable: timetable,
        });
    } catch (error) {
        console.error("Error fetching dashboard data:", error);
        res.status(500).send("Error loading dashboard");
    }
});

// Admin/Teacher dashboard route
router.get("/admin", ensureAuthenticated, (req, res) => {
    if (req.user.role === "student") {
        return res.redirect("/dashboard");
    }
    res.render("adminDashboard", { user: req.user });
});

module.exports = router;
