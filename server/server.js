require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const { imageRouter } = require("./routes/imageRouter");
const { userRouter } = require("./routes/userRouter");
const { authenticate } = require("./middleware/authentication");

const app = express();
const { MONGO_URI, PORT } = process.env;

mongoose
    .connect(MONGO_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    .then(() => {
        console.log("mongodb connected.");
        app.use("/uploads", express.static("uploads"));
        app.use(express.json());
        app.use(authenticate);
        app.use("/images", imageRouter);
        app.use("/users", userRouter);
        app.listen(PORT, () =>
            console.log("Express server listening on PORT " + PORT + "...")
        );
    })
    .catch((err) => console.log(err));
