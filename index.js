const web = require("./website/web.js");
const webhook = require("./webhook.js");
const parser = require("body-parser");
const express = require("express");
const path = require("path");
const app = express();

const PORT = process.env.PORT || 8080; // Use Heroku's $PORT or default to 8080

app.use(parser.json());
app.use(express.static("website"));
app.get("/config.json", (req, res) => {
  res.sendFile(path.join(__dirname, "config.json"));
});

app.get("/", (req, res) => {
  web.html(res);
});

app.get("/webhook", (req, res) => {
  web.verify(req, res);
});

setTimeout(() => {
  app.post("/webhook", (req, res) => {
    webhook.listen(req.body);
    res.sendStatus(200);
  });
}, 5000);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`); // Update log message for debugging
});
