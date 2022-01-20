const express = require("express");
const apiMocker = require("connect-api-mocker");
require("dotenv").config();

var app = express();
app.use(apiMocker("/mocks"));

app.listen(process.env.PORT || 8080, () => console.log("listening to port 8080"))