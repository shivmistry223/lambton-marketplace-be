const express = require("express");
const cors = require("cors");
const userRouter = require("./routers/userRouter");
const productRouter = require("./routers/productRouter");
const paymentRouter = require("./routers/paymentRouter");
const webhookRouter = require("./routers/webhookRouter");
const reviewRouter = require("./routers/reviewRouter");

require("./db/mongoose");

const app = express();

app.use(webhookRouter);

app.use(express.json()); // automatic convert json into object

app.use(cors()); // Enable CORS

app.use("/products", express.static("products"));

// Stripe webhook route must use express.raw()
app.use("/stripe-webhook", express.raw({ type: "application/json" }));

const port = process.env.PORT || 5000;

app.use(userRouter);
app.use(productRouter);
app.use(paymentRouter);
app.use(reviewRouter);

app.listen(port, () => {
  console.log("Server started on " + port);
});