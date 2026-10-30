
const mongoose = require("mongoose");
const Invoice = require("../models/invoiceModel");
const Product = require("../models/productModel");
const generateInvoiceNumber = require("../utils/invoiceNumber");

// Round monetary amounts to 2 decimal places
const roundMoney = (amount) =>
  Math.round((amount + Number.EPSILON) * 100) / 100;

// Create a new invoice
exports.createInvoice = async (req, res) => {
  try {
    const {
      customer,
      items,
      paymentMode = "cash",
      amountPaid = 0,
      notes = "",
    } = req.body;

    // 1. Validate customer information
    if (
      !customer ||
      !customer.name?.trim() ||
      !customer.mobile?.trim() ||
      !customer.state?.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "Customer name, mobile and state are required.",
      });
    }

    // 2. Validate the products
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Add at least one product to the invoice.",
      });
    }

    if (
      !["cash", "upi", "card", "bank_transfer", "credit", "other"].includes(
        paymentMode
      )
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment mode.",
      });
    }

    // 3. Fetch products and calculate prices on the server
    const calculatedItems = [];

    let subtotal = 0;
    let discountTotal = 0;
    let taxableValue = 0;
    let cgst = 0;
    let sgst = 0;
    let igst = 0;

    for (const item of items) {
      if (
        !mongoose.isValidObjectId(item.productId) ||
        !Number.isFinite(Number(item.quantity)) ||
        Number(item.quantity) <= 0 ||
        !Number.isFinite(Number(item.discount ?? 0)) ||
        Number(item.discount ?? 0) < 0
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid product ID, quantity or discount.",
        });
      }

      const product = await Product.findById(item.productId);

      if (!product || product.status !== "active") {
        return res.status(400).json({
          success: false,
          message: "A selected product was not found or is inactive.",
        });
      }

      const quantity = Number(item.quantity);
      const unitPrice = Number(product.sellingPrice);
      const discountPerUnit = Number(item.discount ?? 0);

      if (
        !Number.isFinite(unitPrice) ||
        !Number.isFinite(Number(product.gstRate)) ||
        discountPerUnit > unitPrice
      ) {
        return res.status(400).json({
          success: false,
          message: `Invalid price, discount or tax rate for ${product.name}.`,
        });
      }

      const lineSubtotal = roundMoney(unitPrice * quantity);
      const lineDiscount = roundMoney(discountPerUnit * quantity);
      const lineAmount = roundMoney(lineSubtotal - lineDiscount);

      // Inclusive-tax prices already contain GST.
      const lineTaxable = product.priceIncludesTax
        ? roundMoney(lineAmount * 100 / (100 + product.gstRate))
        : lineAmount;

      const lineTax = roundMoney(lineAmount - lineTaxable);

      // Until place-of-supply validation is implemented,
      // this initial version assumes an intra-state sale.
      const lineCgst = roundMoney(lineTax / 2);
      const lineSgst = roundMoney(lineTax - lineCgst);

      calculatedItems.push({
        product: product._id,
        productCode: product.productCode,
        productName: product.name,
        hsnCode: product.hsnCode,
        packSize: product.packSize,
        quantity,
        unitPrice,
        discount: discountPerUnit,
        gstRate: product.gstRate,
        taxableValue: lineTaxable,
        cgst: lineCgst,
        sgst: lineSgst,
        igst: 0,
        total: lineAmount,
      });

      subtotal += lineSubtotal;
      discountTotal += lineDiscount;
      taxableValue += lineTaxable;
      cgst += lineCgst;
      sgst += lineSgst;
    }

    subtotal = roundMoney(subtotal);
    discountTotal = roundMoney(discountTotal);
    taxableValue = roundMoney(taxableValue);
    cgst = roundMoney(cgst);
    sgst = roundMoney(sgst);

    const grandTotal = roundMoney(taxableValue + cgst + sgst);
    const paid = Number(amountPaid);

    if (
      !Number.isFinite(paid) ||
      paid < 0 ||
      paid > grandTotal
    ) {
      return res.status(400).json({
        success: false,
        message: "Amount paid must be between zero and the invoice total.",
      });
    }

    const balanceDue = roundMoney(grandTotal - paid);

    let status = "unpaid";

    if (paid === grandTotal) {
      status = "paid";
    } else if (paid > 0) {
      status = "part_paid";
    }

    // 4. Save the invoice
    // Invoice numbering will be added in the next step.
    
const invoiceNumber = await generateInvoiceNumber();

const invoice = await Invoice.create({
  invoiceNumber,
  customer: {
    customerId: customer.customerId || null,
    name: customer.name.trim(),
    mobile: customer.mobile.trim(),
    gstin: customer.gstin || "",
    address: customer.address || "",
    state: customer.state.trim(),
    customerType: customer.customerType || "retail",
  },
  items: calculatedItems,
  subtotal,
  discountTotal,
  taxableValue,
  cgst,
  sgst,
  igst,
  grandTotal,
  paymentMode,
  amountPaid: paid,
  balanceDue,
  status,
  notes,
});


    return res.status(201).json({
      success: true,
      message: "Invoice created successfully.",
      data: invoice,
    });
  } catch (error) {
    console.error("Create invoice error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create invoice.",
    });
  }
};




const getInvoices = async (req, res) => {
  try {
    const {
      search = "",
      status = "",
      page = 1,
      limit = 10,
    } = req.query;

    const currentPage = Math.max(1, Number.parseInt(page, 10) || 1);
    const pageSize = Math.min(
      100,
      Math.max(1, Number.parseInt(limit, 10) || 10)
    );

    const filter = {};

    // Search by invoice number, customer name or mobile
    if (search.trim()) {
      const escapedSearch = search.trim().replace(
        /[.*+?^${}()|[\]\\]/g,
        "\\$&"
      );

      const searchRegex = new RegExp(escapedSearch, "i");

      filter.$or = [
        { invoiceNumber: searchRegex },
        { "customer.name": searchRegex },
        { "customer.mobile": searchRegex },
      ];
    }

    if (status) {
      const allowedStatuses = [
        "draft",
        "final",
        "paid",
        "part_paid",
        "unpaid",
        "cancelled",
      ];

      if (!allowedStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          message: "Invalid invoice status.",
        });
      }

      filter.status = status;
    }

    const [invoices, total] = await Promise.all([
      Invoice.find(filter)
        .select(
          "invoiceNumber invoiceDate customer.name customer.mobile grandTotal amountPaid balanceDue status paymentMode"
        )
        .sort({ invoiceDate: -1, createdAt: -1, _id: -1 })
        .skip((currentPage - 1) * pageSize)
        .limit(pageSize)
        .lean(),

      Invoice.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      data: invoices,
      pagination: {
        total,
        page: currentPage,
        limit: pageSize,
        totalPages: Math.ceil(total / pageSize),
      },
    });
  } catch (error) {
    console.error("Get invoices error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch invoices.",
    });
  }
};

const getInvoiceById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid invoice ID.",
      });
    }

    const invoice = await Invoice.findById(id).lean();

    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: "Invoice not found.",
      });
    }

    return res.status(200).json({
      success: true,
      data: invoice,
    });
  } catch (error) {
    console.error("Get invoice details error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch invoice details.",
    });
  }
};

exports.getInvoices = getInvoices;
exports.getInvoiceById = getInvoiceById;

