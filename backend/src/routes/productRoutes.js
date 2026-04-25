const { Router } = require("express");
const { getProductById, getProducts } = require("../controllers/productController");

const router = Router();

router.get("/", getProducts);
router.get("/:id", getProductById);

module.exports = router;
