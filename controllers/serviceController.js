const Service = require("../models/service");
const Cleaner = require("../models/cleaner");
const Room = require("../models/room");
const { body, validationResult } = require("express-validator");
const async = require("async");

function _service_create_get(res, next, service, errors) {
  Cleaner.find({ active: true })
    .sort({ first_name: "asc" })
    .exec(function (err, cleaners) {
      if (err) {
        return next(err);
      }
      res.render("service_form", {
        title: "Create Srevice",
        page: 1,
        date: new Date(),
        index: 0,
        cleaners,
        service,
        errors,
        formVisible: true,
      });
    });
}

exports.service_create_get = function (req, res, next) {
  _service_create_get(res, next, null, null);
};

exports.service_create_post = [
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
    .isIn(["stay over", "linen change", "depart", "no service", "DND"])
    .withMessage("Service type is required"),
  function (req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const service = {
        date: req.body.date,
        roomnumber: req.body.roomnumber,
        cleaner: req.body.cleaner,
        type: req.body.type,
      };
      _service_create_get(res, next, service, errors.array());
      return;
    }
    Room.findOne({ number: req.body.roomnumber }).exec((err, room) => {
      if (err) {
        return next(err);
      }
      if (room === null) {
        const error = new Error("Roomnumber does not exist");
        const service = {
          date: req.body.date,
          roomnumber: req.body.roomnumber,
          cleaner: req.body.cleaner,
          type: req.body.type,
        };
        const errors = [];
        errors.push(error);
        _service_create_get(res, next, service, errors);
        return;
      }
      Service.find({ room: room._id, date: req.body.date }).exec(
        (err, services) => {
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
              type: req.body.type,
            };
            _service_create_get(res, next, service, errors);
            return;
          }
          const service = new Service({
            date: req.body.date,
            room: room._id,
            cleaner: req.body.cleaner,
            type: req.body.type,
          });
          service.save((err) => {
            if (err) {
              return next(err);
            }
            res.redirect("/hotel");
          });
        }
      );
    });
  },
];

function _handle_file_error(res, message) {
  const MESSAGE = "A Synergy report as a .txt file must be specified to upload";
  const error = new Error(message ? message : MESSAGE);
  res.render("index", {
    title: "Hotel",
    date: new Date(),
    page: 1,
    errors: [error],
  });
}

exports.services_upload_post = function (req, res, next) {
  if (!req.files) {
    _handle_file_error(res);
    return;
  }
  const file = req.files.fileName;
  const fileBuffer = file.data;
  const date = _getDate(file.name);
  if (date.error) {
    _handle_file_error(res, date.error.message);
    return;
  }
  _getServices(
    fileBuffer.toString("utf-8").split("\n"),
    date,
    (err, services) => {
      if (err) {
        return next(err);
      }
      const saveFunctions = [];
      services.forEach((service) => {
        saveFunctions.push(function (callback) {
          _saveService(service, callback);
        });
      });
      async.parallel(saveFunctions, (err, results) => {
        if (err) {
          return next(err);
        }
        res.redirect(`/hotel/1/${date.toISOString().slice(0, 10)}/0`);
      });
    }
  );
};

function _saveService(serv, cb) {
  const service = new Service(serv);
  service.save((err) => {
    if (err) {
      cb(err, null);
      return;
    }
    cb(null, serv);
  });
}

function _getServices(lines, date, cb) {
  const DEPART = "Check Out";
  const STAY = "Stay Over";
  const LINEN = "Stay Over + Linen";
  const DND = "Do Not Disturb";
  const NOSERVICE = "Service Refused";
  const services = [];
  lines.forEach((line) => {
    const roomnumber = Number(line.split("\t")[0]);
    if (roomnumber !== NaN) {
      if (line.indexOf('"') === -1) return;
      const secondWord = line.split('"')[1];
      const thirdWord = line.split('"')[2];
      const name = secondWord.split(",")[0];
      let type = " ";
      if (thirdWord.indexOf(DEPART) > -1) type = "depart";
      if (thirdWord.indexOf(STAY) > -1) type = "stay over";
      if (thirdWord.indexOf(LINEN) > -1) type = "linen change";
      if (line.indexOf(DND) > -1) type = "DND";
      if (line.indexOf(NOSERVICE) > -1) type = "no service";
      if (type === " ") return;
      services.push({
        roomnumber,
        date,
        type,
        cleanerName: name,
      });
    }
  });
  async.parallel(
    {
      cleaners(callback) {
        Cleaner.find({}).exec(callback);
      },
      rooms(callback) {
        Room.find({}).exec(callback);
      },
    },
    (err, results) => {
      if (err) {
        cb(err, null);
        return;
      }
      const rooms = results.rooms;
      const cleaners = results.cleaners;
      cb(
        null,
        services.map((service) => {
          const newService = {
            date: service.date,
            type: service.type,
            cleaner: cleaners.find(
              (cleaner) => cleaner.name_id === service.cleanerName.toLowerCase()
            )._id,
            room: rooms.find((room) => room.number === service.roomnumber)._id,
          };
          return newService;
        })
      );
    }
  );
}

function _getDate(fileName) {
  const datePart = fileName.split("-")[2];
  const error = new Error("File is not a valid Synergy report");
  //If we cannot parse the date from the fileName, the uploaded file is not Synergy report
  if (!datePart) return { error: error };
  const dateString = datePart.slice(1, 11);
  const words = dateString.split(".");
  const day = words[1];
  const month = words[0];
  const year = words[2];
  const date = new Date(`${year}-${month}-${day}`);
  //If we do not get the valid date the file may be corrupt
  if (isNaN(date)) return { error: error };
  return date;
}
