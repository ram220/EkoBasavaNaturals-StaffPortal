
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";

import Login from "./pages/Login";
import Signup from "./pages/SignUp";
import Home from "./pages/Home";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Products from "./pages/Products";
import Invoices from "./pages/Invoices";
import NewInvoice from "./pages/NewInvoice";
import InvoiceDetails from "./pages/InvoiceDetails";
import ProtectedRoute from "./components/ProtectedRoutes";

function PlaceholderPage({ title }) {
  return (
    <div style={{ padding: "40px", fontFamily: "Arial, sans-serif" }}>
      <h2>{title}</h2>
      <p>This page will be developed in the next steps.</p>
    </div>
  );
}

function App() {
  return (
    <div className="App">
      <Toaster position="top-center" />

      <BrowserRouter>
        <Routes>

            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />

          <Route element={<ProtectedRoute/>}>
            <Route path="/" element={<Home />} />

            <Route
              path="/invoices/new"
              element={<NewInvoice />}
            />
            <Route
              path="/invoices"
              element={<Invoices/>}
            />

            <Route
              path="/invoices/:id"
              element={<InvoiceDetails/>}
            />

            <Route
              path="/products"
              element={<Products/>}
            />
            <Route
              path="/customers"
              element={<PlaceholderPage title="Customers" />}
            />
            <Route
              path="/reports"
              element={<PlaceholderPage title="Reports" />}
            />
            <Route
              path="/settings"
              element={<PlaceholderPage title="Settings" />}
            />
          </Route>
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
