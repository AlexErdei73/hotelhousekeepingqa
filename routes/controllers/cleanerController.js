const Cleaner = require('../../models/cleaner');

exports.cleaner_list = function(req, res, next) {
    Cleaner.find()
        .sort({first_name: "asc"})
        .exec(function(err, cleaners) {
            if (err) {
                return next(err);
            }
            res.render("cleaner_list", {
                title: "Cleaner List",
                cleaners: cleaners,
            })
        })
}