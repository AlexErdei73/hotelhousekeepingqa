const Service = require("../models/service");
const async = require("async");

function _getServiceNumber(type, date, cb) {
  Service.find({ type: type, date: date })
    .count()
    .exec((err, number) => {
      if (err) {
        cb(err, NaN);
        return;
      }
      cb(null, number);
    });
}

function _getServiceTypes(type, date, cb) {
  Service.find({ type: type, date: date })
    .populate("room")
    .exec((err, services) => {
      if (err) {
        cb(err, null);
        return;
      }
      cb(null, services);
    });
}

exports.service_details = function (date, cb) {
  async.parallel(
    {
      depart_number(callback) {
        _getServiceNumber("depart", date, callback);
      },
      stayover_number(callback) {
        _getServiceNumber("stay over", date, callback);
      },
      linenchange_number(callback) {
        _getServiceNumber("linenchange", date, callback);
      },
      noservices(callback) {
        _getServiceTypes("no service", date, callback);
      },
      DNDs(callback) {
        _getServiceTypes("DND", date, callback);
      },
    },
    cb
  );
};

exports.index = function (req, res, next) {
  const date = req.params.date ? new Date(req.params.date) : new Date();
  exports.service_details(date, (err, results) => {
    if (err) {
      return next(err);
    }
    const service_details = {
      depart_number: results.depart_number,
      stayover_number: results.stayover_number,
      linenchange_number: results.linenchange_number,
      noservices: results.noservices.map((service) => service.room.number),
      DNDs: results.DNDs.map((service) => service.room.number),
    };
    res.render("index", {
      title: "Hotel",
      date: date,
      page: 1,
      errors: null,
      service_details,
    });
  });
};
