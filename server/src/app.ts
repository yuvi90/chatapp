import express from "express";
import config from "./config/index.js";
import prisma from "./prisma-client.js";

const app = express();

app.get("/", async (req, res) => {
  try {
    const users = await prisma.users.findMany();
    console.log(users);
    res.json({ users });
  } catch (error) {
    console.log(error);
  }
});

const port = config.port;
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
