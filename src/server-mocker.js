import express from "express";
import apiMocker from "connect-api-mocker"

var app = express();
app.use(apiMocker("/mocks"));

app.listen(8080, () => console.log("listening to port 8080"))