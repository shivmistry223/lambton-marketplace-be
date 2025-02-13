const express = require("express");
const cors = require("cors");

const app = express();
app.use(express.json()); // automatic convert json into object

app.use(cors()); // Enable CORS

const port = process.env.PORT || 8080;

app.listen(port, () => {
  console.log("Server started on " + port);
});
