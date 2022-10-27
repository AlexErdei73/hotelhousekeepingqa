const Service = require("../models/service");
const Cleaner = require("../models/cleaner");
const Room = require("../models/room");
const { body, validationResult } = require("express-validator");
const async = require("async");
const hotel_controller = require("../controllers/hotelController");

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
            res.redirect(`/hotel/${room.page}/${req.body.date}/0`);
          });
        }
      );
    });
  },
];

function _handle_file_error(req, res, message) {
  const MESSAGE = "A Synergy report as a .txt file must be specified to upload";
  const error = new Error(message ? message : MESSAGE);
  const date = req.params
    ? req.params.date
      ? new Date(req.params.date)
      : new Date()
    : new Date();
  hotel_controller.index_data(date, (err, results) => {
    if (err) {
      return next(err);
    }
    const service_details = {
      depart_number: results[0].depart_number,
      stayover_number: results[0].stayover_number,
      linenchange_number: results[0].linenchange_number,
      noservices: results[0].noservices.map((service) => service.room.number),
      DNDs: results[0].DNDs.map((service) => service.room.number),
    };
    res.render("index", {
      title: "Hotel",
      date: date,
      page: 1,
      errors: [error],
      service_details,
      diary_dates: hotel_controller.getDiaryViewDates(date),
      isDataOnDates: results[1],
    });
  });
}

exports.services_upload_post = function (req, res, next) {
  if (!req.files) {
    _handle_file_error(req, res);
    return;
  }
  const file = req.files.fileName;
  const fileBuffer = file.data;
  exports.saveSynergyFile(
    file.name,
    fileBuffer.toString("utf-8"),
    (err, date) => {
      if (err) {
        _handle_file_error(req, res, err.message);
        return;
      }
      res.redirect(`/hotel/1/${date.toISOString().slice(0, 10)}/0`);
    }
  );
};

exports.saveSynergyFile = function (fileName, fileData, cb) {
  const date = _getDate(fileName);
  if (date.error) {
    const error = date.error;
    cb(error, null);
    return;
  }
  Service.find({ date: date })
    .count()
    .exec((err, number) => {
      if (err) {
        cb(err, null);
        return;
      }
      if (number > 0) {
        const error = new Error(
          `There is already data on ${date.toISOString().slice(0, 10)}`
        );
        cb(error, null);
        return;
      }
      _getServices(fileData.split("\n"), date, (err, services) => {
        if (err) {
          cb(err, null);
          return;
        }
        const saveFunctions = [];
        services.forEach((service) => {
          saveFunctions.push(function (callback) {
            _saveService(service, callback);
          });
        });
        async.parallel(saveFunctions, (err) => {
          if (err) {
            cb(err, null);
            return;
          }
          cb(null, date);
        });
      });
    });
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
              (cleaner) => cleaner.name_id.toLowerCase() === service.cleanerName.toLowerCase()
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
  const dateString = datePart.slice(0, 11);
  const words = dateString.split(".");
  const day = words[1];
  const month = words[0];
  const year = words[2];
  const date = new Date(`${year}-${month}-${day}`);
  //If we do not get the valid date the file may be corrupt
  if (isNaN(date)) return { error: error };
  return date;
}
