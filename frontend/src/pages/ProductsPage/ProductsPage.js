import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar/Navbar";
import Footer from "../../components/Footer/Footer";
import "./ProductsPage.css";

function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [user, setUser] = useState(null);

  const [showConfirm, setShowConfirm] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const [showStockModal, setShowStockModal] = useState(false);
  const [showStockConfirm, setShowStockConfirm] = useState(false);
  const [stockProduct, setStockProduct] = useState(null);
  const [stockValue, setStockValue] = useState(0);
  const [priceValue, setPriceValue] = useState(0);

  const [searchType, setSearchType] = useState("all");
  const [searchInput, setSearchInput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const [categoryFilter, setCategoryFilter] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [stockFilter, setStockFilter] = useState("");

  const [sortType, setSortType] = useState("");

  const navigate = useNavigate();

  const fetchProducts = useCallback(async (currentUser) => {
    const response = await fetch(
      `${process.env.REACT_APP_API_URL}/get_products.php`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role: currentUser?.role || "",
          owner_id: currentUser?.reference_id || 0
        })
      }
    );

    const data = await response.json();

    if (data.success) {
      setProducts(data.products);
    } else {
      setProducts([]);
    }
  }, []);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const parsedUser = storedUser ? JSON.parse(storedUser) : null;

    setUser(parsedUser);
    fetchProducts(parsedUser);

    fetch(`${process.env.REACT_APP_API_URL}/get_categories.php`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setCategories(data.categories);
        }
      });
  }, [fetchProducts]);

  const openDeleteConfirm = (product) => {
    setSelectedProduct(product);
    setShowConfirm(true);
  };

  const openStockManager = (product) => {
  setStockProduct(product);
  setStockValue(product.stock_quantity);
  setPriceValue(parseFloat(product.price));
  setShowStockModal(true);
};

const increaseStock = () => {
  setStockValue((prev) => (prev === "" ? 1 : prev + 1));
};

const decreaseStock = () => {
  setStockValue((prev) => {
    if (prev === "" || prev <= 0) return 0;
    return prev - 1;
  });
};

const confirmStockUpdate = () => {
  let finalStock = stockValue === "" ? 0 : stockValue;
  let finalPrice = priceValue === "" ? 0 : priceValue;
  setStockValue(finalStock);
  setPriceValue(finalPrice);
  setShowStockConfirm(true);

};

