import { Link } from "react-router-dom";
import { ShoppingBag, Star } from "lucide-react";
import { useCart } from "../context/CartContext";

export default function ProductCard({ product }) {
  const { addToCart } = useCart();

  return (
    <article className="product-card">
      <Link to={`/product/${product.id}`} className="product-image-wrap">
        <img src={product.image} alt={product.name} loading="lazy" className="product-image" />
        <span className="badge">{product.badge}</span>
      </Link>
      <div className="product-info">
        <div>
          <p className="category">{product.category}</p>
          <Link to={`/product/${product.id}`}><h3>{product.name}</h3></Link>
        </div>
        <div className="rating"><Star size={14} fill="currentColor" /> {product.rating}</div>
      </div>
      <div className="product-bottom">
        <strong>₹{product.price.toLocaleString("en-IN")}</strong>
        <button onClick={() => addToCart(product)} className="icon-btn" aria-label="Add to cart">
          <ShoppingBag size={18} />
        </button>
      </div>
    </article>
  );
}