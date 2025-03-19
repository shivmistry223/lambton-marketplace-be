const express = require("express");
const auth = require("../middleware/auth");
const router = express.Router();

const Product = require("../model/product");
const Review = require("../model/review");

router.post("/add-review", auth, async (req, res) => {
  try {
    const { productId, rating, comment } = req.body;
    const reviewerId = req.user._id;

    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ error: "Product not found" });

    const review = new Review({
      product: productId,
      reviewer: reviewerId,
      rating,
      comment,
      date: new Date(),
    });

    await review.save();
    res.status(201).json(review);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/get-review/:productId", auth, async (req, res) => {
  try {
    const { productId } = req.params;
    const reviews = await Review.find({ product: productId }).populate(
      "reviewer",
      "userName fullName"
    );
    res.status(200).json(reviews);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;