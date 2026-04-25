const { Router } = require("express");
const { searchMarketplace } = require("../controllers/marketplaceController");

const router = Router();

router.get("/search", searchMarketplace);

module.exports = router;
