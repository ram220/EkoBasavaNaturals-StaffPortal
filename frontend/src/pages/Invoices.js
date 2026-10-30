
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import TopNavbar from "../components/TopNavbar";
import "../styles/Invoices.css";

const liveUrl="https://ekobasavanaturals-staffportal-1.onrender.com";
//const baseUrl="http://localhost:8000";

const API_URL = `${liveUrl}/api/invoices/get-invoice`;


function Invoices() {
  const navigate = useNavigate();

  const [invoices, setInvoices] = useState([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    total: 0,
    totalPages: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    const fetchInvoices = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await axios.get(API_URL, {
          params: {
            search: search.trim(),
            status,
            page,
            limit: 10,
          },
          signal: controller.signal,
        });
        console.log(response);

        setInvoices(response.data.data || []);
        setPagination(
          response.data.pagination || { total: 0, totalPages: 0 }
        );
      } catch (err) {
        if (err.code === "ERR_CANCELED") return;

        console.error(
          "Error fetching invoices:",
          err.response?.data || err
        );

        setError(
          "Unable to load invoices. Check whether the backend is running."
        );
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    fetchInvoices();

    return () => controller.abort();
  }, [search, status, page]);

  const formatCurrency = (amount) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
    }).format(amount || 0);

  const formatDate = (date) =>
    new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      timeZone: "Asia/Kolkata",
    });

  const formatStatus = (value) =>
    (value || "").replace("_", " ").replace(/\b\w/g, (char) =>
      char.toUpperCase()
    );

  return (
    <div className="invoices-page">
      <TopNavbar />

      <main className="invoices-container">
        <div className="invoices-heading">
          <div>
            <p className="invoices-eyebrow">SALES MANAGEMENT</p>
            <h1>Invoices</h1>
            <p className="invoices-subtitle">
              Find customer bills and review purchase details.
            </p>
          </div>

          <button
            className="invoice-primary-btn"
            onClick={() => navigate("/invoices/new")}
          >
            + New Invoice
          </button>
        </div>

        <section className="invoice-summary">
          <div className="invoice-summary-card">
            <span>Total matching invoices</span>
            <strong>{pagination.total}</strong>
          </div>
        </section>

        <section className="invoice-list-card">
          <div className="invoice-filters">
            <input
              type="search"
              placeholder="Search invoice number, customer or mobile..."
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
              }}
            />

            <select
              value={status}
              onChange={(event) => {
                setStatus(event.target.value);
                setPage(1);
              }}
            >
              <option value="">All statuses</option>
              <option value="draft">Draft</option>
              <option value="final">Final</option>
              <option value="paid">Paid</option>
              <option value="part_paid">Part paid</option>
              <option value="unpaid">Unpaid</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          {loading ? (
            <div className="invoice-message">Loading invoices...</div>
          ) : error ? (
            <div className="invoice-message invoice-error">{error}</div>
          ) : invoices.length === 0 ? (
            <div className="invoice-empty">
              <div className="invoice-empty-icon">▤</div>
              <h3>No invoices found</h3>
              <p>
                Invoices will appear here after you create them.
                Try changing your search or status filter.
              </p>
              <button
                className="invoice-primary-btn"
                onClick={() => navigate("/invoices/new")}
              >
                Create your first invoice
              </button>
            </div>
          ) : (
            <>
              <div className="invoice-table-wrapper">
                <table className="invoice-table">
                  <thead>
                    <tr>
                      <th>Invoice</th>
                      <th>Date</th>
                      <th>Customer</th>
                      <th>Total</th>
                      <th>Balance</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>

                  <tbody>
                    {invoices.map((invoice) => (
                      <tr key={invoice._id}>
                        <td className="invoice-number">
                          {invoice.invoiceNumber || "Draft / Unnumbered"}
                        </td>
                        <td>{formatDate(invoice.invoiceDate)}</td>
                        <td>
                          <strong>{invoice.customer?.name}</strong>
                          <span className="invoice-customer-mobile">
                            {invoice.customer?.mobile}
                          </span>
                        </td>
                        <td className="invoice-amount">
                          {formatCurrency(invoice.grandTotal)}
                        </td>
                        <td>{formatCurrency(invoice.balanceDue)}</td>
                        <td>
                          <span
                            className={`invoice-status status-${invoice.status}`}
                          >
                            {formatStatus(invoice.status)}
                          </span>
                        </td>
                        <td>
                          <button
                            className="invoice-view-btn"
                            onClick={() =>
                              navigate(`/invoices/${invoice._id}`)
                            }
                          >
                            View Details
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="invoice-pagination">
                <span>
                  Page {page} of {Math.max(1, pagination.totalPages)}
                </span>

                <div>
                  <button
                    disabled={page <= 1}
                    onClick={() => setPage((current) => current - 1)}
                  >
                    Previous
                  </button>
                  <button
                    disabled={page >= pagination.totalPages}
                    onClick={() => setPage((current) => current + 1)}
                  >
                    Next
                  </button>
                </div>
              </div>
            </>
          )}
        </section>
      </main>
    </div>
  );
}

export default Invoices;
