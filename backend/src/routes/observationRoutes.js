var Router = require("express").Router;
var addObservation = require("../controllers/observationController").addObservation;

var router = Router();

router.post("/", addObservation);

module.exports = router;
