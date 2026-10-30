import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import TopNavbar from "../components/TopNavbar";
import "../styles/NewInvoice.css";

const PRODUCTS_API = "http://localhost:8000/api/products/get-all-products";
const INVOICES_API = "http://localhost:8000/api/invoices/create-invoice";

const initialCustomer = {
  name: "",
  mobile: "",
  gstin: "",
  address: "",
  state: "Andhra Pradesh",
  customerType: "retail",
};

function NewInvoice() {
  const navigate = useNavigate();

  const [customer, setCustomer] = useState(initialCustomer);
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [items, setItems] = useState([]);
  const [paymentMode, setPaymentMode] = useState("cash");
  const [amountPaid, setAmountPaid] = useState("0");
  const [notes, setNotes] = useState("");
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get(PRODUCTS_API);
        const productData = response.data.data;

        if (!Array.isArray(productData)) {
          throw new Error("Unexpected products API response");
        }

        setProducts(
          productData.filter((product) => product.status === "active")
        );
      } catch (error) {
        console.error("Fetch products error:", error);
        toast.error("Unable to load products. Check the backend.");
      } finally {
        setLoadingProducts(false);
      }
    };

    fetchProducts();
  }, []);

  const filteredProducts = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return products;

    return products.filter((product) =>
      [
        product.productCode,
        product.name,
        product.category,
        product.shade,
        product.packSize,
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(query))
    );
  }, [products, search]);

  const addProduct = (product) => {
    setItems((currentItems) => {
      const existing = currentItems.find(
        (item) => item.productId === product._id
      );

      if (existing) {
        return currentItems.map((item) =>
          item.productId === product._id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }

      return [
        ...currentItems,
        {
          productId: product._id,
          productCode: product.productCode,
          name: product.name,
          packSize: product.packSize,
          sellingPrice: Number(product.sellingPrice),
          gstRate: Number(product.gstRate),
          priceIncludesTax: Boolean(product.priceIncludesTax),
          quantity: 1,
          discount: 0,
        },
      ];
    });

    toast.success(`${product.name} added`);
    setSearch("");
  };

  const updateItem = (productId, field, value) => {
    setItems((currentItems) =>
      currentItems.map((item) => {
        if (item.productId !== productId) return item;

        if (field === "quantity") {
          return { ...item, quantity: Math.max(1, Number(value) || 1) };
        }

        if (field === "discount") {
          return {
            ...item,
            discount: Math.max(0, Number(value) || 0),
          };
        }

        return item;
      })
    );
  };

  const removeItem = (productId) => {
    setItems((currentItems) =>
      currentItems.filter((item) => item.productId !== productId)
    );
  };

  const money = (value) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
    }).format(Number(value) || 0);

  // This is an estimate for the screen only.
  // The backend recalculates all invoice amounts.
  const preview = useMemo(() => {
    let subtotal = 0;
    let discountTotal = 0;
    let estimatedTotal = 0;

    for (const item of items) {
      const lineSubtotal = item.sellingPrice * item.quantity;
      const lineDiscount = item.discount * item.quantity;
      const lineAmount = lineSubtotal - lineDiscount;

      const lineTaxable = item.priceIncludesTax
        ? lineAmount * 100 / (100 + item.gstRate)
        : lineAmount;

      subtotal += lineSubtotal;
      discountTotal += lineDiscount;
      estimatedTotal += item.priceIncludesTax
        ? lineAmount
        : lineTaxable * (1 + item.gstRate / 100);
    }

    return {
      subtotal,
      discountTotal,
      estimatedTotal: Math.round((estimatedTotal + Number.EPSILON) * 100) / 100,
    };
  }, [items]);

  const handleCustomerChange = (event) => {
    const { name, value } = event.target;
    setCustomer((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!customer.name.trim() || !customer.mobile.trim() || !customer.state.trim()) {
      toast.error("Enter customer name, mobile number and state.");
      return;
    }

    if (!/^\d{10}$/.test(customer.mobile.trim())) {
      toast.error("Enter a valid 10-digit mobile number.");
      return;
    }

    if (items.length === 0) {
      toast.error("Add at least one product.");
      return;
    }

    const invalidItem = items.find(
      (item) =>
        !Number.isFinite(item.quantity) ||
        item.quantity <= 0 ||
        !Number.isFinite(item.discount) ||
        item.discount < 0 ||
        item.discount > item.sellingPrice
    );

    if (invalidItem) {
      toast.error(`Check the quantity or discount for ${invalidItem.name}.`);
      return;
    }

    const paid = Number(amountPaid);

    if (!Number.isFinite(paid) || paid < 0) {
      toast.error("Enter a valid amount paid.");
      return;
    }

    const payload = {
      customer: {
        name: customer.name.trim(),
        mobile: customer.mobile.trim(),
        gstin: customer.gstin.trim(),
        address: customer.address.trim(),
        state: customer.state.trim(),
        customerType: customer.customerType,
      },
      items: items.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
        discount: item.discount,
      })),
      paymentMode,
      amountPaid: paid,
      notes: notes.trim(),
    };

    try {
      setSubmitting(true);

      const response = await axios.post(INVOICES_API, payload);

      if (!response.data.success || !response.data.data?._id) {
        throw new Error(
          response.data.message || "Invoice was not returned by the server."
        );
      }

      toast.success("Invoice created successfully!");

      navigate(`/invoices/${response.data.data._id}`);
    } catch (error) {
      console.error(
        "Create invoice error:",
        error.response?.data || error
      );

      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Failed to create invoice."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="new-invoice-page">
      <TopNavbar />

      <main className="new-invoice-container">
        <div className="new-invoice-heading">
          <div>
            <p className="new-invoice-eyebrow">SALES MANAGEMENT</p>
            <h1>Create New Invoice</h1>
            <p>Enter customer details and add products to create a bill.</p>
          </div>

          <button
            type="button"
            className="ni-secondary-btn"
            onClick={() => navigate("/invoices")}
          >
            Back to Invoices
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <section className="ni-card">
            <h2>1. Customer Details</h2>

            <div className="ni-form-grid">
              <label>
                Customer Name *
                <input
                  name="name"
                  value={customer.name}
                  onChange={handleCustomerChange}
                  placeholder="Enter customer name"
                  required
                />
              </label>

              <label>
                Mobile Number *
                <input
                  name="mobile"
                  value={customer.mobile}
                  onChange={handleCustomerChange}
                  placeholder="10-digit mobile number"
                  inputMode="numeric"
                  maxLength={10}
                  required
                />
              </label>

              <label>
                Customer Type
                <select
                  name="customerType"
                  value={customer.customerType}
                  onChange={handleCustomerChange}
                >
                  <option value="retail">Retail</option>
                  <option value="contractor">Contractor</option>
                  <option value="painter">Painter</option>
                  <option value="dealer">Dealer</option>
                  <option value="builder">Builder</option>
                  <option value="institution">Institution</option>
                </select>
              </label>

              <label>
                State *
                <input
                  name="state"
                  value={customer.state}
                  onChange={handleCustomerChange}
                  placeholder="Customer's state"
                  required
                />
              </label>

              <label>
                GSTIN (optional)
                <input
                  name="gstin"
                  value={customer.gstin}
                  onChange={handleCustomerChange}
                  placeholder="Customer GSTIN"
                />
              </label>

              <label className="ni-full-width">
                Billing Address
                <textarea
                  name="address"
                  value={customer.address}
                  onChange={handleCustomerChange}
                  placeholder="Enter billing address"
                  rows={2}
                />
              </label>
            </div>
          </section>

          <section className="ni-card">
            <h2>2. Add Products</h2>

            <label className="ni-search-label">
              Search by product name or code
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Example: GP-EM-001 or Interior Emulsion"
              />
            </label>

            {loadingProducts ? (
              <p className="ni-message">Loading products...</p>
            ) : products.length === 0 ? (
              <p className="ni-message">
                No active products found. Add a product in the Products page first.
              </p>
            ) : (
              <div className="ni-product-results">
                {filteredProducts.length === 0 ? (
                  <p className="ni-message">No matching products.</p>
                ) : (
                  filteredProducts.map((product) => (
                    <div className="ni-product-option" key={product._id}>
                      <div>
                        <strong>{product.name}</strong>
                        <span>
                          {product.productCode} · {product.packSize}
                        </span>
                        <small>
                          GST {product.gstRate}% ·{" "}
                          {product.priceIncludesTax
                            ? "Price includes tax"
                            : "Tax extra"}
                        </small>
                      </div>

                      <div className="ni-product-action">
                        <strong>{money(product.sellingPrice)}</strong>
                        <button
                          type="button"
                          className="ni-add-btn"
                          onClick={() => addProduct(product)}
                        >
                          + Add
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            <h3 className="ni-subheading">Selected Products ({items.length})</h3>

            {items.length === 0 ? (
              <p className="ni-message">
                No products added yet. Search above and click Add.
              </p>
            ) : (
              <div className="ni-selected-products">
                {items.map((item) => (
                  <div className="ni-selected-item" key={item.productId}>
                    <div className="ni-selected-info">
                      <strong>{item.name}</strong>
                      <span>
                        {item.productCode} · {item.packSize}
                      </span>
                      <span>{money(item.sellingPrice)} per unit</span>
                    </div>

                    <label>
                      Quantity
                      <input
                        type="number"
                        min="1"
                        step="1"
                        value={item.quantity}
                        onChange={(event) =>
                          updateItem(
                            item.productId,
                            "quantity",
                            event.target.value
                          )
                        }
                        required
                      />
                    </label>

                    <label>
                      Discount / unit (₹)
                      <input
                        type="number"
                        min="0"
                        max={item.sellingPrice}
                        step="0.01"
                        value={item.discount}
                        onChange={(event) =>
                          updateItem(
                            item.productId,
                            "discount",
                            event.target.value
                          )
                        }
                      />
                    </label>

                    <div className="ni-line-total">
                      <span>Line amount before tax adjustment</span>
                      <strong>
                        {money(
                          (item.sellingPrice - item.discount) * item.quantity
                        )}
                      </strong>
                    </div>

                    <button
                      type="button"
                      className="ni-remove-btn"
                      onClick={() => removeItem(item.productId)}
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className="ni-card">
            <h2>3. Payment Details</h2>

            <div className="ni-form-grid">
              <label>
                Payment Mode *
                <select
                  value={paymentMode}
                  onChange={(event) => setPaymentMode(event.target.value)}
                >
                  <option value="cash">Cash</option>
                  <option value="upi">UPI</option>
                  <option value="card">Card</option>
                  <option value="bank_transfer">Bank Transfer</option>
                  <option value="credit">Credit</option>
                  <option value="other">Other</option>
                </select>
              </label>

              <label>
                Amount Paid (₹) *
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={amountPaid}
                  onChange={(event) => setAmountPaid(event.target.value)}
                  required
                />
              </label>

              <label className="ni-full-width">
                Notes
                <textarea
                  value={notes}
                  onChange={(event) => setNotes(event.target.value)}
                  placeholder="Optional invoice notes"
                  rows={2}
                />
              </label>
            </div>
          </section>

          <section className="ni-total-card">
            <div>
              <span>Subtotal</span>
              <strong>{money(preview.subtotal)}</strong>
            </div>

            <div>
              <span>Discount</span>
              <strong>− {money(preview.discountTotal)}</strong>
            </div>

            <div className="ni-grand-total">
              <span>Estimated Total</span>
              <strong>{money(preview.estimatedTotal)}</strong>
            </div>

            <p>
              This is an estimate. The server calculates the saved invoice
              totals. Verify GST settings before issuing real tax invoices.
            </p>

            <button
              type="submit"
              className="ni-submit-btn"
              disabled={submitting || loadingProducts || items.length === 0}
            >
              {submitting ? "Creating Invoice..." : "Create Invoice"}
            </button>
          </section>
        </form>
      </main>
    </div>
  );
}

export default NewInvoice;