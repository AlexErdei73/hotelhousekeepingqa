exports.index = function(req, res, next) {
    res.render("index", {
        title: "Hotel",
        date: new Date(),
        page: 1
    })
}