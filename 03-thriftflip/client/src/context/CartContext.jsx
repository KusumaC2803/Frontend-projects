import { createContext, useContext, useEffect, useMemo, useState } from "react";

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [cart, setCart] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("thrift-flip-cart")) || [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem("thrift-flip-cart", JSON.stringify(cart));
  }, [cart]);

  function addToCart(product, size = "M") {
    setCart((current) => {
      const existing = current.find((item) => item.id === product.id && item.size === size);
      if (existing) {
        return current.map((item) =>
          item.id === product.id && item.size === size
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...current, { ...product, size, quantity: 1 }];
    });
  }

  function updateQuantity(id, size, quantity) {
    setCart((current) =>
      quantity <= 0
        ? current.filter((item) => !(item.id === id && item.size === size))
        : current.map((item) =>
            item.id === id && item.size === size ? { ...item, quantity } : item
          )
    );
  }

  function removeFromCart(id, size) {
    setCart((current) => current.filter((item) => !(item.id === id && item.size === size)));
  }

  function clearCart() {
    setCart([]);
  }

  const totals = useMemo(() => {
    const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    return { subtotal, shipping: subtotal >= 2500 || subtotal === 0 ? 0 : 99, total: subtotal + (subtotal >= 2500 || subtotal === 0 ? 0 : 99), count: cart.reduce((sum, item) => sum + item.quantity, 0) };
  }, [cart]);

  return (
    <CartContext.Provider value={{ cart, addToCart, updateQuantity, removeFromCart, clearCart, ...totals }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}