import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Star } from "lucide-react";
import { getProduct } from "../data/products";
import { useCart } from "../context/CartContext";

export default function ProductDetails() {
  const { id } = useParams();
  const product = getProduct(id);
  const { addToCart } = useCart();
  const [size, setSize] = useState("M");
  const [added, setAdded] = useState(false);

  if (!product) return <section className="section empty-state"><h1>Product not found</h1><Link to="/shop" className="btn btn-dark">Back to shop</Link></section>;

  function handleAdd() {
    addToCart(product, size);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  }

  return (
    <section className="section detail">
      <div className="detail-image"><img src={product.image} alt={product.name} /></div>
      <div className="detail-copy">
        <p className="category">{product.category}</p>
        <h1>{product.name}</h1>
        <div className="rating"><Star size={16} fill="currentColor" /> {product.rating} · 120+ reviews</div>
        <h2>₹{product.price.toLocaleString("en-IN")}</h2>
        <p className="muted">A versatile everyday piece with a relaxed silhouette. Pair it with your favourite denim, cargos or sneakers.</p>
        <div className="size-picker">
          <strong>Size</strong>
          <div>{["S","M","L","XL"].map(s => <button key={s} className={size === s ? "size active" : "size"} onClick={() => setSize(s)}>{s}</button>)}</div>
        </div>
        <button onClick={handleAdd} className="btn btn-dark full">{added ? "Added to cart ✓" : "Add to cart"}</button>
        <ul className="feature-list"><li>Free shipping over ₹2,500</li><li>Easy 7-day returns</li><li>Secure checkout</li></ul>
      </div>
    </section>
  );
}