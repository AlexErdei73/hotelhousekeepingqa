const Cleaner = require('../models/cleaner');
const { body, validationResult } = require("express-validator");

exports.cleaner_list = function(req, res, next) {
    Cleaner.find()
        .sort({first_name: "asc"})
        .exec(function(err, cleaner_list) {
            if (err) {
                return next(err);
            }
            res.render("cleaners", {
                title: "Cleaners",
                cleaners: cleaner_list,
            })
        })
}

exports.cleaner_create_get =  function(req, res, next) {
    res.render("cleaner_form", { 
        title: "Create Cleaner",
        cleaner: null,
        errors: [],
     });
}

exports.cleaner_create_post = [

    //Form validation and sanitization
    body("first_name")
    .trim()
    .isLength({min: 1})
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
    .isIn(['true','false'])
    .withMessage("Cleaner Active must be either true or false"),
    body("start_date")
    .optional({ checkFalsy:true })
    .isISO8601()
    .toDate(),
    body("end_date")
    .optional({ checkFalsy:true })
    .isISO8601()
    .toDate(),

    //this is our middlewear 
    (req, res, next) => {
        //extract the validation errors
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            //There are errors, rerender the form
            res.render("cleaner_form", {
                title: "Create Cleaner",
                cleaner: req.body,
                errors: errors.array(),
            });
            return;
        } 
        //No errors, so we can save the cleaner in the database
        const cleaner = new Cleaner({
            first_name: req.body.first_name,
            last_name: req.body.last_name,
            active: req.body.active==="true" ? true : false,
            start_date: req.body.start_date,
            end_date: req.body.end_date
        });
        cleaner.save(function(err) {
            if (err) {
                return next(err);
            }
            res.redirect('/hotel/cleaners');
        })
    }
]