import express from "express";
import apiMocker from "connect-api-mocker";
import "dotenv/config";

var app = express();
app.use(apiMocker("/mocks"));

app.listen(process.env.PORT || 8080, () => console.log("listening to port 8080"))