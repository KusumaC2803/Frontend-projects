import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";

export default function Success() {
  const { clearCart } = useCart();
  return (
    <section className="section empty-state" onLoad={clearCart}>
      <p className="eyebrow">ORDER CONFIRMED</p>
      <h1>Thank you for your order.</h1>
      <p>Your test checkout was completed successfully.</p>
      <Link to="/shop" className="btn btn-dark">Continue shopping</Link>
    </section>
  );
}