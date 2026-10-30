
const Product = require("../models/productModel");

// Add a new product
exports.createProduct = async (req, res) => {
  try {
    const {
      productCode,
      barcode,
      name,
      category,
      shade,
      packSize,
      hsnCode,
      gstRate,
      mrp,
      sellingPrice,
      priceIncludesTax,
      dealerPrice,
      painterPrice,
      minimumPrice,
    } = req.body;

    const existingProduct = await Product.findOne({
      productCode: productCode?.trim().toUpperCase(),
    });

    if (existingProduct) {
      return res.status(409).json({
        success: false,
        message: "Product code already exists",
      });
    }

    const product = await Product.create({
      productCode,
      barcode,
      name,
      category,
      shade,
      packSize,
      hsnCode,
      gstRate,
      mrp,
      sellingPrice,
      priceIncludesTax,
      dealerPrice,
      painterPrice,
      minimumPrice,
    });

    return res.status(201).json({
      success: true,
      message: "Product created successfully",
      data: product,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to create product",
      error: error.message,
    });
  }
};

// Get all products, with optional search and status filter
exports.getProducts = async (req, res) => {
  try {
    const { search, status } = req.query;
    const filter = {};

    if (status) {
      filter.status = status;
    }

    if (search?.trim()) {
      const keyword = search.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      filter.$or = [
        { productCode: { $regex: keyword, $options: "i" } },
        { name: { $regex: keyword, $options: "i" } },
        { category: { $regex: keyword, $options: "i" } },
        { shade: { $regex: keyword, $options: "i" } },
      ];
    }

    const products = await Product.find(filter).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: products.length,
      data: products,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch products",
      error: error.message,
    });
  }
};

// Get one product by MongoDB ID
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: product,
    });
  } catch (error) {
    const invalidId = error.name === "CastError";

    return res.status(invalidId ? 400 : 500).json({
      success: false,
      message: invalidId ? "Invalid product ID" : "Failed to fetch product",
    });
  }
};

// Update a product
exports.updateProduct = async (req, res) => {
  try {
    const allowedFields = [
      "productCode",
      "barcode",
      "name",
      "category",
      "shade",
      "packSize",
      "hsnCode",
      "gstRate",
      "mrp",
      "sellingPrice",
      "priceIncludesTax",
      "dealerPrice",
      "painterPrice",
      "minimumPrice",
      "status",
    ];

    const updates = {};

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updates[field] =
          field === "productCode" && typeof req.body[field] === "string"
            ? req.body[field].trim().toUpperCase()
            : req.body[field];
      }
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        success: false,
        message: "No valid fields provided for update",
      });
    }

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      updates,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Product updated successfully",
      data: product,
    });
  } catch (error) {
    const duplicateCode = error.code === 11000;
    const invalidId = error.name === "CastError";

    return res.status(duplicateCode ? 409 : invalidId ? 400 : 500).json({
      success: false,
      message: duplicateCode
        ? "Product code already exists"
        : invalidId
        ? "Invalid product ID"
        : "Failed to update product",
    });
  }
};

// Deactivate a product instead of deleting it
exports.deactivateProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { status: "discontinued" },
      { new: true, runValidators: true }
    );

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Product discontinued successfully",
      data: product,
    });
  } catch (error) {
    const invalidId = error.name === "CastError";

    return res.status(invalidId ? 400 : 500).json({
      success: false,
      message: invalidId
        ? "Invalid product ID"
        : "Failed to discontinue product",
    });
  }
};
