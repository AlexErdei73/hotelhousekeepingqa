const Cleaner = require("../models/cleaner");
const { body, validationResult } = require("express-validator");
require("dotenv").config();
const bcrypt = require("bcryptjs");

exports.cleaner_list = function (req, res, next) {
  Cleaner.find()
    .sort({ first_name: "asc" })
    .exec(function (err, cleaner_list) {
      if (err) {
        return next(err);
      }
      res.render("cleaners", {
        title: "Cleaners",
        date: new Date(),
        page: 1,
        cleaners: cleaner_list,
      });
    });
};

exports.cleaner_create_get = function (req, res, next) {
  res.render("cleaner_form", {
    title: "Create Cleaner",
    date: new Date(),
    page: 1,
    cleaner: null,
    errors: [],
  });
};

exports.cleaner_create_post = [
  //Form validation and sanitization
  body("first_name")
    .trim()
    .isLength({ min: 1 })
    .escape()
    .withMessage("First Name must be specified")
    .isAlphanumeric()
    .withMessage("First Name can only contain alphanumeric characters"),
  body("last_name")
    .optional({ checkFalsy: true })
    .trim()
    .escape()
    .isAlphanumeric()
    .withMessage("Last Name can only contain alphanumeric characters"),
  body("active")
    .isIn(["true", "false"])
    .withMessage("Cleaner Active must be either true or false"),
  body("start_date").optional({ checkFalsy: true }).isISO8601().toDate(),
  body("end_date").optional({ checkFalsy: true }).isISO8601().toDate(),
  body("password")
    .isLength({ min: 1 })
    .escape()
    .withMessage("Password must be specified"),
  //this is our middlewear
  (req, res, next) => {
    //extract the validation errors
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      //There are errors, rerender the form
      res.render("cleaner_form", {
        title: "Create Cleaner",
        date: new Date(),
        page: 1,
        cleaner: req.body,
        errors: errors.array(),
      });
      return;
    }
    //We validate the password
    const password = process.env.PASSWORD;
    bcrypt.compare(req.body.password, password, (err, success) => {
      if (err) {
        return next(err);
      }
      if (success) {
        //No errors, so we can save the cleaner in the database
        const cleaner = new Cleaner({
          first_name: req.body.first_name,
          last_name: req.body.last_name,
          active: req.body.active === "true" ? true : false,
          start_date: req.body.start_date,
          end_date: req.body.end_date,
        });
        cleaner.save(function (err) {
          if (err) {
            return next(err);
          }
          res.redirect("/hotel/cleaners");
        });
      } else {
        //Password is invalid
        res.render("cleaner_form", {
          title: "Create Cleaner",
          date: new Date(),
          page: 1,
          cleaner: req.body,
          errors: [new Error("Invalid Password")],
        });
        return;
      }
    });
  },
];

exports.cleaner_get = function (req, res, next) {
  Cleaner.findById(req.params.id).exec(function (err, cleaner) {
    if (err) {
      return next(err);
    }
    if (cleaner === null) {
      const error = new Error("Cleaner not found");
      error.status = 404;
      return next(error);
    }
    res.render("cleaner", {
      title: "Cleaner: ",
      cleaner,
      date: new Date(),
      page: 1,
    });
  });
};

exports.cleaner_update_get = function (req, res, next) {
  Cleaner.findById(req.params.id).exec(function (err, cleaner) {
    if (err) {
      return next(err);
    }
    if (cleaner === null) {
      const error = new Error("Cleaner not found");
      error.status = 404;
      return next(error);
    }
    res.render("cleaner_form", {
      title: "Update Cleaner",
      date: new Date(),
      page: 1,
      cleaner,
      errors: null,
    });
  });
};

exports.cleaner_update_post = [
  //Form validation and sanitization
  body("first_name")
    .trim()
    .isLength({ min: 1 })
    .escape()
    .withMessage("First Name must be specified")
    .isAlphanumeric()
    .withMessage("First Name can only contain alphanumeric characters"),
  body("last_name")
    .optional({ checkFalsy: true })
    .trim()
    .escape()
    .isAlphanumeric()
    .withMessage("Last Name can only contain alphanumeric characters"),
  body("active")
    .isIn(["true", "false"])
    .withMessage("Cleaner Active must be either true or false"),
  body("start_date").optional({ checkFalsy: true }).isISO8601().toDate(),
  body("end_date").optional({ checkFalsy: true }).isISO8601().toDate(),
  body("password")
    .isLength({ min: 1 })
    .escape()
    .withMessage("Password must be specified"),

  //this is our middlewear
  (req, res, next) => {
    //extract the validation errors
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      //There are errors, rerender the form
      res.render("cleaner_form", {
        title: "Update Cleaner",
        date: new Date(),
        page: 1,
        cleaner: req.body,
        errors: errors.array(),
      });
      return;
    }
    //We validate the password
    const password = process.env.PASSWORD;
    bcrypt.compare(req.body.password, password, (err, success) => {
      if (err) {
        return next(err);
      }
      if (success) {
        //No errors, so we can save the cleaner in the database
        const cleaner = new Cleaner({
          first_name: req.body.first_name,
          last_name: req.body.last_name,
          active: req.body.active === "true" ? true : false,
          start_date: req.body.start_date,
          end_date: req.body.end_date,
          _id: req.params.id,
        });
        Cleaner.findByIdAndUpdate(req.params.id, cleaner, {}, function (err) {
          if (err) {
            return next(err);
          }
          res.redirect("/hotel/cleaners");
        });
      } else {
        //Password is invalid
        res.render("cleaner_form", {
          title: "Create Cleaner",
          date: new Date(),
          page: 1,
          cleaner: req.body,
          errors: [new Error("Invalid Password")],
        });
        return;
      }
    });
  },
];
