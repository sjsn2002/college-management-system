const express = require("express");
const router = express.Router();
const Faculty = require("../models/faculty");
const ensureAdmin = require("../middleware/ensureAdmin");

// Get all faculty members
router.get("/", ensureAdmin, async (req, res) => {
  try {
    const facultyMembers = await Faculty.find();
    res.render("faculty", { 
      facultyMembers,
      messages: {
        success: req.flash('success'),
        error: req.flash('error')
      }
    });
  } catch (error) {
    console.error(error);
    req.flash("error", "Error fetching faculty members");
    res.status(500).render("error", { 
      error: "Server error",
      messages: {
        error: req.flash('error')
      }
    });
  }
});

// Add a new faculty member
router.post("/add", ensureAdmin, async (req, res) => {
  try {
    const {
      name,
      email,
      department,
      courses,
      designation,
      qualifications,
      contactNumber,
    } = req.body;

    // Split courses and qualifications strings into arrays
    const coursesArray = courses.split(",").map((course) => course.trim());
    const qualificationsArray = qualifications
      ? qualifications.split(",").map((q) => q.trim())
      : [];

    const newFaculty = new Faculty({
      name,
      email,
      department,
      courses: coursesArray,
      designation,
      qualifications: qualificationsArray,
      contactNumber,
    });

    await newFaculty.save();
    req.flash("success", "Faculty member added successfully");
    res.redirect("/faculty");
  } catch (error) {
    console.error(error);
    req.flash("error", "Error adding faculty member");
    res.redirect("/faculty");
  }
});

// Render edit faculty form
router.get("/:id/edit", ensureAdmin, async (req, res) => {
  try {
    const faculty = await Faculty.findById(req.params.id);
    if (!faculty) {
      req.flash("error", "Faculty member not found");
      return res.redirect("/faculty");
    }
    res.render("editFaculty", { faculty });
  } catch (error) {
    console.error(error);
    req.flash("error", "Error fetching faculty member");
    res.redirect("/faculty");
  }
});

// Update a faculty member
router.post("/:id/edit", ensureAdmin, async (req, res) => {
  try {
    const {
      name,
      email,
      department,
      courses,
      designation,
      qualifications,
      contactNumber,
    } = req.body;

    // Split courses and qualifications strings into arrays
    const coursesArray = courses.split(",").map((course) => course.trim());
    const qualificationsArray = qualifications
      ? qualifications.split(",").map((q) => q.trim())
      : [];

    await Faculty.findByIdAndUpdate(req.params.id, {
      name,
      email,
      department,
      courses: coursesArray,
      designation,
      qualifications: qualificationsArray,
      contactNumber,
    });

    req.flash("success", "Faculty member updated successfully");
    res.redirect("/faculty");
  } catch (error) {
    console.error(error);
    req.flash("error", "Error updating faculty member");
    res.redirect("/faculty");
  }
});

// Delete a faculty member
router.post("/:id/delete", ensureAdmin, async (req, res) => {
  try {
    await Faculty.findByIdAndDelete(req.params.id);
    req.flash("success", "Faculty member deleted successfully");
    res.redirect("/faculty");
  } catch (error) {
    console.error(error);
    req.flash("error", "Error deleting faculty member");
    res.redirect("/faculty");
  }
});

module.exports = router;
