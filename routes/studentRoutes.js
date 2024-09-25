const express = require("express");
const router = express.Router();
const Student = require("../models/student");
const Course = require("../models/course");
const ensureAuthenticated = require("../middleware/ensureAuthenticated");
const ensureAdmin = require("../middleware/ensureAdmin");

// Get all students
router.get("/", ensureAuthenticated, async (req, res) => {
  try {
    const students = await Student.find();
    res.render("students", { students, messages: req.flash() });
  } catch (error) {
    console.error(error);
    req.flash('error', 'Error fetching students');
    res.redirect("/");
  }
});

// Render add student form
router.get("/add", ensureAdmin, (req, res) => {
  res.render("addStudent", { messages: req.flash() });
});

// Add a new student
router.post("/add", ensureAdmin, async (req, res) => {
  try {
    const newStudent = new Student(req.body);
    await newStudent.save();
    req.flash('success', 'Student added successfully');
    res.redirect("/students");
  } catch (error) {
    console.error(error);
    req.flash('error', 'Error adding student');
    res.redirect("/students/add");
  }
});

// Get individual student details
router.get("/:id", ensureAuthenticated, async (req, res) => {
  try {
    const student = await Student.findById(req.params.id).populate('courses.course');
    if (!student) {
      req.flash('error', 'Student not found');
      return res.redirect("/students");
    }
    res.render("studentDetails", { student, messages: req.flash() });
  } catch (error) {
    console.error(error);
    req.flash('error', 'Error fetching student details');
    res.redirect("/students");
  }
});

// Render edit student form
router.get("/:id/edit", ensureAdmin, async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) {
      req.flash('error', 'Student not found');
      return res.redirect("/students");
    }
    res.render("editStudent", { student, messages: req.flash() });
  } catch (error) {
    console.error(error);
    req.flash('error', 'Error fetching student for editing');
    res.redirect("/students");
  }
});

// Update a student
router.post("/:id/edit", ensureAdmin, async (req, res) => {
  try {
    await Student.findByIdAndUpdate(req.params.id, req.body);
    req.flash('success', 'Student updated successfully');
    res.redirect(`/students/${req.params.id}`);
  } catch (error) {
    console.error(error);
    req.flash('error', 'Error updating student');
    res.redirect(`/students/${req.params.id}/edit`);
  }
});

// Add a course to a student
router.post("/:id/add-course", ensureAdmin, async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) {
      req.flash('error', 'Student not found');
      return res.redirect("/students");
    }
    student.courses.push(req.body);
    await student.save();
    req.flash('success', 'Course added to student successfully');
    res.redirect(`/students/${req.params.id}`);
  } catch (error) {
    console.error(error);
    req.flash('error', 'Error adding course to student');
    res.redirect(`/students/${req.params.id}`);
  }
});

module.exports = router;