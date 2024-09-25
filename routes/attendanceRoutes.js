const express = require("express");
const router = express.Router();
const Attendance = require("../models/attendance");
const Course = require("../models/course");
const Student = require("../models/student");
const ensureAuthenticated = require("../middleware/ensureAuthenticated");
const ensureTeacher = require("../middleware/ensureTeacher");

// Middleware to check if user is authenticated
router.use(ensureAuthenticated);

// Get attendance dashboard
router.get("/", async (req, res) => {
  try {
    const courses = await Course.find();
    const attendanceRecords = await Attendance.find()
      .populate("student", "name")
      .populate("course", "name")
      .sort("-date")
      .limit(10);

    // Calculate attendance summary
    const totalRecords = await Attendance.countDocuments();
    const presentRecords = await Attendance.countDocuments({
      status: "Present",
    });
    const absentRecords = totalRecords - presentRecords;

    res.render("attendance", {
      courses,
      attendanceRecords,
      summary: { present: presentRecords, absent: absentRecords },
      messages: {
        success: req.flash("success"),
        error: req.flash("error"),
      },
    });
  } catch (error) {
    console.error(error);
    req.flash("error", "Error fetching attendance data");
    res.redirect("/");
  }
});

// Mark attendance
router.post("/mark", ensureTeacher, async (req, res) => {
  try {
    const { date, courseId, studentAttendance } = req.body;
    const course = await Course.findById(courseId);

    if (!course) {
      req.flash("error", "Course not found");
      return res.redirect("/attendance");
    }

    // Assuming studentAttendance is an object with student IDs as keys and status as values
    for (const [studentId, status] of Object.entries(studentAttendance)) {
      await Attendance.findOneAndUpdate(
        { date, course: courseId, student: studentId },
        { status },
        { upsert: true, new: true },
      );
    }

    req.flash("success", "Attendance marked successfully");
    res.redirect("/attendance");
  } catch (error) {
    console.error(error);
    req.flash("error", "Error marking attendance");
    res.redirect("/attendance");
  }
});

// Get attendance records (for filtering)
router.get("/records", async (req, res) => {
  try {
    const { course, startDate, endDate } = req.query;
    let query = {};

    if (course) query.course = course;
    if (startDate && endDate) {
      query.date = { $gte: new Date(startDate), $lte: new Date(endDate) };
    }

    const attendanceRecords = await Attendance.find(query)
      .populate("student", "name")
      .populate("course", "name")
      .sort("-date");

    res.json(attendanceRecords);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error fetching attendance records" });
  }
});

module.exports = router;
