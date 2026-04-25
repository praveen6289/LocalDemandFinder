const { Router } = require("express");
const { analyzeOpportunityController } = require("../controllers/opportunityController");

const router = Router();

router.get("/analyze", analyzeOpportunityController);

module.exports = router;
