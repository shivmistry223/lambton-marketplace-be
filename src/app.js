const express = require("express");
const cors = require("cors");
const userRouter = require("./routers/userRouter");
const productRouter = require("./routers/productRouter");
const paymentRouter = require("./routers/paymentRouter");
require("./db/mongoose");

const app = express();
app.use(express.json()); // automatic convert json into object

app.use(cors()); // Enable CORS

app.use("/products", express.static("products"));

const port = process.env.PORT || 5000;

app.use(userRouter);
app.use(productRouter);
app.use(paymentRouter);

app.listen(port, () => {
  console.log("Server started on " + port);
});
