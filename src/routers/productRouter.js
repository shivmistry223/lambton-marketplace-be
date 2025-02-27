const express = require("express");
const Product = require("../model/product");
const upload = require("../utils/uploadFile");
const router = new express.Router();
const fs = require("fs");
const path = require("path");
const User = require("../model/user");
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

router.get("/product/:id", async (req, res) => {
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
    console.log("Hellpp");
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

router.delete("/product/:id", async (req, res) => {
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

module.exports = router;