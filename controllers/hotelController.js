const Service = require("../models/service");
const async = require("async");
const getDay = require("date-fns/getDay");
const subDay = require("date-fns/subDays");
const addDays = require("date-fns/addDays");

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

function _isDataOnDate(date, cb) {
  Service.find({ date: date })
    .count()
    .exec((err, number) => {
      if (err) {
        cb(err, undefined);
        return;
      }
      cb(null, number > 0);
    });
}

service_details = function (date, cb) {
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

exports.getDiaryViewDates = function (date) {
  const dateString = date.toISOString().slice(0, 8);
  //We start from 12:00 to avoid problems with DST (daylight saving time)
  const firstOfMonth = new Date(dateString + "01T12:00:00.000Z");
  const dayOfWeek = getDay(firstOfMonth);
  let sub;
  if (dayOfWeek === 0) sub = 6;
  else sub = dayOfWeek - 1;
  const startDate = subDay(firstOfMonth, sub);
  const diaryViewDates = [];
  for (let i = 0; i < 42; i++) {
    //We need to go back to 00:00 time to pass the database query
    diaryViewDates.push(
      new Date(addDays(startDate, i).toISOString().split("T")[0])
    );
  }
  return diaryViewDates;
};

function _isDataOnDates(date, cb) {
  async.parallel(
    exports.getDiaryViewDates(date).map(
      (nextDate) =>
        function (callback) {
          _isDataOnDate(nextDate, callback);
        }
    ),
    cb
  );
}

exports.index_data = function (date, cb) {
  async.parallel(
    [
      function (callback) {
        service_details(date, callback);
      },
      function (callback) {
        _isDataOnDates(date, callback);
      },
    ],
    cb
  );
};

exports.index = function (req, res, next) {
  const date = req.params.date ? new Date(req.params.date) : new Date();
  exports.index_data(date, (err, results) => {
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
      errors: null,
      service_details,
      diary_dates: exports.getDiaryViewDates(date),
      isDataOnDates: results[1],
      password: "",
    });
  });
};
