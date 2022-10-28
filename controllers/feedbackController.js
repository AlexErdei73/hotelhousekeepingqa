const Feedback = require("../models/feedback");
const Room = require("../models/room");
const Service = require("../models/service");
const { body, validationResult } = require("express-validator");
const { getYear, getMonth } = require("date-fns");
const async = require("async");

function _findDepartCleaner(feedback, cb) {
  Service.find({
    room: feedback.room._id,
    type: "depart",
    date: { $lte: feedback.checkin_date },
  })
    .sort({ date: "desc" })
    .populate("cleaner")
    .exec((err, services) => {
      if (err) {
        cb(err, null);
        return;
      }
      if (services.length === 0) {
        const error = new Error("Cleaner cannot be found");
        cb(error, null);
        return;
      }
      cb(null, services[0].cleaner);
    });
}

function _findStayoverCleaner(feedback, cb) {
  Service.find({
    room: feedback.room._id,
    type: "stay over",
    date: { $gt: feedback.checkin_date, $lt: feedback.checkout_date },
  })
    .sort({ date: "desc" })
    .populate("cleaner")
    .exec((err, services) => {
      if (err) {
        cb(err, null);
        return;
      }
      if (services.length === 0) {
        cb(null, null);
        return;
      }
      cb(null, services[0]);
    });
}

function _findLinenchangeCleaner(feedback, cb) {
  if (feedback.depart_cleaner) {
    cb(null, feedback.stayover_cleaner);
    return;
  }
  Service.find({
    room: feedback.room._id,
    type: "linen change",
    date: { $gt: feedback.checkin_date, $lt: feedback.checkout_date },
  })
    .sort({ date: "desc" })
    .populate("cleaner")
    .exec((err, services) => {
      if (err) {
        cb(err, null);
        return;
      }
      if (services.length === 0) {
        cb(null, null);
        return;
      }
      cb(null, services[0]);
    });
}

function _findStayOrLinenchangeCleaner(feedback, cb) {
  if (feedback.depart_cleaner) {
    cb(null, feedback.stayover_cleaner);
    return;
  }
  async.parallel(
    [
      function (callback) {
        _findStayoverCleaner(feedback, callback);
      },
      function (callback) {
        _findLinenchangeCleaner(feedback, callback);
      },
    ],
    (err, results) => {
      if (err) {
        cb(err, null);
        return;
      }
      const stayOverService = results[0];
      const linenChangeService = results[1];
      if (!stayOverService) {
        cb(null, linenChangeService ? linenChangeService.cleaner : null);
        return;
      }
      if (!linenChangeService) {
        cb(null, stayOverService ? stayOverService.cleaner : null);
        return;
      }
      if (linenChangeService.date >= stayOverService.date) {
        cb(null, linenChangeService.cleaner);
        return;
      }
      cb(null, stayOverService.cleaner);
    }
  );
}

function _findCleaner(feedback, cb) {
  async.parallel(
    {
      depart_cleaner(callback) {
        _findDepartCleaner(feedback, callback);
      },
      stayover_cleaner(callback) {
        _findStayOrLinenchangeCleaner(feedback, callback);
      },
    },
    (err, result) => {
      if (err) {
        cb(err, null);
        return;
      }
      cb(null, {
        stayover_cleaner: result.stayover_cleaner,
        depart_cleaner: result.depart_cleaner,
      });
    }
  );
}

function _findAllCleaners(feedbacks, cb) {
  async.parallel(
    feedbacks.map(
      (feedback) =>
        function (callback) {
          _findCleaner(feedback, callback);
        }
    ),
    (err, results) => {
      if (err) {
        cb(err, null);
        return;
      }
      cb(null, results);
    }
  );
}

function _updateFeedback(feedback, cleaners, cb) {
  if (feedback.depart_cleaner) {
    cb(null, feedback);
    return;
  }
  const newFeedback = {
    _id: feedback._id,
    checkin_date: feedback.checkin_date,
    checkout_date: feedback.checkout_date,
    room: feedback.room,
    score: feedback.score,
    date: feedback.date,
    year: feedback.year,
    month: feedback.month,
    depart_cleaner: cleaners.depart_cleaner,
    stayover_cleaner: cleaners.stayover_cleaner,
  };
  Feedback.findByIdAndUpdate(feedback._id, newFeedback, (err) => {
    if (err) {
      cb(err, null);
      return;
    }
    cb(null, newFeedback);
  });
}

function _updateAllFeedback(feedbacks, cleaners, cb) {
  async.parallel(
    feedbacks.map(
      (feedback, index) =>
        function (callback) {
          _updateFeedback(feedback, cleaners[index], callback);
        }
    ),
    (err, updatedFeedbacks) => {
      if (err) {
        cb(err, null);
        return;
      }
      cb(null, updatedFeedbacks);
    }
  );
}

exports.feedbacks_get = function (req, res, next) {
  const date = req.params
    ? req.params.date
      ? new Date(req.params.date)
      : new Date()
    : new Date();
  Feedback.find({ month: getMonth(date), year: getYear(date) })
    .populate("room")
    .populate("depart_cleaner")
    .populate("stayover_cleaner")
    .exec((err, feedbacks) => {
      if (err) {
        return next(err);
      }
      async.waterfall(
        [
          function (callback) {
            _findAllCleaners(feedbacks, callback);
          },
          function (cleaners, callback) {
            _updateAllFeedback(feedbacks, cleaners, callback);
          },
        ],
        (err, updatedFeedbacks) => {
          if (err) {
            return next(err);
          }
          res.render("feedbacks", {
            title: "Feedbacks",
            date: date,
            page: 0,
            feedbacks: updatedFeedbacks,
          });
        }
      );
    });
};

exports.feedbacks_post = function (req, res, next) {
  res.send("NOT IMPLEMENTED");
};

exports.feedback_create_get = function (req, res, next) {
  res.render("feedback_form", {
    title: "Create Feedback",
    feedback: null,
    errors: null,
    page: 1,
    date: new Date(),
  });
};

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
          score: req.body.score,
        },
        errors: errors.array(),
        page: 1,
        date: new Date(),
      });
      return;
    }
    Room.findOne({ number: req.body.roomnumber }).exec((err, room) => {
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
            score: req.body.score,
          },
          errors: [
            new Error(
              `There is no room with ${req.body.roomnumber} number in the hotel`
            ),
          ],
          page: 1,
          date: new Date(),
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
        score: req.body.score,
      });
      feedback.save((err) => {
        if (err) {
          return next(err);
        }
        res.send(feedback);
      });
    });
  },
];
