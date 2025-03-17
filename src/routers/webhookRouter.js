const express = require("express");
const router = express.Router();
const { STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET } = require("../secret_key");
const Payment = require("../model/payment");
const stripe = require("stripe")(STRIPE_SECRET_KEY);

router.post(
  "/stripe-webhook",
  express.raw({ type: "application/json" }),
  async (req, res) => {
    let event;

    try {
      const sig = req.headers["stripe-signature"];
      event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        STRIPE_WEBHOOK_SECRET
      );
    } catch (err) {
      return res.status(400).send(`Webhook error: ${err.message}`);
    }

    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      const payment = await Payment.findOne({ stripeSessionId: session.id });

      if (payment) {
        payment.paymentStatus = "success";
        await payment.save();
      }
    }

    res.json({ received: true });
  }
);

// stripe listen --forward-to http://localhost:5000/stripe-webhook

module.exports = router;
