
const express = require("express");
const router = express.Router();

const {
  createInvoice,
  getInvoices,
  getInvoiceById,
} = require("../controllers/invoiceControllers");

router.post("/create-invoice", createInvoice);

// Keep the search/list route before the ID route
router.get("/get-invoice", getInvoices);
router.get("/get-invoice/:id", getInvoiceById);

module.exports = router;
