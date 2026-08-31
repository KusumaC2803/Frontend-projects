import { Link } from "react-router-dom";
import { Minus, Plus, Trash2 } from "lucide-react";
import { useCart } from "../context/CartContext";

export default function Cart() {
  const { cart, subtotal, shipping, total, updateQuantity, removeFromCart } = useCart();

  if (!cart.length) return <section className="section empty-state"><p className="eyebrow">YOUR BAG</p><h1>Your cart is empty.</h1><p>Add something you love.</p><Link to="/shop" className="btn btn-dark">Continue shopping</Link></section>;

  return (
    <section className="section cart-page">
      <div>
        <p className="eyebrow">YOUR BAG</p>
        <h1>Shopping cart</h1>
        <div className="cart-items">
          {cart.map(item => (
            <div className="cart-item" key={`${item.id}-${item.size}`}>
              <img src={item.image} alt={item.name} />
              <div className="cart-item-info">
                <p className="category">{item.category} · Size {item.size}</p>
                <h3>{item.name}</h3>
                <strong>₹{item.price.toLocaleString("en-IN")}</strong>
                <div className="qty">
                  <button onClick={() => updateQuantity(item.id, item.size, item.quantity - 1)}><Minus size={14}/></button>
                  <span>{item.quantity}</span>
                  <button onClick={() => updateQuantity(item.id, item.size, item.quantity + 1)}><Plus size={14}/></button>
                </div>
              </div>
              <button className="remove" onClick={() => removeFromCart(item.id, item.size)}><Trash2 size={18}/></button>
            </div>
          ))}
        </div>
      </div>
      <aside className="summary">
        <h2>Summary</h2>
        <div><span>Subtotal</span><strong>₹{subtotal.toLocaleString("en-IN")}</strong></div>
        <div><span>Shipping</span><strong>{shipping ? `₹${shipping}` : "Free"}</strong></div>
        <hr />
        <div className="total"><span>Total</span><strong>₹{total.toLocaleString("en-IN")}</strong></div>
        <Link to="/checkout" className="btn btn-dark full">Checkout</Link>
      </aside>
    </section>
  );
}