var express = require("express");
var router = express.Router();
var cleaner_controller = require("../controllers/cleanerController");
var service_controller = require("../controllers/serviceController");
var hotel_controller = require("../controllers/hotelController");
var page_controller = require("../controllers/pageController");
var feedback_controller = require("../controllers/feedbackController");
var results_controller = require("../controllers/resultsController");
var audit_controller = require("../controllers/auditController");

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

//Feedback Roots //
router.get("/feedbacks", feedback_controller.feedbacks_get);
router.post("/feedbacks", feedback_controller.feedbacks_post);
router.get("/feedbacks/:date", feedback_controller.feedbacks_get);
router.get("/feedback/create", feedback_controller.feedback_create_get);
router.post("/feedback/create", feedback_controller.feedback_create_post);

//Result Page Roots //
router.get(
  "/results/depart/monthly/:date",
  results_controller.results_depart_monthly_get
);

router.get(
  "/results/depart/yeartodate/:date",
  results_controller.results_depart_yeartodate_get
);

router.get(
  "/results/stayover/monthly/:date",
  results_controller.results_stayover_monthly_get
);

router.get(
  "/results/stayover/yeartodate/:date",
  results_controller.results_stayover_yeartodate_get
);

//Result Graph Page Roots //
router.get(
  "/results/depart/monthly/graph/:date/:cleaner",
  results_controller.results_depart_monthly_graph_get
);

router.get(
  "/results/depart/yeartodate/graph/:date/:cleaner",
  results_controller.results_depart_yeartodate_graph_get
);

router.get(
  "/results/stayover/monthly/graph/:date/:cleaner",
  results_controller.results_stayover_monthly_graph_get
);

router.get(
  "/results/stayover/yeartodate/graph/:date/:cleaner",
  results_controller.results_stayover_yeartodate_graph_get
);
// Hotel audit roots //
router.get("/audit/:interval/:date", audit_controller.audit_results_get);


// Hotel Page Roots //
router.get("/:date", hotel_controller.index);
router.get("/:page/:date/:index", page_controller.page_get);
router.post("/:page/:date/:index", page_controller.page_post);

module.exports = router;
