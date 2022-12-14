const Service = require("../models/service");
const Cleaner = require("../models/cleaner");
const Room = require("../models/room");
const { body, validationResult } = require("express-validator");
const async = require("async");
require("dotenv").config();
const bcrypt = require("bcryptjs");

function _roomsOnPage(req, cb) {
  const page = req.params.page;
  Room.find({ page: page })
    .sort({ number: "asc" })
    .exec((err, rooms) => {
      if (err) {
        cb(err, null);
        return;
      }
      cb(null, rooms);
    });
}

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
    });
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
    });
}

function _render_page(req, errors, password, cb) {
  async.parallel(
    [
      function (callback) {
        _roomsOnPage(req, callback);
      },
      function (callback) {
        _servicesOnDate(req, callback);
      },
      _activeCleaners,
    ],
    (err, results) => {
      if (err) {
        cb(err, null);
        return;
      }
      const rooms = results[0];
      const services = results[1];
      const serviceRecords = rooms.map((room) => {
        const roomnumber = room.number;
        const service = services
          ? services.find((service) => service.room.number === roomnumber)
          : undefined;
        let cleaner, type, audit_score;
        if (!service) {
          cleaner = { _id: "", name: "" };
          type = "";
          audit_score = "";
        } else {
          cleaner = { _id: service.cleaner._id, name: service.cleaner.name };
          type = service.type;
          audit_score = service.audit_score >= 0 ? service.audit_score : "";
        }
        return { roomnumber, cleaner, type, audit_score };
      });
      cb(null, {
        page: req.params.page,
        date: new Date(req.params.date),
        title: `Hotel Page ${req.params.page}`,
        formVisible: false,
        serviceRecords,
        service: null,
        cleaners: results[2],
        index: req.body.index || req.params.index,
        password,
        errors
      });
    }
  );
}

exports.page_get = function (req, res, next) {
  _render_page(req, null, "", (err, result) => {
    if (err) {
      return next(err);
    }
    res.render("pageview", result);
  })
};

exports.page_post = [
  body("date")
    .isISO8601()
    .withMessage("Date must be specified and valid")
    .toDate(),
  body("roomnumber")
    .isInt({ min: 0, max: 9999, allow_leading_zeroes: true })
    .withMessage("Roomnumber is required and 4 digits integer")
    .toInt(),
  body("cleaner").isMongoId().withMessage("You have to choose cleaner"),
  body("type")
    .isIn([" ", "stay over", "linen change", "depart", "no service", "DND"])
    .withMessage("Service type is required"),
  body("audit_score")
    .optional({ checkFalsy: true })
    .isInt({ min: 0, max: 100, allow_leading_zeros: false })
    .withMessage("Audit score is an integer between 0 and 100")
    .toInt(),
  body("password")
    .isLength({ min: 1 })
    .escape()
    .withMessage("Password must be specified"),

  function (req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      _render_page(req, errors.array(), req.body.password, (err, result) => {
        if (err) {
          return next(err);
        }
        res.render("pageview", result);
      })
      return;
    }
    const password = process.env.PASSWORD;
    bcrypt.compare(req.body.password, password, (err, success) => {
      if (err) {
        return next(err);
      }
      if (success) {
        Room.findOne({ number: req.body.roomnumber }).exec((err, room) => {
          if (err) {
            return next(err);
          }
          if (room === null) {
            const error = new Error("Roomnumber does not exist");
            const errors = [];
            errors.push(error);
            _render_page(req, errors, req.body.password, (err, result) => {
              if (err) {
                return next(err);
              }
              res.render("pageview", result);
            })
            return;
          }
          Service.find({ room: room._id, date: req.body.date }).exec(
            (err, services) => {
              if (err) {
                return next(err);
              }
              if (services.length !== 0) {
                // Service exists, we either update or delete it
                if (req.body.type === " ") {
                  // Delete service
                  Service.findByIdAndRemove(services[0]._id, {}, (err) => {
                    if (err) {
                      return next(err);
                    }
                    _render_page(req, null, req.body.password, (err, result) => {
                      if (err) {
                        return next(err);
                      }
                      res.render("pageview", result);
                  });
                })
                } else {
                  // Update service
                  Service.findByIdAndUpdate(
                    services[0]._id,
                    {
                      room: room._id,
                      date: new Date(req.body.date),
                      cleaner: req.body.cleaner,
                      type: req.body.type,
                      audit_score: req.body.audit_score,
                      _id: services[0]._id,
                    },
                    {},
                    (err) => {
                      if (err) {
                        return next(err);
                      }
                      _render_page(req, null, req.body.password, (err, result) => {
                        if (err) {
                          return next(err);
                        }
                        res.render("pageview", result);
                      });
                    }
                  );
                }
                return;
              }
              const service = new Service({
                date: req.body.date,
                room: room._id,
                cleaner: req.body.cleaner,
                type: req.body.type,
                audit_score: req.body.audit_score,
              });
              service.save((err) => {
                if (err) {
                  return next(err);
                }
                _render_page(req, null, req.body.password, (err, result) => {
                  if (err) {
                    return next(err);
                  }
                  res.render("pageview", result);
              });
            });
        });
      })
      } else {
        const error = new Error("Invalid Password");
      _render_page(req, [error], req.body.password, (err, result) => {
        if (err) {
          return next(err);
        }
        res.render("pageview", result);
      })
      return;
      }
    })
  }
];
