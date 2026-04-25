const { Router } = require("express");
const { getAveragePriceController } = require("../controllers/priceController");

const router = Router();

router.get("/average", getAveragePriceController);

module.exports = router;
