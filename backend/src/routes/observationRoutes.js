const { Router } = require("express");
const { addObservation } = require("../controllers/observationController");

const router = Router();

router.post("/", addObservation);

module.exports = router;
