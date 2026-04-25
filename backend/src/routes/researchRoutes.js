const { Router } = require("express");
const { analyze } = require("../controllers/researchController");

const router = Router();

router.post("/analyze", analyze);

module.exports = router;
