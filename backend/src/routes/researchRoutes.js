var Router = require("express").Router;
var analyze = require("../controllers/researchController").analyze;

var router = Router();

router.post("/analyze", analyze);

module.exports = router;
