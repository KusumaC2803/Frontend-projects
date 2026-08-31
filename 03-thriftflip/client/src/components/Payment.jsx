import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";

export default function Payment() {
  const { cart, clearCart } = useCart();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const script = document.createElement("script");

    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;

    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  async function handlePayment() {
    if (!cart.length) {
      alert("Your cart is empty.");
      return;
    }

    try {
      setLoading(true);

      // Send ONLY product IDs and quantities
      const items = cart.map((item) => ({
        id: item.id,
        quantity: item.quantity,
      }));

      // Create Razorpay order
      const orderResponse = await fetch(
        "/api/payment/create-order",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ items }),
        }
      );

      const orderData = await orderResponse.json();

      if (!orderResponse.ok) {
        throw new Error(
          orderData.message || "Unable to create order"
        );
      }

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,

        amount: orderData.order.amount,

        currency: "INR",

        name: "Thrift-Flip Store",

        description: "Fashion Store Order",

        order_id: orderData.order.id,

        handler: async function (response) {
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
                    response.razorpay_order_id,

                  razorpay_payment_id:
                    response.razorpay_payment_id,

                  razorpay_signature:
                    response.razorpay_signature,
                }),
              }
            );

            const verifyData =
              await verifyResponse.json();

            if (!verifyResponse.ok || !verifyData.success) {
              throw new Error(
                verifyData.message ||
                  "Payment verification failed"
              );
            }

            // Payment is verified
            clearCart();

            navigate("/success");
          } catch (error) {
            console.error(error);

            alert(
              "Payment completed, but verification failed. Please contact support."
            );
          }
        },

        prefill: {
          name: "",
          email: "",
          contact: "",
        },

        theme: {
          color: "#171717",
        },

        modal: {
          ondismiss: function () {
            setLoading(false);
          },
        },
      };

      if (!window.Razorpay) {
        throw new Error(
          "Razorpay Checkout failed to load."
        );
      }

      const razorpay = new window.Razorpay(options);

      razorpay.on(
        "payment.failed",
        function (response) {
          console.error(
            "Payment failed:",
            response.error
          );

          alert(
            response.error.description ||
              "Payment failed."
          );

          setLoading(false);
        }
      );

      razorpay.open();
    } catch (error) {
      console.error("Payment error:", error);

      alert(
        error.message ||
          "Unable to start payment."
      );

      setLoading(false);
    }
  }

  return (
    <button
      className="btn btn-dark full"
      onClick={handlePayment}
      disabled={loading}
    >
      {loading
        ? "Opening Razorpay..."
        : "Pay securely with Razorpay"}
    </button>
  );
}