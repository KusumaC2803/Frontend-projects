import { useEffect, useMemo, useState } from "react";
import { Search } from "lucide-react";
import ProductCard from "../components/ProductCard";
import { getProducts } from "../api";

export default function Shop() {
  const [products, setProducts] = useState([]);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [maxPrice, setMaxPrice] = useState(3000);
  const [minRating, setMinRating] = useState(0);
  const [sort, setSort] = useState("featured");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Load products from backend
  useEffect(() => {
    async function loadProducts() {
      try {
        setLoading(true);
        const data = await getProducts();
        setProducts(data);
      } catch (err) {
        console.error(err);
        setError("Unable to load products. Please try again.");
      } finally {
        setLoading(false);
      }
    }

    loadProducts();
  }, []);

  // Create categories from backend products
  const categories = useMemo(() => {
    const uniqueCategories = [
      ...new Set(products.map((product) => product.category)),
    ];

    return ["All", ...uniqueCategories];
  }, [products]);

  // Search + filters + sorting
  const filtered = useMemo(() => {
    const result = products.filter(
      (p) =>
        (category === "All" || p.category === category) &&
        p.price <= maxPrice &&
        p.rating >= minRating &&
        `${p.name} ${p.category}`
          .toLowerCase()
          .includes(query.toLowerCase())
    );

    if (sort === "price-low") {
      return [...result].sort((a, b) => a.price - b.price);
    }

    if (sort === "price-high") {
      return [...result].sort((a, b) => b.price - a.price);
    }

    if (sort === "rating") {
      return [...result].sort((a, b) => b.rating - a.rating);
    }

    return result;
  }, [
    products,
    query,
    category,
    maxPrice,
    minRating,
    sort,
  ]);

  // Loading state
  if (loading) {
    return (
      <section className="section shop-page">
        <div className="shop-title">
          <p className="eyebrow">THE COLLECTION</p>
          <h1>Shop all</h1>
        </div>

        <div className="empty-state">
          <h2>Loading products...</h2>
          <p>Fetching the latest collection.</p>
        </div>
      </section>
    );
  }

  // Error state
  if (error) {
    return (
      <section className="section shop-page">
        <div className="shop-title">
          <p className="eyebrow">THE COLLECTION</p>
          <h1>Shop all</h1>
        </div>

        <div className="empty-state">
          <h2>Something went wrong</h2>
          <p>{error}</p>

          <button
            className="chip active"
            onClick={() => window.location.reload()}
          >
            Try again
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="section shop-page">
      <div className="shop-title">
        <p className="eyebrow">THE COLLECTION</p>
        <h1>Shop all</h1>
        <p>{filtered.length} products</p>
      </div>

      <div className="shop-toolbar">
        <div className="search-box">
          <Search size={18} />

          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search products..."
          />
        </div>

        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
        >
          <option value="featured">Sort: Featured</option>
          <option value="price-low">Price: Low to high</option>
          <option value="price-high">Price: High to low</option>
          <option value="rating">Rating</option>
        </select>
      </div>

      <div className="filters">
        <div className="filter-group">
          <strong>Category</strong>

          <div className="chips">
            {categories.map((item) => (
              <button
                key={item}
                className={
                  category === item
                    ? "chip active"
                    : "chip"
                }
                onClick={() => setCategory(item)}
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        <label className="range">
          <strong>
            Max price: ₹
            {maxPrice.toLocaleString("en-IN")}
          </strong>

          <input
            type="range"
            min="500"
            max="3000"
            step="100"
            value={maxPrice}
            onChange={(e) =>
              setMaxPrice(Number(e.target.value))
            }
          />
        </label>

        <label>
          <strong>Rating</strong>

          <select
            value={minRating}
            onChange={(e) =>
              setMinRating(Number(e.target.value))
            }
          >
            <option value="0">All ratings</option>
            <option value="4">4.0+</option>
            <option value="4.5">4.5+</option>
            <option value="4.7">4.7+</option>
          </select>
        </label>
      </div>

      {filtered.length ? (
        <div className="product-grid">
          {filtered.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
            />
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <h2>No products found</h2>
          <p>
            Try changing your filters or search.
          </p>
        </div>
      )}
    </section>
  );
}