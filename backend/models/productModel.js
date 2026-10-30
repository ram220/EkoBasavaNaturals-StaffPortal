
const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    productCode: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
    },
    barcode: {
      type: String,
      trim: true,
      default: "",
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      required: true,
      trim: true,
    },
    shade: {
      type: String,
      trim: true,
      default: "",
    },
    packSize: {
      type: String,
      required: true,
      trim: true,
    },
    hsnCode: {
      type: String,
      required: true,
      trim: true,
    },
    gstRate: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    mrp: {
      type: Number,
      required: true,
      min: 0,
    },
    sellingPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    priceIncludesTax: {
      type: Boolean,
      default: false,
    },
    dealerPrice: {
      type: Number,
      default: null,
      min: 0,
    },
    painterPrice: {
      type: Number,
      default: null,
      min: 0,
    },
    minimumPrice: {
      type: Number,
      default: null,
      min: 0,
    },
    status: {
      type: String,
      enum: ["active", "discontinued"],
      default: "active",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Product", productSchema);
