import { Link, NavLink } from "react-router-dom";
import { Search, ShoppingBag } from "lucide-react";
import { useCart } from "../context/CartContext";

export default function Navbar() {
  const { count } = useCart();

  return (
    <header className="navbar">
      <Link to="/" className="logo">THRIFT<span>FLIP</span></Link>
      <nav>
        <NavLink to="/">Home</NavLink>
        <NavLink to="/shop">Shop</NavLink>
        <Link to="/orders">Orders</Link>
      </nav>
      <div className="nav-actions">
        <Link to="/shop" aria-label="Search"><Search size={20} /></Link>
        <Link to="/cart" className="cart-link" aria-label="Cart">
          <ShoppingBag size={21} />
          {count > 0 && <span className="cart-count">{count}</span>}
        </Link>
      </div>
    </header>
  );
}