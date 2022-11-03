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

function _getFeedbacks(date, yeartodate, cb) {
  const query = { year: getYear(date), month: getMonth(date) };
  if (yeartodate) query.month = { $lte: getMonth(date) };
  Feedback.find(query)
    .populate("depart_cleaner")
    .populate("stayover_cleaner")
    .exec((err, feedbacks) => {
      if (err) {
        cb(err, null);
        return;
      }
      cb(null, feedbacks);
    });
}

function _getData(date, yeartodate, cb) {
  async.parallel(
    {
      cleaners(callback) {
        _getCleaners(callback);
      },
      feedbacks(callback) {
        _getFeedbacks(date, yeartodate, callback);
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

function _analyseCleaner(name, active, feedbacks) {
  let numberOfFeedbacks = 0;
  const scores = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
  feedbacks.forEach((feedback) => {
    numberOfFeedbacks++;
    scores[feedback.score]++;
  });
  const saltScore = (scores[9] + scores[10]) / numberOfFeedbacks;
  const complainScore =
    (numberOfFeedbacks - scores[8] - scores[9] - scores[10]) /
    numberOfFeedbacks;
  const averageScore =
    numberOfFeedbacks === 0
      ? NaN
      : scores
          .map((numberOfScore, score) => score * numberOfScore)
          .reduce((prevValue, value) => prevValue + value, 0) /
        numberOfFeedbacks;
  const averageScoreSqare =
    numberOfFeedbacks === 0
      ? NaN
      : scores
          .map((numberOfScore, score) => score * score * numberOfScore)
          .reduce((prevValue, value) => prevValue + value, 0) /
        numberOfFeedbacks;
  const stdDev =
    numberOfFeedbacks > 1
      ? Math.sqrt(
          ((averageScoreSqare - averageScore * averageScore) *
            numberOfFeedbacks) /
            (numberOfFeedbacks - 1)
        )
      : NaN;
  return {
    name,
    active,
    saltScore: numberOfFeedbacks ? (100 * saltScore).toFixed(2) : NaN,
    complainScore: numberOfFeedbacks ? (100 * complainScore).toFixed(2) : NaN,
    numberOfFeedbacks,
    averageScore: numberOfFeedbacks ? averageScore.toFixed(2) : NaN,
    stdDev: numberOfFeedbacks ? stdDev.toFixed(2) : NaN,
    scores,
  };
}

function _analyse(cleaners, feedbacks) {
  results = [];
  results.push(_analyseCleaner("Total", true, feedbacks));
  cleaners.forEach((cleaner) => {
    results.push(
      _analyseCleaner(
        cleaner.name,
        cleaner.active,
        feedbacks.filter((feedback) => {
          return feedback.depart_cleaner
            ? feedback.depart_cleaner.name === cleaner.name
            : false;
        })
      )
    );
  });
  return results.sort((resA, resB) => {
    if (resA.active && !resB.active) return -1;
    if (!resA.active && resB.active) return 1;
    return 0;
  });
}

exports.results_monthly_get = function (req, res, next) {
  const date = new Date(req.params.date);
  _getData(date, false, (err, results) => {
    if (err) {
      return next(err);
    }
    const cleaners = results.cleaners;
    const feedbacks = results.feedbacks;
    res.render("results", {
      title: "Analysis Results",
      results: _analyse(cleaners, feedbacks).filter(
        (result) => result.numberOfFeedbacks > 0
      ),
      page: 1,
      date: date,
    });
  });
};

exports.results_yeartodate_get = function (req, res, next) {
  const date = new Date(req.params.date);
  _getData(date, true, (err, results) => {
    if (err) {
      return next(err);
    }
    const cleaners = results.cleaners;
    const feedbacks = results.feedbacks;
    res.render("results", {
      title: "Analysis Results",
      results: _analyse(cleaners, feedbacks).filter(
        (result) => result.numberOfFeedbacks > 0
      ),
      page: 1,
      date: date,
    });
  });
};

exports.results_monthly_graph_get = function (req, res, next) {
  const date = new Date(req.params.date);
  _getData(date, false, (err, results) => {
    if (err) {
      return next(err);
    }
    const cleaners = results.cleaners;
    const feedbacks = results.feedbacks;
    const cleaner = req.params.cleaner;
    res.render("graph", {
      title: `${cleaner}'s Scores`,
      cleaner: cleaner,
      results: _analyse(cleaners, feedbacks).filter((result) => {
        return result.name.trim() === cleaner || result.name.trim() === "Total";
      }),
      page: 1,
      date: date,
    });
  });
};

exports.results_yeartodate_graph_get = function (req, res, next) {
  const date = new Date(req.params.date);
  _getData(date, true, (err, results) => {
    if (err) {
      return next(err);
    }
    const cleaners = results.cleaners;
    const feedbacks = results.feedbacks;
    const cleaner = req.params.cleaner;
    res.render("graph", {
      title: `${cleaner}'s Scores`,
      cleaner: cleaner,
      results: _analyse(cleaners, feedbacks).filter((result) => {
        return result.name.trim() === cleaner || result.name.trim() === "Total";
      }),
      page: 1,
      date: date,
    });
  });
};
