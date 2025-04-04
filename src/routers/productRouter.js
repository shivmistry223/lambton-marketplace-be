const express = require("express");
const Product = require("../model/product");
const upload = require("../utils/uploadFile");
const router = new express.Router();
const fs = require("fs");
const path = require("path");
const auth = require("../middleware/auth");

router.post(
  "/product",
  auth,
  upload.single("productImage"),
  async (req, res) => {
    if (!req.file) {
      return res.status(400).json({ error: "Product image is required." });
    }
    try {
      const { productName, productDescription, productCatagory, productPrice } =
        req.body;

      const productOwner = req.user._id;

      const product = new Product({
        productName,
        productDescription,
        productimageUrl: `/products/${req.file.filename}`,
        productCatagory,
        productPrice,
        isSold: false,
        productOwner,
      });

      await product.save();
      res.status(201).json(product);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }
);

router.get("/product/:id", auth, async (req, res) => {
  const _id = req.params.id;
  try {
    const product = await Product.findOne({ _id })
      .populate("productOwner")
      .exec();
    if (!product) {
      return res.status(404).send();
    }
    res.send(product);
  } catch (err) {
    res.status(400).send(err.message);
  }
});

router.patch(
  "/product/:id",
  auth,
  upload.single("productImage"),
  async (req, res) => {
    try {
      const product = await Product.findById(req.params.id);
      if (!product) {
        return res.status(404).json({ error: "Product not found" });
      }

      Object.assign(product, req.body);

      if (req.file) {
        product.productimageUrl = `/products/${req.file.filename}`;
      }

      await product.save();
      res.json({ message: "Product updated successfully!", product });
    } catch (error) {
      res.status(400).send(error.message);
    }
  }
);

router.post("/update-payment-status", auth, async (req, res) => {
  try {
    const id = req.body.orderId;
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    Object.assign(product, { isSold: true });
    await product.save();
    res.json({ message: "Updated successfully!", product });
  } catch (error) {
    res.status(400).send(error.message);
  }
});

router.delete("/product/:id", auth, async (req, res) => {
  try {
    const product = await Product.findOneAndDelete({
      _id: req.params.id,
    });

    if (!product) {
      return res.status(404).send();
    }

    const imagePath = path.join(__dirname, "../..", product.productimageUrl);
    fs.unlink(imagePath, (err) => {
      if (err) {
        console.error("Error deleting file:", err);
      }
    });

    res.send(product);
  } catch (e) {
    res.status(400).send();
  }
});

router.get("/product", auth, async (req, res) => {
  try {
    const { category, ownerId, page = 1, limit = 8, search } = req.query;

    let query = { isSold: false };

    if (category && category !== "all") {
      query.productCatagory = category;
    }

    if (ownerId) {
      query.productOwner = ownerId;
      delete query.isSold;
    }

    if (search) {
      query.productName = { $regex: search, $options: "i" }; // Case-insensitive search
    }

    const pageNumber = parseInt(page, 10);
    const limitNumber = parseInt(limit, 10);

    const products = await Product.find(query)
      .populate("productOwner")
      .skip((pageNumber - 1) * limitNumber)
      .limit(limitNumber)
      .sort({ createdAt: -1 })
      .exec();

    const totalCount = await Product.countDocuments(query);

    res.send({
      products,
      totalPages: Math.ceil(totalCount / limitNumber),
      currentPage: pageNumber,
      totalCount,
    });
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

module.exports = router;
