import express from "express";
import config from "./config/index.js";

const app = express();

app.get("/", (req, res) => {
  res.send("Hello World!");
});

const port = config.port;
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
