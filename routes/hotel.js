var express = require("express");
var router = express.Router();
var cleaner_controller = require("../controllers/cleanerController");
var service_controller = require("../controllers/serviceController");
var hotel_controller = require("../controllers/hotelController");
var page_controller = require("../controllers/pageController");

/* GET hotel listing. */
router.get("/", hotel_controller.index);

// Cleaner Roots //
router.get("/cleaners", cleaner_controller.cleaner_list);
router.get("/cleaner/create", cleaner_controller.cleaner_create_get);
router.post("/cleaner/create", cleaner_controller.cleaner_create_post);
router.get("/cleaner/:id", cleaner_controller.cleaner_get);
router.get("/cleaner/update/:id", cleaner_controller.cleaner_update_get);
router.post("/cleaner/update/:id", cleaner_controller.cleaner_update_post);

// ServicedRoom Roots //
router.get("/service/create", service_controller.service_create_get);
router.post("/service/create", service_controller.service_create_post);
router.post("/service/upload", service_controller.services_upload_post);

// Hotel Page Roots //
router.get("/:date", hotel_controller.index);
router.get("/:page/:date/:index", page_controller.page_get);
router.post("/:page/:date/:index", page_controller.page_post);

module.exports = router;
