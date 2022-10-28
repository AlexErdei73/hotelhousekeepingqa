var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.redirect('/hotel');
});

/* GET favicon */
router.get('/favicon.ico', function(req, res, next) {
  res.redirect('/public/images/favicon.ico');
});

module.exports = router;
