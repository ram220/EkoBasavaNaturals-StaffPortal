const express = require("express");
const router = express.Router();

const {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deactivateProduct,
} = require("../controllers/productControllers");

router.post("/add-product", createProduct);
router.get("/get-all-products", getProducts);
router.get("/get-product/:id", getProductById);
router.put("/update-product/:id", updateProduct);
router.patch("/:id/deactivate", deactivateProduct);

module.exports = router;
