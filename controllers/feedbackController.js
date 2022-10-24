const Feedback = require('../models/feedback');
const { body, validationResult } = require("express-validator");

exports.feedback_create_get = function(req, res, next) {
    res.render("feedback_form", {
        title: "Create Feedback",
        feedback: null,
        errors: null,
        page: 1,
        date: new Date()
    });
}


exports.feedback_create_post = function(req, res, next) {
    res.send("NOT IMPLEMENTED");
}