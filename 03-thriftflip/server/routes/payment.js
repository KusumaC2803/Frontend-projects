import dotenv from "dotenv";

dotenv.config();

import { Router } from "express";
import crypto from "crypto";
import Razorpay from "razorpay";

import { products } from "../data/products.js";
import Order from "../models/Order.js";

const router = Router();

console.log("Razorpay Key Loaded:", !!process.env.RAZORPAY_KEY_ID);
console.log(
  "Razorpay Secret Loaded:",
  !!process.env.RAZORPAY_KEY_SECRET
);

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// ======================================================
// CREATE RAZORPAY ORDER
// ======================================================

router.post("/create-order", async (req, res) => {
  try {
    const { items, customer } = req.body;

    // Validate cart
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        message: "Cart is empty",
      });
    }

    // Validate customer details
    if (
      !customer ||
      !customer.name ||
      !customer.email ||
      !customer.contact ||
      !customer.address ||
      !customer.city ||
      !customer.pin
    ) {
      return res.status(400).json({
        message: "Customer details are required",
      });
    }

    let total = 0;
    const orderItems = [];

    // Calculate total using server-side product prices
    for (const item of items) {
      const product = products.find(
        (product) => product.id === Number(item.id)
      );

      if (!product) {
        return res.status(400).json({
          message: `Product ${item.id} not found`,
        });
      }

      const quantity = Number(item.quantity);

      if (!Number.isInteger(quantity) || quantity < 1) {
        return res.status(400).json({
          message: "Invalid quantity",
        });
      }

      total += product.price * quantity;

      orderItems.push({
        productId: product.id,
        name: product.name,
        price: product.price,
        quantity,
      });
    }

    const amount = total * 100;

    // Create Razorpay order
    const razorpayOrder = await razorpay.orders.create({
      amount,
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
    });

    // Save order in MongoDB
    const order = await Order.create({
      customer: {
        name: customer.name,
        email: customer.email,
        contact: customer.contact,
        address: customer.address,
        city: customer.city,
        pin: customer.pin,
      },

      items: orderItems,

      total,

      razorpayOrderId: razorpayOrder.id,

      paymentStatus: "created",

      orderStatus: "pending",
    });

    console.log(
      `Order created: ${order._id}`
    );

    res.json({
      success: true,

      order: {
        id: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
      },
    });
  } catch (error) {
    console.error(
      "Create order error:",
      error
    );

    res.status(500).json({
      message: "Unable to create Razorpay order",
    });
  }
});

// ======================================================
// VERIFY RAZORPAY PAYMENT
// ======================================================

router.post("/verify", async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = req.body;

    if (
      !razorpay_order_id ||
      !razorpay_payment_id ||
      !razorpay_signature
    ) {
      return res.status(400).json({
        message: "Payment details are missing",
      });
    }

    // Generate signature using Razorpay secret
    const generatedSignature =
      crypto
        .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
        .update(
          `${razorpay_order_id}|${razorpay_payment_id}`
        )
        .digest("hex");

    // Compare signatures
   const generatedBuffer = Buffer.from(generatedSignature);
const receivedBuffer = Buffer.from(razorpay_signature);

if (generatedBuffer.length !== receivedBuffer.length) {
  return res.status(400).json({
    success: false,
    verified: false,
    message: "Invalid payment signature",
  });
}

const isValid = crypto.timingSafeEqual(
  generatedBuffer,
  receivedBuffer
);

    if (!isValid) {
      return res.status(400).json({
        success: false,
        verified: false,
        message: "Invalid payment signature",
      });
    }

    // Find the MongoDB order
    const order = await Order.findOne({
      razorpayOrderId: razorpay_order_id,
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        verified: false,
        message: "Order not found",
      });
    }

    // Update payment status
    order.razorpayPaymentId =
      razorpay_payment_id;

    order.paymentStatus = "paid";

    order.orderStatus = "confirmed";

    await order.save();

    console.log(
      `Payment verified: ${razorpay_payment_id}`
    );

    res.json({
      success: true,
      verified: true,
      message: "Payment verified successfully",
    });
  } catch (error) {
    console.error(
      "Payment verification error:",
      error
    );

    res.status(500).json({
      success: false,
      verified: false,
      message: "Payment verification failed",
    });
  }
});

export default router;