const express = require("express");
const router = express.Router();
const Timetable = require("../models/timetable");
const ensureAdmin = require("../middleware/ensureAdmin");

// View timetable
router.get("/", async (req, res) => {
  try {
    const classes = await Timetable.distinct("class");
    const selectedClass = req.query.class || classes[0];
    const timetable = await Timetable.findOne({ class: selectedClass });
    res.render("timetable", { timetable, classes, selectedClass });
  } catch (error) {
    console.error(error);
    req.flash("error", "Error fetching timetable");
    res.redirect("/");
  }
});

// Render class selection for editing
router.get("/edit", ensureAdmin, async (req, res) => {
  try {
    const classes = await Timetable.distinct("class");
    res.render("selectClassForEdit", { classes });
  } catch (error) {
    console.error(error);
    req.flash("error", "Error fetching classes");
    res.redirect("/timetable");
  }
});

// Render edit timetable form
router.get("/edit/:class", ensureAdmin, async (req, res) => {
  try {
    let timetable = await Timetable.findOne({ class: req.params.class });
    if (!timetable) {
      timetable = new Timetable({ class: req.params.class, slots: [] });
    }
    res.render("editTimetable", { timetable });
  } catch (error) {
    console.error(error);
    req.flash("error", "Error fetching timetable for editing");
    res.redirect("/timetable");
  }
});

// Update timetable
router.post("/edit/:class", ensureAdmin, async (req, res) => {
  try {
    const { slots } = req.body;
    const timetable = await Timetable.findOneAndUpdate(
      { class: req.params.class },
      { slots },
      { new: true, upsert: true },
    );
    req.flash("success", "Timetable updated successfully");
    res.redirect("/timetable?class=" + req.params.class);
  } catch (error) {
    console.error(error);
    req.flash("error", "Error updating timetable");
    res.redirect("/timetable");
  }
});

router.get("/edit/new", ensureAdmin, (req, res) => {
  const newClass = req.query.class;
  if (!newClass) {
    req.flash("error", "Class name is required");
    return res.redirect("/timetable/edit");
  }
  const timetable = new Timetable({ class: newClass, slots: [] });
  res.render("editTimetable", { timetable });
});

module.exports = router;
