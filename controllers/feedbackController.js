const Feedback = require('../models/feedback');
const Room = require('../models/room');
const Service = require('../models/service');
const { body, validationResult } = require("express-validator");
const { getYear, getMonth } = require('date-fns');
const async = require('async');

function _findCleaner(feedback, cb) {
    if (feedback.depart_cleaner) {
        cb(null, feedback.depart_cleaner);
        return;
    }
    Service.find({ room: feedback.room._id, type: "depart", date: {$lte: feedback.checkin_date}})
        .sort({date: "desc"})
        .populate("cleaner")
        .exec((err, services) => {
            if (err) {
                cb(err, null);
                return;
            }
            if (services.length === 0) {
                const error = new Error('Cleaner cannot be found');
                cb(error, null);
                return;
            }
            cb(null, services[0].cleaner);
        })
}

function _findAllCleaners(feedbacks, cb) {
    async.parallel(
        feedbacks.map(feedback => function(callback) {
            _findCleaner(feedback, callback)
        }),
        (err, results) => {
            if (err) {
                cb(err, null);
                return;
            }
            cb(null, results);
        }
    )
}

exports.feedbacks_get = function(req, res, next) {
    const date = req.params ? req.params.date ? new Date(req.params.date) : new Date() : new Date()
    Feedback.find({month: getMonth(date), year: getYear(date)})
        .populate("room")
        .exec((err, feedbacks) => {
            if (err) {
                return next(err);
            }
            _findAllCleaners(feedbacks, (err, cleaners) => {
                if (err) {
                    return next(err);
                }
                feedbacks.forEach((feedback, index) => {
                    feedback.depart_cleaner = cleaners[index];
                });
                res.render("feedbacks", {
                    title: "Feedbacks",
                    date: date,
                    page: 0,
                    feedbacks
                });
            });
        })
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
                    year: getYear(req.body.feedback_date),
                    month: getMonth(req.body.feedback_date),
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