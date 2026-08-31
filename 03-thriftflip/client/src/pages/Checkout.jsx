import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";

export default function Checkout() {
  const { cart, total, clearCart } = useCart();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    contact: "",
    address: "",
    city: "",
    pin: "",
  });

  function update(e) {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  }

  async function handleCheckout(e) {
    e.preventDefault();

    if (!cart.length) {
      alert("Your cart is empty.");
      return;
    }

    setLoading(true);

    try {
      // Send only product IDs and quantities.
      // The backend calculates prices securely.
      const items = cart.map((item) => ({
        id: item.id,
        quantity: item.quantity,
      }));

      // Create Razorpay order
      const response = await fetch(
        "/api/payment/create-order",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            items,
            customer: {
              name: form.name,
              email: form.email,
              contact: form.contact,
              address: form.address,
              city: form.city,
              pin: form.pin,
            },
          }),
        }
      );

      // Safely read the response
      const text = await response.text();

      let data;

      try {
        data = JSON.parse(text);
      } catch {
        throw new Error(
          "Server returned an invalid response. Make sure the backend is running on port 5000."
        );
      }

      if (!response.ok) {
        throw new Error(
          data.message || "Unable to create order"
        );
      }

      if (!data.success || !data.order) {
        throw new Error(
          "Invalid order response from server"
        );
      }

      // Make sure Razorpay Checkout is loaded
      if (!window.Razorpay) {
        throw new Error(
          "Razorpay Checkout did not load. Please refresh the page."
        );
      }

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,

        // Razorpay order details
        amount: data.order.amount,
        currency: data.order.currency,
        order_id: data.order.id,

        name: "Thrift-Flip Store",
        description: "Fashion order",

        prefill: {
          name: form.name,
          email: form.email,
          contact: form.contact,
        },

        notes: {
          address: form.address,
          city: form.city,
          pin: form.pin,
        },

        theme: {
          color: "#171717",
        },

        handler: async function (payment) {
          try {
            // Verify payment on backend
            const verifyResponse = await fetch(
              "/api/payment/verify",
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  razorpay_order_id:
                    payment.razorpay_order_id,

                  razorpay_payment_id:
                    payment.razorpay_payment_id,

                  razorpay_signature:
                    payment.razorpay_signature,
                }),
              }
            );

            const verifyText =
              await verifyResponse.text();

            let result;

            try {
              result = JSON.parse(verifyText);
            } catch {
              throw new Error(
                "Server returned an invalid verification response."
              );
            }

            if (
              !verifyResponse.ok ||
              !result.success ||
              !result.verified
            ) {
              throw new Error(
                result.message ||
                  "Payment verification failed"
              );
            }

            // Payment verified successfully
            clearCart();

            navigate("/success");
          } catch (error) {
            console.error(
              "Verification error:",
              error
            );

            alert(
              error.message ||
                "Payment verification failed."
            );

            setLoading(false);
          }
        },

        modal: {
          ondismiss: () => {
            setLoading(false);
          },
        },
      };

      const razorpay =
        new window.Razorpay(options);

      razorpay.on(
        "payment.failed",
        (response) => {
          console.error(
            "Payment failed:",
            response.error
          );

          alert(
            response.error?.description ||
              "Payment failed."
          );

          setLoading(false);
        }
      );

      razorpay.open();
    } catch (error) {
      console.error(
        "Checkout error:",
        error
      );

      alert(
        error.message ||
          "Unable to start checkout."
      );

      setLoading(false);
    }
  }

  // Empty cart
  if (!cart.length) {
    return (
      <section className="section empty-state">
        <h1>No items to checkout</h1>

        <Link
          to="/shop"
          className="btn btn-dark"
        >
          Shop now
        </Link>
      </section>
    );
  }

  return (
    <section className="section checkout">
      <div>
        <p className="eyebrow">
          SECURE CHECKOUT
        </p>

        <h1>Complete your order</h1>

        <form
          onSubmit={handleCheckout}
          className="checkout-form"
        >
          <input
            name="name"
            value={form.name}
            onChange={update}
            required
            placeholder="Full name"
          />

          <input
            name="email"
            value={form.email}
            onChange={update}
            required
            type="email"
            placeholder="Email address"
          />

          <input
            name="contact"
            value={form.contact}
            onChange={update}
            required
            placeholder="Phone number (+91...)"
          />

          <input
            name="address"
            value={form.address}
            onChange={update}
            required
            placeholder="Address"
          />

          <div className="two">
            <input
              name="city"
              value={form.city}
              onChange={update}
              required
              placeholder="City"
            />

            <input
              name="pin"
              value={form.pin}
              onChange={update}
              required
              placeholder="PIN code"
            />
          </div>

          <button
            type="submit"
            className="btn btn-dark full"
            disabled={loading}
          >
            {loading
              ? "Opening Razorpay..."
              : "Pay securely with Razorpay"}
          </button>

          <p className="muted">
            Test Mode only — no real money
            will be charged.
          </p>
        </form>
      </div>

      <aside className="summary">
        <h2>Order total</h2>

        <div className="total">
          <span>Total</span>

          <strong>
            ₹{total.toLocaleString("en-IN")}
          </strong>
        </div>

        <p className="muted">
          Razorpay Test Mode handles the
          payment UI. Your secret key stays
          on the server.
        </p>
      </aside>
    </section>
  );
}