import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadOrders() {
      try {
        const response = await fetch("/api/orders");
        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.message || "Unable to load orders");
        }

        setOrders(data.orders || []);
      } catch (err) {
        console.error("Orders error:", err);
        setError(err.message || "Unable to load orders");
      } finally {
        setLoading(false);
      }
    }

    loadOrders();
  }, []);

  if (loading) {
    return (
      <section className="section empty-state">
        <p className="eyebrow">YOUR ORDERS</p>
        <h1>Loading orders...</h1>
      </section>
    );
  }

  if (error) {
    return (
      <section className="section empty-state">
        <p className="eyebrow">YOUR ORDERS</p>
        <h1>Unable to load orders</h1>
        <p>{error}</p>
        <Link to="/shop" className="btn btn-dark">
          Continue shopping
        </Link>
      </section>
    );
  }

  if (!orders.length) {
    return (
      <section className="section empty-state">
        <p className="eyebrow">YOUR ORDERS</p>
        <h1>No orders yet</h1>
        <p>Your completed orders will appear here.</p>

        <Link to="/shop" className="btn btn-dark">
          Start shopping
        </Link>
      </section>
    );
  }

  return (
    <section className="section orders-page">
      <div className="shop-title">
        <p className="eyebrow">YOUR ORDERS</p>
        <h1>Order history</h1>
        <p>{orders.length} order{orders.length !== 1 ? "s" : ""}</p>
      </div>

      <div className="orders-list">
        {orders.map((order) => (
          <article className="order-card" key={order._id}>
            <div className="order-header">
              <div>
                <p className="muted">Order ID</p>
                <strong>{order._id}</strong>
              </div>

              <span
                className={
                  order.orderStatus === "confirmed"
                    ? "order-status success"
                    : "order-status"
                }
              >
                {order.orderStatus}
              </span>
            </div>

            <div className="order-info">
              <div>
                <span className="muted">Date</span>
                <strong>
                  {new Date(order.createdAt).toLocaleDateString("en-IN")}
                </strong>
              </div>

              <div>
                <span className="muted">Payment</span>
                <strong>{order.paymentStatus}</strong>
              </div>

              <div>
                <span className="muted">Total</span>
                <strong>
                  ₹{Number(order.total).toLocaleString("en-IN")}
                </strong>
              </div>
            </div>

            <div className="order-items">
              <h3>Items</h3>

              {order.items.map((item, index) => (
                <div className="order-item" key={`${item.productId}-${index}`}>
                  <div>
                    <strong>{item.name}</strong>
                    <p className="muted">
                      ₹{Number(item.price).toLocaleString("en-IN")} ×{" "}
                      {item.quantity}
                    </p>
                  </div>

                  <strong>
                    ₹
                    {(
                      Number(item.price) * Number(item.quantity)
                    ).toLocaleString("en-IN")}
                  </strong>
                </div>
              ))}
            </div>

            <div className="order-footer">
              <span>Razorpay Payment ID</span>
              <code>{order.razorpayPaymentId || "Pending"}</code>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}