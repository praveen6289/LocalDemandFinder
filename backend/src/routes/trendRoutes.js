const { Router } = require("express");
const { getTrends } = require("../controllers/trendController");

const router = Router();

router.get("/", getTrends);

module.exports = router;
