const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  productName: {
    type: String,
    required: true,
    trim: true,
  },
  productDescription: {
    type: String,
    required: true,
    trim: true,
  },
  productimageUrl: {
    type: String,
    required: true,
    trim: true,
  },
  productCatagory: {
    type: String,
    required: true,
    trim: true,
  },
  productPrice: {
    type: Number,
    required: true,
    trim: true,
  },
  isSold: {
    type: Boolean,
  },
  productOwner: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "User",
  },
});

const Product = mongoose.model("Product", productSchema);
module.exports = Product;
