const express = require("express");
const auth = require("../middleware/auth");
const router = express.Router();
const { STRIPE_SECRET_KEY, LAMBTON_FE } = require("../secret_key");
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

    res.json({ id: session.id });
  } catch (error) {
    res.status(500).json({ message: "Payment failed", error: error.message });
  }
});

module.exports = router;
