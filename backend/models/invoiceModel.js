
const mongoose = require("mongoose");

const invoiceItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },

    // Snapshot of the product when the invoice is created
    productCode: { type: String, required: true },
    productName: { type: String, required: true },
    hsnCode: { type: String, required: true },
    packSize: { type: String, required: true },

    quantity: { type: Number, required: true, min: 0.001 },
    unitPrice: { type: Number, required: true, min: 0 },
    discount: { type: Number, default: 0, min: 0 },
    gstRate: { type: Number, required: true, min: 0, max: 100 },

    taxableValue: { type: Number, required: true, min: 0 },
    cgst: { type: Number, default: 0, min: 0 },
    sgst: { type: Number, default: 0, min: 0 },
    igst: { type: Number, default: 0, min: 0 },
    total: { type: Number, required: true, min: 0 },
  },
  { _id: false }
);

const invoiceSchema = new mongoose.Schema(
  {
    invoiceNumber: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
    },

    invoiceDate: {
      type: Date,
      default: Date.now,
      required: true,
    },

    // Customer snapshot for this particular invoice
    customer: {
      customerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Customer",
        default: null,
      },
      name: { type: String, required: true, trim: true },
      mobile: { type: String, required: true, trim: true },
      gstin: { type: String, default: "", trim: true },
      address: { type: String, default: "", trim: true },
      state: { type: String, required: true, trim: true },
      customerType: {
        type: String,
        enum: [
          "retail",
          "contractor",
          "painter",
          "dealer",
          "builder",
          "institution",
        ],
        default: "retail",
      },
    },

    items: {
      type: [invoiceItemSchema],
      required: true,
      validate: {
        validator: (items) => items.length > 0,
        message: "An invoice must contain at least one product.",
      },
    },

    subtotal: { type: Number, required: true, min: 0 },
    discountTotal: { type: Number, default: 0, min: 0 },
    taxableValue: { type: Number, required: true, min: 0 },

    cgst: { type: Number, default: 0, min: 0 },
    sgst: { type: Number, default: 0, min: 0 },
    igst: { type: Number, default: 0, min: 0 },

    grandTotal: { type: Number, required: true, min: 0 },

    paymentMode: {
      type: String,
      enum: ["cash", "upi", "card", "bank_transfer", "credit", "other"],
      default: "cash",
    },

    amountPaid: { type: Number, default: 0, min: 0 },
    balanceDue: { type: Number, required: true, min: 0 },

    status: {
      type: String,
      enum: ["draft", "final", "paid", "part_paid", "unpaid", "cancelled"],
      default: "draft",
    },

    notes: { type: String, default: "", trim: true },
  },
  { timestamps: true }
);

invoiceSchema.index({ invoiceDate: -1 });
invoiceSchema.index({ "customer.mobile": 1 });
invoiceSchema.index({ "customer.name": 1 });

module.exports = mongoose.model("Invoice", invoiceSchema);
