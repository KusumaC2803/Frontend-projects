import { Router } from "express";
import { products } from "../data/products.js";

const router = Router();

// GET all products
router.get("/", (req, res) => {
  res.json(products);
});

// GET single product
router.get("/:id", (req, res) => {
  const product = products.find(
    (item) => item.id === Number(req.params.id)
  );

  if (!product) {
    return res.status(404).json({
      message: "Product not found"
    });
  }

  res.json(product);
});

export default router;