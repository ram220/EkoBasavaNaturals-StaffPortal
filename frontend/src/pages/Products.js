
import { useEffect, useState } from "react";
import TopNavbar from "../components/TopNavbar";
import "../styles/Products.css";
import axios from "axios";

const API_URL = "http://localhost:8000/api/products/get-all-products";

function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    
    const fetchProducts = async () => {
    try {
        const response = await axios.get(API_URL);

        console.log("Products API data:", response.data);

        setProducts(response.data.data || []);
    } catch (err) {
        console.error("Error fetching products:", err.response?.data || err);

        setError(
        "Unable to load products. Please check whether the backend is running."
        );
    } finally {
        setLoading(false);
    }
    };


    fetchProducts();
  }, []);

  return (
    <>
      <TopNavbar />

      <main className="products-page">
        <div className="products-heading">
          <div>
            <p className="products-eyebrow">PRODUCT MANAGEMENT</p>
            <h1>Products</h1>
            <p className="products-description">
              Manage and view your paint product catalogue.
            </p>
          </div>

          <div className="products-count">
            <span>Total Products</span>
            <strong>{products.length}</strong>
          </div>
        </div>

        <section className="products-card">
          <div className="products-card-heading">
            <h2>All Products</h2>
            <span>{products.length} product(s)</span>
          </div>

          {loading ? (
            <div className="products-message">Loading products...</div>
          ) : error ? (
            <div className="products-error">{error}</div>
          ) : products.length === 0 ? (
            <div className="products-message">
              No products found. Add a product through the API first.
            </div>
          ) : (
            <div className="products-table-wrapper">
              <table className="products-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Code</th>
                    <th>Category</th>
                    <th>Pack Size</th>
                    <th>GST</th>
                    <th>MRP</th>
                    <th>Selling Price</th>
                    <th>Status</th>
                  </tr>
                </thead>

                <tbody>
                  {products.map((product) => (
                    <tr key={product._id}>
                      <td>
                        <div className="product-name">
                          {product.name}
                        </div>
                        <div className="product-shade">
                          {product.shade || "No shade specified"}
                        </div>
                      </td>
                      <td>{product.productCode}</td>
                      <td>{product.category}</td>
                      <td>{product.packSize}</td>
                      <td>{product.gstRate}%</td>
                      <td>
                        ₹{Number(product.mrp).toLocaleString("en-IN", {
                          minimumFractionDigits: 2,
                        })}
                      </td>
                      <td className="product-price">
                        ₹{Number(product.sellingPrice).toLocaleString("en-IN", {
                          minimumFractionDigits: 2,
                        })}
                      </td>
                      <td>
                        <span
                          className={`product-status ${
                            product.status === "discontinued"
                              ? "discontinued"
                              : "active"
                          }`}
                        >
                          {product.status || "active"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </>
  );
}

export default Products;
