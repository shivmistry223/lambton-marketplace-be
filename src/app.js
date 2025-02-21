const express = require("express");
const cors = require("cors");
const userRouter = require("./routers/userRouter");
require("./db/mongoose");

const app = express();
app.use(express.json()); // automatic convert json into object

app.use(cors()); // Enable CORS

const port = process.env.PORT || 5000;

app.use(userRouter);

app.listen(port, () => {
  console.log("Server started on " + port);
});
