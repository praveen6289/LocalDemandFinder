var Router = require("express").Router;
var productController = require("../controllers/productController");

var router = Router();

router.get("/", productController.getProducts);
router.get("/:id", productController.getProductById);

module.exports = router;
