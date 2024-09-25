const express = require("express");
const router = express.Router();
const Course = require("../models/course");
const ensureAdmin = require("../middleware/ensureAdmin");
const ensureAuthenticated = require("../middleware/ensureAuthenticated");

// Get all courses
router.get("/", ensureAuthenticated, async (req, res) => {
  try {
    const courses = await Course.find();
    res.render("courses", { courses });
  } catch (error) {
    console.error(error);
    res.status(500).send("Server error");
  }
});

// Render form to add a new course
router.get("/add", ensureAdmin, (req, res) => {
  res.render("addCourse");
});

// Add a new course
router.post("/add", ensureAdmin, async (req, res) => {
  try {
    const { name, code, department, credits } = req.body;
    const newCourse = new Course({ 
      name, 
      code, 
      department,
      credits: Number(credits) 
    });
    await newCourse.save();
    res.redirect("/courses");
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
});

// Render form to edit a course
router.get("/:id/edit", ensureAdmin, async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).send("Course not found");
    }
    res.render("editCourse", { course });
  } catch (error) {
    console.error(error);
    res.status(500).send("Server error");
  }
});

// Update a course
router.post("/:id/edit", ensureAdmin, async (req, res) => {
  try {
    const { name, code, department, credits } = req.body;
    await Course.findByIdAndUpdate(req.params.id, {
      name,
      code,
      department,
      credits: Number(credits),
    });
    res.redirect("/courses");
  } catch (error) {
    console.error(error);
    res.status(500).send("Server error");
  }
});

// Delete a course
router.post("/:id/delete", ensureAdmin, async (req, res) => {
  try {
    await Course.findByIdAndDelete(req.params.id);
    res.redirect("/courses");
  } catch (error) {
    console.error(error);
    res.status(500).send("Server error");
  }
});

module.exports = router;