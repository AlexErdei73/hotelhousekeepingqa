const Service = require('../models/service');
const Cleaner = require('../models/cleaner');
const Room = require('../models/room');
const { body, validationResult } = require("express-validator");

function _service_create_get(res, next, service, errors) {
    Cleaner.find({active: true})
        .sort({first_name: 'asc'})
        .exec(function(err, cleaners){
        if (err) {
            return next(err);
        }
        res.render("service_form", {
            title: "Create Srevice",
            cleaners,
            service,
            errors
        });
    });
}

exports.service_create_get = function(req, res, next) {
    _service_create_get(res, next, null, null);
};

exports.service_create_post = [
    body("date")
        .isISO8601()
        .withMessage("Date must be specified and valid")
        .toDate(),
    body("roomnumber")
        .isInt({min:0, max:9999, allow_leading_zeroes: true})
        .withMessage("Roomnumber is required and 4 digits integer") 
        .toInt(),
    body("cleaner")
        .isMongoId()
        .withMessage("You have to choose cleaner"),
    body("type")
        .isIn(["stay over","linen change","depart","no service","DND"])
        .withMessage("Service type is required"),
    function(req, res, next) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            const service = {
                date: req.body.date,
                roomnumber: req.body.roomnumber,
                cleaner: req.body.cleaner,
                type: req.body.type
            }
            _service_create_get(res, next, service, errors.array());
            return;
        }
        Room.findOne({number: req.body.roomnumber})
            .exec((err, room) => {
                if (err) {
                    return next(err);
                }
                if (room === null) {
                    const error = new Error("Roomnumber does not exist");
                    const service = {
                        date: req.body.date,
                        roomnumber: req.body.roomnumber,
                        cleaner: req.body.cleaner,
                        type: req.body.type
                    }
                    const errors = [];
                    errors.push(error);
                    _service_create_get(res, next, service, errors);
                    return;
                }
                Service.find({room: room._id, date: req.body.date}).exec((err, services) => {
                    if (err) {
                        return next(err);
                    }
                    if (services.length !== 0) {
                        const error = new Error("Service has been already added");
                        const errors = [];
                        errors.push(error);
                        const service = {
                            date: req.body.date,
                            roomnumber: req.body.roomnumber,
                            cleaner: req.body.cleaner,
                            type: req.body.type
                        }
                        _service_create_get(res, next, service, errors);
                        return;
                    }
                    const service = new Service({
                        date: req.body.date,
                        room: room._id,
                        cleaner: req.body.cleaner,
                        type: req.body.type
                    })
                    service.save((err) => {
                        if (err) {
                            return next(err);
                        }
                        res.redirect("/hotel");
                    })
                })
            })
    }
]