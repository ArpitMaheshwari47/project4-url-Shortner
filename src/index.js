const express = require("express");
const bodyParser = require("body-parser");
const route = require("../src/route/route");
const mongoose = require("mongoose");
// const { AppConfig } = require("aws-sdk");
const app = express();

app.use(bodyParser.json());
// app.use(multer().any());

mongoose
    .connect(
        "mongodb+srv://Amit7518:Amit7518@cluster0.rwmfg9t.mongodb.net/Project4",
        { useNewUrlParser: true }
    )
    .then(() => console.log("MongoDb is connected"))
    .catch((err) => console.log(err));

app.use("/", route);

app.listen(3000, function () {
    console.log("Express app running on port" + 3000);
});
