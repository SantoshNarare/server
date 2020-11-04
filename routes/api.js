var express = require("express");
var authRouter = require("./auth");
var blogRouter = require("./blog");

var app = express();

app.use("/auth/", authRouter);
app.use("/blog/", blogRouter);

module.exports = app;