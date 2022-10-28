const Feedback = require('../models/feedback');
const Room = require('../models/room');
const { body, validationResult } = require("express-validator");

exports.feedbacks_get = function(req, res, next) {
    res.send("NOT IMPLEMENTED");
};

exports.feedbacks_post = function(req, res, next) {
    res.send("NOT IMPLEMENTED");
}

exports.feedback_create_get = function(req, res, next) {
    res.render("feedback_form", {
        title: "Create Feedback",
        feedback: null,
        errors: null,
        page: 1,
        date: new Date()
    });
}

exports.feedback_create_post = [
    body("roomnumber")
        .isInt({ min: 1, max: 9999, allow_leading_zeroes: true })
        .withMessage("Roomnumber is required and 4 digits integer")
        .toInt(),
    body("checkin_date")
        .isISO8601()
        .withMessage("Checkin date must be specified and valid")
        .toDate(),
    body("checkout_date")
        .isISO8601()
        .withMessage("Checkout date must be specified and valid")
        .toDate(),
    body("feedback_date")
        .isISO8601()
        .withMessage("Feedback date must be specified and valid")
        .toDate(),
    body("score")
        .isInt({ min: 1, max: 10, allow_leading_zeroes: false })
        .withMessage("Score is required and an integer between 1 and 10")
        .toInt(),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.render("feedback_form", {
                title: "Create Feedback",
                feedback: {
                    roomnumber: req.body.roomnumber,
                    checkin_date: req.body.checkin_date.toISOString().slice(0, 10),
                    checkout_date: req.body.checkout_date.toISOString().slice(0, 10),
                    feedback_date: req.body.feedback_date.toISOString().slice(0, 10),
                    score: req.body.score
                },
                errors: errors.array(),
                page: 1,
                date: new Date()
            });
            return;
        }
        Room.findOne({ number: req.body.roomnumber })
            .exec((err, room) => {
                if (err) {
                    return next(err);
                }
                if (room === null) {
                    res.render("feedback_form", {
                        title: "Create Feedback",
                        feedback: {
                            roomnumber: req.body.roomnumber,
                            checkin_date: req.body.checkin_date.toISOString().slice(0, 10),
                            checkout_date: req.body.checkout_date.toISOString().slice(0, 10),
                            feedback_date: req.body.feedback_date.toISOString().slice(0, 10),
                            score: req.body.score
                        },
                        errors: [new Error(`There is no room with ${req.body.roomnumber} number in the hotel`)],
                        page: 1,
                        date: new Date()
                    });
                    return;
                }
                const feedback = new Feedback({
                    room: room._id,
                    checkin_date: req.body.checkin_date,
                    checkout_date: req.body.checkout_date,
                    feedback_date: req.body.feedback_date,
                    score: req.body.score
                })
                feedback.save((err) => {
                    if (err) {
                        return next(err);
                    }
                    res.send(feedback);
                })
            })
}]