const express = require("express");
const auth = require("../middleware/auth");
const router = express.Router();
const {
  STRIPE_SECRET_KEY,
  LAMBTON_FE,
  STRIPE_WEBHOOK_SECRET,
} = require("../secret_key");
const Payment = require("../model/payment");
const stripe = require("stripe")(STRIPE_SECRET_KEY);

router.post("/create-payment-intent", auth, async (req, res) => {
  try {
    const { lineItems, id } = req.body;

    if (!lineItems) {
      return res.status(400).json({ error: "Invalid request" });
    }
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      success_url: `${LAMBTON_FE}/payment?id=${id}&&paymentStatus=success`,
      cancel_url: `${LAMBTON_FE}/payment?id=${id}&&paymentStatus=failed`,
    });

    const payment = new Payment({
      user: req.user._id,
      product: id,
      stripeSessionId: session.id,
      amount: lineItems[0].price_data.unit_amount / 100, // Convert cents to dollars
      currency: lineItems[0].price_data.currency,
      paymentStatus: "pending",
    });

    await payment.save();
    res.json({ id: session.id });
  } catch (error) {
    res.status(500).json({ message: "Payment failed", error: error.message });
  }
});

router.get("/get-payment-list", auth, async (req, res) => {
  try {
    const payments = await Payment.find()
      .populate("user", "fullName")
      .populate("product", "productName")
      .sort({ createdAt: -1 });
    res.json(payments);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch payments" });
  }
});

module.exports = router;
