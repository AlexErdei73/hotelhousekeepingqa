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
                cleaners: results[2]
            });
        })
}

exports.page_post = function(req, res, next) {
    res.send('NOT IMPLEMENTED');
}