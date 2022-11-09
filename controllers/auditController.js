const { getYear, getMonth } = require("date-fns");
const Cleaner = require("../models/cleaner");
const Service = require("../models/service");
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

function _getAuditScores(cleaner, date, interval, cb) {
    const query = { audit_score: { $gte: 0 } };
    const dateStringWords = date.toISOString().slice(0, 10).split('-');
    const year = dateStringWords[0];
    const month = dateStringWords[1];
    if (interval === "monthly") {
      let nextMonth = (Number(month) + 1).toString();
      if (nextMonth.length === 1) nextMonth = '0' + nextMonth;
      const firstOfMonth = new Date(`${year}-${month}-01`);
      let firstOfNextMonth;
      if (month !== "12") firstOfNextMonth = new Date(`${year}-${nextMonth}-01`);
        else {
            const nextYear = (Number(year) + 1).toString();
            firstOfNextMonth = `${nextYear}-01-01`;
        }
      query.date = { $gte: firstOfMonth, $lt: firstOfNextMonth };
    } else if (interval === "yeartodate") {
      const firstDayOfYear = new Date(`${year}-01-01`);
      query.date = { $gte: firstDayOfYear, $lte: date };
    } else if (interval === "daily") {
        query.date = date;
    } else {
        const error = new Error('Not found');
        error.status = 404;
        cb(error, null);
        return;
    }
    if (cleaner) query.cleaner = cleaner._id;
    Service.find(query)
    .exec((err, services) => {
        if (err) {
            cb(err, null);
            return;
        }
        const scores = services.map(service => service.audit_score);
        cb(null, scores);
    })
}

function _analyse(result) {
    const { name, scores } = result;
    const n = scores.length;
    const sum = scores.reduce((prevValue, currentValue) => { return (prevValue + currentValue) }, 0);
    const sumOfSquares = scores.map(score => score * score).reduce((prevValue, currentValue) => { return(prevValue + currentValue)}, 0);
    const average = (n > 0) ? (sum / n).toFixed(2) : NaN;
    const stdDev = (n > 1) ? Math.sqrt((sumOfSquares / n  - average * average) * n / (n - 1) ).toFixed(2) : NaN;
    return {
        name,
        average,
        stdDev,
        n
    }
} 

exports.audit_results_get = function(req, res, next) {
    _getCleaners((err, cleaners) => {
        if (err) {
            return next(err);
        }
        const date = new Date(req.params.date);
        cleaners.unshift(null);
        async.parallel(cleaners.map(cleaner => function(callback) {
            _getAuditScores(cleaner, date, req.params.interval, callback);
        }),
        (err, results) => {
            if (err) {
                return next(err);
            }
            const audit_results = results.map((scores, index) => { 
                return {
                    name: cleaners[index] ? cleaners[index].name : "Total",
                    scores
                }
            }).filter(result => result.scores.length > 0).map(result => {
                return _analyse(result);
            })
            res.render("audit_results", {
                title: "Audit Daily Results",
                date,
                audit_results,
                page: 1,
            })
        })
    })
}