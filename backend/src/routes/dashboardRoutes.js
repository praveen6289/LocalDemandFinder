var Router = require("express").Router;
var getDashboard = require("../controllers/dashboardController").getDashboard;

var router = Router();

router.get("/", getDashboard);

module.exports = router;
