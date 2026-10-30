
import { useNavigate } from "react-router-dom";
import TopNavbar from "../components/TopNavbar";
import "../styles/Home.css";

function Home() {
  const navigate = useNavigate();

  const stats = [
    {
      title: "Today's Invoices",
      value: "0",
      description: "Invoices created today",
      icon: "file-text",
    },
    {
      title: "Today's Sales",
      value: "₹0.00",
      description: "Total sales including tax",
      icon: "indian-rupee",
    },
    {
      title: "Litres Sold",
      value: "0 L",
      description: "Total quantity sold today",
      icon: "paint-bucket",
    },
    {
      title: "Draft Invoices",
      value: "0",
      description: "Invoices awaiting finalisation",
      icon: "file-clock",
    },
  ];

  return (
    <div className="staff-dashboard">
      <TopNavbar />

      <main className="dashboard-container">
        {/* Welcome section */}
        <section className="dashboard-welcome">
          <div>
            <p className="dashboard-eyebrow">GAUMAYA PAINTS · STAFF PORTAL</p>
            <h1>Welcome to your Dashboard</h1>
            <p className="dashboard-welcome-text">
              Manage invoices, customers and paint products from one place.
            </p>
          </div>

          <button
            className="new-invoice-button"
            onClick={() => navigate("/invoices/new")}
          >
            <span className="button-plus">+</span>
            New Invoice
          </button>
        </section>

        {/* Summary cards */}
        <section className="dashboard-stats">
          {stats.map((stat) => (
            <article className="stat-card" key={stat.title}>
              <div className="stat-card-top">
                <span className="stat-title">{stat.title}</span>

                <span className="stat-icon" aria-hidden="true">
                  {stat.icon === "file-text" && "▤"}
                  {stat.icon === "indian-rupee" && "₹"}
                  {stat.icon === "paint-bucket" && "▰"}
                  {stat.icon === "file-clock" && "◷"}
                </span>
              </div>

              <h2 className="stat-value">{stat.value}</h2>
              <p className="stat-description">{stat.description}</p>
            </article>
          ))}
        </section>

        {/* Quick actions */}
        <section className="dashboard-section">
          <div className="section-heading">
            <div>
              <h2>Quick Actions</h2>
              <p>Get your daily work done faster.</p>
            </div>
          </div>

          <div className="quick-actions">
            <button
              className="quick-action-card"
              onClick={() => navigate("/invoices/new")}
            >
              <span className="quick-action-icon">＋</span>
              <span className="quick-action-content">
                <strong>Create New Invoice</strong>
                <small>Prepare a GST invoice for a customer.</small>
              </span>
              <span className="quick-action-arrow">→</span>
            </button>

            <button
              className="quick-action-card"
              onClick={() => navigate("/invoices")}
            >
              <span className="quick-action-icon">⌕</span>
              <span className="quick-action-content">
                <strong>Find an Invoice</strong>
                <small>View and search previous invoices.</small>
              </span>
              <span className="quick-action-arrow">→</span>
            </button>

            <button
              className="quick-action-card"
              onClick={() => navigate("/customers")}
            >
              <span className="quick-action-icon">♙</span>
              <span className="quick-action-content">
                <strong>Add a Customer</strong>
                <small>Save customer details for billing.</small>
              </span>
              <span className="quick-action-arrow">→</span>
            </button>
          </div>
        </section>

        {/* Recent invoices */}
        <section className="dashboard-section recent-invoices-section">
          <div className="section-heading">
            <div>
              <h2>Recent Invoices</h2>
              <p>Your latest billing activity will appear here.</p>
            </div>

            <button
              className="view-all-button"
              onClick={() => navigate("/invoices")}
            >
              View All Invoices <span>→</span>
            </button>
          </div>

          <div className="invoice-table-wrapper">
            <table className="invoice-table">
              <thead>
                <tr>
                  <th>Invoice No.</th>
                  <th>Customer</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                <tr>
                  <td colSpan="5" className="empty-invoices">
                    <div className="empty-invoices-icon">▤</div>
                    <strong>No invoices yet</strong>
                    <p>
                      Once you create your first invoice, it will appear here.
                    </p>
                    <button
                      className="empty-state-button"
                      onClick={() => navigate("/invoices/new")}
                    >
                      + Create First Invoice
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <footer className="dashboard-footer">
          <span>Gaumaya Paints Staff Portal</span>
          <span>Billing made simpler.</span>
        </footer>
      </main>
    </div>
  );
}

export default Home;
