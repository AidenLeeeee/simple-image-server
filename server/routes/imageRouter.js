const { Router } = require("express");
const imageRouter = Router();
const Image = require("../models/Image");
const { upload } = require("../middleware/imageUpload");
const mongoose = require("mongoose");
const { s3, getSignedUrl } = require("../aws");
const { v4: uuid } = require("uuid");
const mime = require("mime-types");

imageRouter.post("/presigned", async (req, res) => {
    try {
        if (!req.user) throw new Error("This service needs login");
        const { contentTypes } = req.body;
        if (!Array.isArray(contentTypes))
            throw new Error("Invalid ContentTypes");
        const presignedData = await Promise.all(
            contentTypes.map(async (contentType) => {
                const imageKey = `${uuid()}.${mime.extension(contentType)}`;
                const key = `raw/${imageKey}`;
                const presigned = await getSignedUrl({ key });
                return { imageKey, presigned };
            })
        );

        res.json(presignedData);
    } catch (err) {
        console.error(err);
        res.status(400).json({ message: err.message });
    }
});

imageRouter.post("/", upload.array("image", 30), async (req, res) => {
    try {
        if (!req.user) throw new Error("This service needs login");
        const { images, public } = req.body;

        const imageDocs = await Promise.all(
            images.map((image) =>
                new Image({
                    user: {
                        _id: req.user.id,
                        name: req.user.name,
                        username: req.user.username,
                    },
                    public,
                    key: image.imageKey,
                    originalFileName: image.originalname,
                }).save()
            )
        );

        res.json(imageDocs);
    } catch (err) {
        console.error(err);
        res.status(400).json({ message: err.message });
    }
});

imageRouter.get("/", async (req, res) => {
    try {
        const { lastid } = req.query;
        if (lastid && !mongoose.isValidObjectId(lastid))
            throw new Error("Invalid lastid");
        const images = await Image.find(
            lastid
                ? {
                      public: true,
                      _id: { $lt: lastid },
                  }
                : { public: true }
        )
            .sort({ _id: -1 })
            .limit(30);
        res.json(images);
    } catch (err) {
        console.error(err);
        res.status(400).json({ message: err.message });
    }
});

imageRouter.get("/:imageId", async (req, res) => {
    try {
        const { imageId } = req.params;
        if (!mongoose.isValidObjectId(imageId))
            throw new Error("Invalid image id");
        const image = await Image.findOne({ _id: imageId });
        if (!image) throw new Error("Image doesn't exist");
        if (!image.public && (!req.user || req.user.id !== image.user.id))
            throw new Error("This service needs login");

        res.json(image);
    } catch (err) {
        console.error(err);
        res.status(400).json({ message: err.message });
    }
});

imageRouter.delete("/:imageId", async (req, res) => {
    try {
        if (!req.user) throw new Error("This service needs login");
        if (!mongoose.isValidObjectId(req.params.imageId))
            throw new Error("Invalid image id");

        const image = await Image.findOneAndDelete({ _id: req.params.imageId });
        if (!image) return res.json({ message: "Image already deleted" });

        s3.deleteObject(
            {
                Bucket: "simple-image-server",
                Key: `raw/${image.key}`,
            },
            (error) => {
                if (error) throw error;
            }
        );
        res.json({ message: "Image deleted succesfully!" });
    } catch (err) {
        console.error(err);
        res.status(400).json({ message: err.message });
    }
});

imageRouter.patch("/:imageId/like", async (req, res) => {
    try {
        if (!req.user) throw new Error("This service needs login");
        if (!mongoose.isValidObjectId(req.params.imageId))
            throw new Error("Invalid image id");

        const image = await Image.findOneAndUpdate(
            { _id: req.params.imageId },
            { $addToSet: { likes: req.user.id } },
            { new: true }
        );
        res.json(image);
    } catch (err) {
        console.error(err);
        res.status(400).json({ mesage: err.message });
    }
});

imageRouter.patch("/:imageId/unlike", async (req, res) => {
    try {
        if (!req.user) throw new Error("This service needs login");
        if (!mongoose.isValidObjectId(req.params.imageId))
            throw new Error("Invalid image id");

        const image = await Image.findOneAndUpdate(
            { _id: req.params.imageId },
            { $pull: { likes: req.user.id } },
            { new: true }
        );
        res.json(image);
    } catch (err) {
        console.error(err);
        res.status(400).json({ mesage: err.message });
    }
});

module.exports = { imageRouter };
