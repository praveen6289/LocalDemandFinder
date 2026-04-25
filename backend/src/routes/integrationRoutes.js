const { Router } = require("express");
const {
  getStatus,
  refreshStatus,
  getTrendIntegration,
  getYoutubeIntegration,
  getShoppingIntegration
} = require("../controllers/integrationController");

const router = Router();

router.get("/trends", getTrendIntegration);
router.get("/youtube", getYoutubeIntegration);
router.get("/shopping", getShoppingIntegration);
router.get("/status", getStatus);
router.post("/refresh", refreshStatus);

module.exports = router;
