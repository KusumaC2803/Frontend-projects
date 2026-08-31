import { Router } from "express";
import Order from "../models/Order.js";

const router = Router();

// ======================================================
// GET ALL ORDERS
// ======================================================

router.get("/", async (req, res) => {
  try {
    const orders = await Order.find()
      .sort({ createdAt: -1 })
      .lean();

    res.json({
      success: true,
      orders,
    });
  } catch (error) {
    console.error("Get orders error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to load orders",
    });
  }
});

export default router;