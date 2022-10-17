const Service = require('../models/service');
const Cleaner = require('../models/cleaner');
const Room = require('../models/room');
const { body, validationResult } = require("express-validator");
const async = require('async');

function _roomsOnPage(req, cb) {
    const page = req.params.page;
    Room.find({page: page})
        .sort({number: "asc"})
        .exec((err, rooms) => {
            if (err) {
                cb(err, null);
                return;
            };
            cb(null, rooms);
        })
};

function _servicesOnDate(req, cb) {
    const date = req.params.date;
    Service.find({ date: new Date(date) })
        .populate("room")
        .populate("cleaner")
        .exec((err, services) => {
            if (err) {
                cb(err, null);
                return;
            }
            cb(null, services);
        })
}

function _activeCleaners(cb) {
    Cleaner.find({ active: true })
        .sort({ first_name: "asc" })
        .exec((err, cleaners) => {
            if (err) {
                cb(err, null);
                return;
            }
            cb(null, cleaners);
        })
}

exports.page_get = function(req, res, next) {
            
        async.parallel([
            function(callback) {
                _roomsOnPage(req, callback);
            },
            function(callback) {
                _servicesOnDate(req, callback);
            },
            _activeCleaners
        ], (err, results) => {
            if (err) {
                return next(err);
            }
            const rooms = results[0];
            const services = results[1];
            const serviceRecords = rooms.map((room) => {
                const roomnumber = room.number;
                const service = services ? services.find(service => service.room.number === roomnumber) : undefined;
                let cleaner, type;
                if (!service) {
                    cleaner = { _id: "", name: ""};
                    type = "";
                } else {
                    cleaner = { _id: service.cleaner._id, name: service.cleaner.name };
                    type = service.type;
                }
                return { roomnumber, cleaner, type }
            })
            res.render("pageview", { 
                page: req.params.page,
                date: new Date(req.params.date),
                title: `Hotel Page ${req.params.page}`,
                formVisible: false,
                serviceRecords,
                service: null,
                cleaners: results[2],
                index: req.params.index,
            });
        })
}

exports.page_post = [
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
        .isIn(["","stay over","linen change","depart","no service","DND"])
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
                        res.redirect(`/hotel/${req.params.page}/${req.params.date}/${req.body.index}`);
                    })
                })
            })
    }
]