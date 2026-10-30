
const mongoose = require("mongoose");

const invoiceCounterSchema = new mongoose.Schema(
  {
    financialYear: {
      type: String,
      required: true,
      unique: true,
    },

    sequence: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model(
  "InvoiceCounter",
  invoiceCounterSchema
);
