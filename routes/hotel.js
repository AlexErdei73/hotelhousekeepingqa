var express = require('express');
var router = express.Router();
var cleaner_controller = require('../controllers/cleanerController');
var hotel_controller = require('../controllers/hotelController');

/* GET hotel listing. */
router.get('/', hotel_controller.index);

// Cleaner Roots //
router.get('/cleaners', cleaner_controller.cleaner_list);

module.exports = router;