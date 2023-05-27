require("dotenv").config();
const express = require("express");
const multer = require("multer");
const { v4: uuid } = require("uuid");
const mime = require("mime-types");
const mongoose = require("mongoose");
const Image = require("./models/Image");

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, "./uploads"),
    filename: (req, file, cb) =>
        cb(null, `${uuid()}.${mime.extension(file.mimetype)}`),
});

const upload = multer({
    storage,
    fileFilter: (req, file, cb) => {
        if (["image/jpeg", "image/png"].includes(file.mimetype)) cb(null, true);
        else cb(new Error("Invalid file type."), false);
    },
    limits: {
        // 5MB limit
        fileSize: 1024 * 1024 * 5,
    },
});

const app = express();
const PORT = 8799;

mongoose
    .connect(process.env.MONGO_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    .then(() => {
        console.log("mongodb connected.");
        app.use("/uploads", express.static("uploads"));
        app.post("/images", upload.single("image"), async (req, res) => {
            const image = await new Image({
                key: req.file.filename,
                originalFileName: req.file.originalname,
            }).save();
            res.json(image);
        });
        app.get("/images", async (req, res) => {
            const images = await Image.find();
            res.json(images);
        });
        app.listen(PORT, () =>
            console.log("Express server listening on PORT " + PORT + "...")
        );
    })
    .catch((err) => console.log(err));
