const { getYear, getMonth } = require("date-fns");
const Cleaner = require("../models/cleaner");
const Feedback = require("../models/feedback");
const async = require("async");

function _getCleaners(cb) {
  Cleaner.find({}).exec((err, cleaners) => {
    if (err) {
      cb(err, null);
      return;
    }
    cb(null, cleaners);
  });
}

function _getMonthlyFeedbacks(date, cb) {
  Feedback.find({ year: getYear(date), month: getMonth(date) }).exec(
    (err, feedbacks) => {
      if (err) {
        cb(err, null);
        return;
      }
      cb(null, feedbacks);
    }
  );
}

function _getMonthlyData(date, cb) {
  async.parallel(
    {
      cleanrs(callback) {
        _getCleaners(callback);
      },
      feedbacks(callback) {
        _getMonthlyFeedbacks(date, callback);
      },
    },
    (err, results) => {
      if (err) {
        cb(err, null);
        return;
      }
      cb(null, results);
    }
  );
}

exports.results_monthly_get = function (req, res, next) {
  const date = new Date(req.params.date);
  _getMonthlyData(date, (err, results) => {
    if (err) {
      return next(err);
    }
    res.send(results);
  });
};

exports.results_yeartodate_get = function (req, res, next) {
  res.send("NOT IMPLEMENTED");
};
