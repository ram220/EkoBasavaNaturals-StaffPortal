import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import TopNavbar from "../components/TopNavbar";
import "../styles/InvoiceDetails.css";

const liveUrl="https://ekobasavanaturals-staffportal-1.onrender.com";
//const baseUrl="http://localhost:8000";

const API_URL = `${liveUrl}/api/invoices/get-invoice`;

function InvoiceDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    const fetchInvoice = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await axios.get(`${API_URL}/${id}`, {
          signal: controller.signal,
        });

        if (!response.data.success || !response.data.data) {
          throw new Error("Invoice details were not returned.");
        }

        setInvoice(response.data.data);
      } catch (err) {
        if (err.code === "ERR_CANCELED") return;

        console.error(
          "Fetch invoice details error:",
          err.response?.data || err
        );

        setError(
          err.response?.data?.message || "Unable to load invoice details."
        );
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };

    fetchInvoice();

    return () => controller.abort();
  }, [id]);

  const money = (value) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
    }).format(Number(value) || 0);

  const date = (value) => {
    if (!value) return "—";

    return new Date(value).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      timeZone: "Asia/Kolkata",
    });
  };

  const formatStatus = (value = "") =>
    value.replaceAll("_", " ").replace(/\b\w/g, (letter) =>
      letter.toUpperCase()
    );

  if (loading) {
    return (
      <div className="invoice-details-page">
        <TopNavbar />
        <main className="id-container">
          <div className="id-message">Loading invoice details...</div>
        </main>
      </div>
    );
  }

  if (error || !invoice) {
    return (
      <div className="invoice-details-page">
        <TopNavbar />
        <main className="id-container">
          <div className="id-error">
            <h2>Unable to open invoice</h2>
            <p>{error || "Invoice not found."}</p>
            <button onClick={() => navigate("/invoices")}>
              Back to Invoices
            </button>
          </div>
        </main>
      </div>
    );
  }

  const customer = invoice.customer || {};
  const items = invoice.items || [];

  return (
    <div className="invoice-details-page">
      <TopNavbar />

      <main className="id-container">
        <div className="id-toolbar no-print">
          <button
            className="id-back-btn"
            onClick={() => navigate("/invoices")}
          >
            ← Back to Invoices
          </button>

          <button className="id-print-btn" onClick={() => window.print()}>
            Print Invoice
          </button>
        </div>

        <section className="id-invoice-sheet">
          <header className="id-invoice-header">
            <div>
              <p className="id-eyebrow">GAUMAYA PAINTS</p>
              <h1>Tax Invoice</h1>
              <p className="id-muted">Staff Billing Portal</p>
            </div>

            <div className="id-invoice-meta">
              <span>Invoice Number</span>
              <strong>{invoice.invoiceNumber || "Draft / Unnumbered"}</strong>
              <span>Invoice Date</span>
              <strong>{date(invoice.invoiceDate || invoice.createdAt)}</strong>
              <span>Status</span>
              <strong>
                <span
                  className={`id-status id-status-${invoice.status || "draft"}`}
                >
                  {formatStatus(invoice.status || "draft")}
                </span>
              </strong>
            </div>
          </header>

          <div className="id-divider" />

          <section className="id-customer-section">
            <div>
              <h2>Bill To</h2>
              <strong className="id-customer-name">
                {customer.name || "—"}
              </strong>
              <p>Mobile: {customer.mobile || "—"}</p>
              {customer.address && <p>{customer.address}</p>}
              <p>State: {customer.state || "—"}</p>
              {customer.gstin && <p>GSTIN: {customer.gstin}</p>}
              {customer.customerType && (
                <p>Customer Type: {formatStatus(customer.customerType)}</p>
              )}
            </div>

            <div className="id-payment-info">
              <h2>Payment Information</h2>
              <p>
                <span>Payment Mode</span>
                <strong>{formatStatus(invoice.paymentMode || "—")}</strong>
              </p>
              <p>
                <span>Amount Paid</span>
                <strong>{money(invoice.amountPaid)}</strong>
              </p>
              <p>
                <span>Balance Due</span>
                <strong>{money(invoice.balanceDue)}</strong>
              </p>
            </div>
          </section>

          <section className="id-items-section">
            <h2>Invoice Items</h2>

            <div className="id-table-wrapper">
              <table className="id-items-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Product</th>
                    <th>HSN</th>
                    <th>Qty</th>
                    <th>Rate</th>
                    <th>Discount</th>
                    <th>GST %</th>
                    <th>Taxable Value</th>
                    <th>Total</th>
                  </tr>
                </thead>

                <tbody>
                  {items.map((item, index) => (
                    <tr key={item._id || `${item.productCode}-${index}`}>
                      <td>{index + 1}</td>
                      <td>
                        <strong>{item.productName || "Product"}</strong>
                        <span className="id-product-code">
                          {item.productCode || "—"} · {item.packSize || ""}
                        </span>
                      </td>
                      <td>{item.hsnCode || "—"}</td>
                      <td>{item.quantity}</td>
                      <td>{money(item.unitPrice)}</td>
                      <td>{money(Number(item.discount || 0) * Number(item.quantity || 0))}</td>
                      <td>{Number(item.gstRate || 0)}%</td>
                      <td>{money(item.taxableValue)}</td>
                      <td className="id-cell-total">{money(item.total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="id-bottom-grid">
            <div className="id-notes">
              <h2>Notes</h2>
              <p>{invoice.notes || "Thank you for your business."}</p>
            </div>

            <div className="id-totals">
              <p>
                <span>Subtotal</span>
                <strong>{money(invoice.subtotal)}</strong>
              </p>
              <p>
                <span>Discount</span>
                <strong>− {money(invoice.discountTotal)}</strong>
              </p>
              <p>
                <span>Taxable Value</span>
                <strong>{money(invoice.taxableValue)}</strong>
              </p>
              <p>
                <span>CGST</span>
                <strong>{money(invoice.cgst)}</strong>
              </p>
              <p>
                <span>SGST</span>
                <strong>{money(invoice.sgst)}</strong>
              </p>
              <p>
                <span>IGST</span>
                <strong>{money(invoice.igst)}</strong>
              </p>
              <p className="id-grand-total">
                <span>Grand Total</span>
                <strong>{money(invoice.grandTotal)}</strong>
              </p>
            </div>
          </section>

          <footer className="id-invoice-footer">
            <p>This invoice was generated by the Gaumaya Paints staff portal.</p>
            <p>Please verify invoice and tax details before issuing.</p>
          </footer>
        </section>
      </main>
    </div>
  );
}

export default InvoiceDetails;