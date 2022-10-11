const Cleaner = require('../models/cleaner');

exports.cleaner_list = function(req, res, next) {
    Cleaner.find()
        .sort({first_name: "asc"})
        .exec(function(err, cleaner_list) {
            if (err) {
                return next(err);
            }
            res.render("cleaners", {
                title: "Cleaners",
                cleaners: cleaner_list,
            })
        })
}