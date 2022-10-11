var express = require('express');
var router = express.Router();

/* GET hotel listing. */

// Cleaner Roots //
router.get('/cleaners', cleaner_controller.cleaner_list);

module.exports = router;