const updateStock = async () => {

  const response = await fetch(
    `${process.env.REACT_APP_API_URL}/update_stock.php`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        product_id: stockProduct.product_id,
        stock_quantity: stockValue === "" ? 0 : parseInt(stockValue),
        price: priceValue === "" ? 0 : parseFloat(priceValue),
        role: user.role,
        owner_id: user.reference_id
      })
    }
  );

  const data = await response.json();

  if (data.success) {
    await fetchProducts(user);
    setShowStockConfirm(false);
    setShowStockModal(false);
    setStockProduct(null);

  }

};

  const handleDeleteConfirm = async () => {
    if (!selectedProduct || !user) return;

    const response = await fetch(
      `${process.env.REACT_APP_API_URL}/delete_product.php`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          product_id: selectedProduct.product_id,
          role: user.role,
          owner_id: user.reference_id
        })
      }
    );

    const data = await response.json();

    if (data.success) {
      await fetchProducts(user);
    }

    setShowConfirm(false);
    setSelectedProduct(null);
  };

  const handleBuy = (product) => {
    navigate("/place-order", { state: { product } });
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setSearchTerm(searchInput.trim().toLowerCase());
    setSuggestions([]);
    setShowSuggestions(false);
  };

  useEffect(() => {
    const text = searchInput.toLowerCase().trim();

    setSearchTerm(text);

    if (text === "" || searchType === "all") {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    let results = [];

    if (searchType === "name") {
      results = products
        .filter((p) => p.name.toLowerCase().startsWith(text))
        .map((p) => p.name);
    }

    if (searchType === "brand") {
      results = products
        .filter((p) => (p.brand || "").toLowerCase().startsWith(text))
        .map((p) => p.brand);
    }

    if (searchType === "category") {
      results = products
        .filter((p) => (p.category_name || "").toLowerCase().startsWith(text))
        .map((p) => p.category_name);
    }

    const unique = [...new Set(results)].filter(Boolean).slice(0, 5);

    setSuggestions(unique);
  }, [searchInput, searchType, products]);

  const selectSuggestion = (value) => {
    setSearchInput(value);
    setSearchTerm(value.toLowerCase());
    setSuggestions([]);
    setShowSuggestions(false);
  };

  const searchPlaceholder = useMemo(() => {
    if (searchType === "name") return "Search product name";
    if (searchType === "brand") return "Search brand";
    if (searchType === "category") return "Search category";
    return "Select search type first";
  }, [searchType]);

  const filteredProducts = products
    .filter((product) => {
      const text = searchTerm.toLowerCase().trim();
      let matchSearch = true;

      if (text !== "") {
        if (searchType === "all") {
          matchSearch = false;
        } else if (searchType === "name") {
          matchSearch = product.name.toLowerCase().startsWith(text);
        } else if (searchType === "brand") {
          matchSearch = (product.brand || "").toLowerCase().startsWith(text);
        } else if (searchType === "category") {
          matchSearch = (product.category_name || "")
            .toLowerCase()
            .startsWith(text);
        }
      }

      const matchCategory =
        categoryFilter === "" ||
        String(product.category_id) === String(categoryFilter);

      const price = parseFloat(product.price);

      const matchMinPrice =
        minPrice === "" || price >= parseFloat(minPrice);

      const matchMaxPrice =
        maxPrice === "" || price <= parseFloat(maxPrice);

      const matchStock =
        stockFilter === "" ||
        (stockFilter === "in" && product.stock_quantity > 0) ||
        (stockFilter === "out" && product.stock_quantity === 0);

      return (
        matchSearch &&
        matchCategory &&
        matchMinPrice &&
        matchMaxPrice &&
        matchStock
      );
    })
    .sort((a, b) => {
      const priceA = parseFloat(a.price);
      const priceB = parseFloat(b.price);

      if (sortType === "low") return priceA - priceB;
      if (sortType === "high") return priceB - priceA;
      return 0;
    });

  const getEmptyMessage = () => {
    if (searchType === "all" && searchTerm !== "") {
      return "Please select a search type to start searching.";
    }

    if (searchTerm !== "") {
      if (searchType === "name") {
        return `No products found by product name "${searchTerm}".`;
      }
      if (searchType === "brand") {
        return `No products found by brand "${searchTerm}".`;
      }
      if (searchType === "category") {
        return `No products found by category "${searchTerm}".`;
      }
    }

    if (minPrice !== "" && maxPrice !== "") {
      return `No products found between BDT ${minPrice} and BDT ${maxPrice}.`;
    }

    if (minPrice !== "") {
      return `No products found from BDT ${minPrice} and above.`;
    }

    if (maxPrice !== "") {
      return `No products found up to BDT ${maxPrice}.`;
    }

    if (stockFilter === "in") {
      return "No product is currently in stock.";
    }

    if (stockFilter === "out") {
      return "No product is currently out of stock.";
    }

    if (categoryFilter !== "") {
      const selectedCategory = categories.find(
        (c) => String(c.category_id) === String(categoryFilter)
      );
      return selectedCategory
        ? `No products found in category "${selectedCategory.category_name}".`
        : "No products found in the selected category.";
    }

    if (sortType === "low") {
      return "No products available to sort by low to high price.";
    }

    if (sortType === "high") {
      return "No products available to sort by high to low price.";
    }

    if (user?.role === "owner") {
      return "No products added yet. Start by adding a product.";
    }

    if (user?.role === "customer") {
      return "No products available in the store.";
    }

    if (user?.role === "salesman") {
      return "No products currently available.";
    }

    return "No products available.";
  };

  return (
    <div className="app-wrapper">
      <Navbar />

      <div className="content-wrapper">
        <div className="products-container">
          <h2>Products</h2>

          {user?.role === "owner" && (
            <button
              className="add-product-btn"
              onClick={() => navigate("/add-product")}
            >
              Add Product
            </button>
          )}

          <div className="controls-wrapper">
            <div className="search-section">
              <h3>Search</h3>

              <form className="search-form" onSubmit={handleSearchSubmit}>
                <select
                  value={searchType}
                  onChange={(e) => {
                    const value = e.target.value;
                    setSearchType(value);

                    if (searchInput.trim() === "" || value === "all") {
                      setShowSuggestions(false);
                      setSuggestions([]);
                    } else {
                      setShowSuggestions(true);
                    }
                  }}
                >
                  <option value="all">All</option>
                  <option value="name">Product Name</option>
                  <option value="brand">Brand</option>
                  <option value="category">Category</option>
                </select>

                <div className="search-wrapper">
                  <input
                    type="text"
                    placeholder={searchPlaceholder}
                    value={searchInput}
                    onChange={(e) => {
                      const value = e.target.value;
                      setSearchInput(value);

                      if (value.trim() === "" || searchType === "all") {
                        setShowSuggestions(false);
                      } else {
                        setShowSuggestions(true);
                      }
                    }}
                    onBlur={() => setShowSuggestions(false)}
                  />

                  {showSuggestions && suggestions.length > 0 && (
                    <div className="suggestion-box">
                      {suggestions.map((item, index) => (
                        <div
                          key={index}
                          className="suggestion-item"
                          onMouseDown={(e) => {
                            e.preventDefault();
                            selectSuggestion(item);
                          }}
                        >
                          {item}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  className="search-btn"
                  onClick={() => setShowSuggestions(false)}
                >
                  🔍
                </button>
              </form>
            </div>

            <div className="filter-section">
              <h3>Filter</h3>

              <div className="filter-grid">
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                >
                  <option value="">All Categories</option>
                  {categories.map((cat) => (
                    <option key={cat.category_id} value={cat.category_id}>
                      {cat.category_name}
                    </option>
                  ))}
                </select>

                <input
                  type="number"
                  placeholder="Min Price"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                />

                <input
                  type="number"
                  placeholder="Max Price"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                />

                <select
                  value={stockFilter}
                  onChange={(e) => setStockFilter(e.target.value)}
                >
                  <option value="">All Stock</option>
                  <option value="in">In Stock</option>
                  <option value="out">Out Of Stock</option>
                </select>
              </div>
            </div>

            <div className="sort-section">
              <h3>Sort</h3>

              <div className="sort-buttons">
                <button
                  className={sortType === "low" ? "active-sort" : ""}
                  onClick={() => setSortType("low")}
                >
                  Price Low → High
                </button>

                <button
                  className={sortType === "high" ? "active-sort" : ""}
                  onClick={() => setSortType("high")}
                >
                  Price High → Low
                </button>

                <button
                  className={sortType === "" ? "active-sort" : ""}
                  onClick={() => setSortType("")}
                >
                  Clear Sort
                </button>
              </div>
            </div>
          </div>

          <div className="products-grid">
            {filteredProducts.length === 0 ? (
              <div className="no-products">{getEmptyMessage()}</div>
            ) : (
              filteredProducts.map((product) => (
                <div className="product-card" key={product.product_id}>
                  <div>
                    <h3>{product.name}</h3>
                    <p><strong>{product.description}</strong></p>
                    <p>
                      <strong>Brand: {product.brand || "N/A"}</strong> 
                    </p>
                    <p>
                      <strong>Category: {product.category_name || "N/A"}</strong> 
                    </p>
                    <p className="price">
                      <strong>Price:</strong> BDT {Number(product.price).toFixed(2)}
                    </p>
                    <p
                      className={`stock ${
                        product.stock_quantity > 0 ? "in-stock" : "out-stock"
                      }`}
                    >
                      {product.stock_quantity > 0
                        ? `In Stock (${product.stock_quantity})`
                        : "Out of Stock"}
                    </p>
                  </div>

                  <div className="card-actions">
                    {user?.role === "customer" &&
                      product.stock_quantity > 0 && (
                        <button
                          className="buy-btn"
                          onClick={() => handleBuy(product)}
                        >
                          Buy
                        </button>
                      )}

                    {user?.role === "owner" && (
  <>
                        <button
                          className="stock-btn"
                          onClick={() => openStockManager(product)}
                        >
                          Manage Stock
                        </button>

                        <button
                          className="delete-btn"
                          onClick={() => openDeleteConfirm(product)}
                        >
                          Delete
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {showConfirm && (
        <div className="confirm-overlay">
          <div className="confirm-box">
            <h3>Confirm Delete</h3>

            <p>
              Are you sure you want to delete
              <strong> {selectedProduct?.name}</strong> ?
            </p>

            <div className="confirm-actions">
              <button
                className="cancel-btn"
                onClick={() => setShowConfirm(false)}
              >
                Cancel
              </button>

              <button
                className="confirm-logout-btn"
                onClick={handleDeleteConfirm}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

          {showStockModal && (
              <div className="confirm-overlay">
                <div className="confirm-box">

                  <h3>Manage Product</h3>

                  <p>
                     <strong>Product: {stockProduct?.name}</strong>
                  </p>

                  <p><strong>Stock Quantity</strong></p>

                  <div className="stock-control">
                    <button onClick={decreaseStock}>-</button>

                    <input
                      type="number"
                      value={stockValue}
                      onChange={(e) => {
                        const value = e.target.value;

                        if (value === "") {
                          setStockValue("");
                        } else {
                          setStockValue(Math.max(0, parseInt(value)));
                        }
                      }}
                    />

                    <button onClick={increaseStock}>+</button>
                  </div>

                  <p><strong>Price (BDT)</strong></p>

                    <input
                      className="price-input"
                      type="number"
                      value={priceValue}
                      onChange={(e) => {
                        const value = e.target.value;

                        if (value === "") {
                          setPriceValue("");
                        } else {
                          setPriceValue(Math.max(0, parseFloat(value)));
                        }
                      }}
                    />

                  <div className="confirm-actions">

                    <button
                      onClick={() => {
                        setShowStockModal(false);
                        setStockProduct(null);
                      }}
                    >
                      Cancel
                    </button>

                    <button onClick={confirmStockUpdate}>
                      Update Product
                    </button>

                  </div>

                </div>
              </div>
            )}

              {showStockConfirm && (
                <div className="confirm-overlay">
                  <div className="confirm-box">

                    <h3>Confirm Product Update</h3>

                    <p>
                      Update <strong>{stockProduct?.name}</strong> with:
                    </p>

                    <p>
                      Stock Quantity: <strong>{stockValue}</strong>
                    </p>

                    <p>
                      Price: <strong>BDT {priceValue}</strong>
                    </p>

                    <div className="confirm-actions">
                      <button onClick={() => setShowStockConfirm(false)}>
                        Cancel
                      </button>

                      <button onClick={updateStock}>
                        Confirm
                      </button>
                    </div>

                  </div>
                </div>
              )}

      <Footer />
    </div>
  );
}

export default ProductsPage; 