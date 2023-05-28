const { Router } = require("express");
const userRouter = Router();
const User = require("../models/User");
const { hash, compare } = require("bcryptjs");

userRouter.post("/register", async (req, res) => {
    try {
        if (req.body.password.length < 6) throw new Error("Password too short");
        if (req.body.username.length < 3) throw new Error("Username too short");
        const userExist = await User.findOne({ username: req.body.username });
        if (userExist) throw new Error("Username already exists");

        const hashedPassword = await hash(req.body.password, 10);
        const user = await new User({
            name: req.body.name,
            username: req.body.username,
            hashedPassword,
            sessions: [{ createdAt: new Date() }],
        }).save();
        const session = user.sessions[0];
        res.json({
            message: "user registered",
            sessionId: session._id,
            name: user.name,
            userId: user._id,
        });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

userRouter.patch("/login", async (req, res) => {
    try {
        const user = await User.findOne({ username: req.body.username });
        if (!user) throw new Error("Invalid login info");
        const isValid = await compare(req.body.password, user.hashedPassword);
        if (!isValid) throw new Error("Invalid login info");

        user.sessions.push({ createdAt: new Date() });
        const session = user.sessions[user.sessions.length - 1];
        await user.save();
        res.json({
            message: "user logined",
            sessionId: session._id,
            name: user.name,
            userId: user._id,
        });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

userRouter.patch("/logout", async (req, res) => {
    try {
        if (!req.user) throw new Error("Invalid sessionid");

        await User.updateOne(
            { _id: req.user.id },
            { $pull: { sessions: { _id: req.headers.sessionid } } }
        );
        res.json({ message: "user logged out" });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

userRouter.get("/me", (req, res) => {
    try {
        if (!req.user) throw new Error("No Authorization");
        res.json({
            message: "success",
            sessionId: req.headers.sessionid,
            name: req.user.name,
            userId: req.user._id,
        });
    } catch (err) {
        console.error(err);
        res.status(400).json({ message: err.message });
    }
});

module.exports = { userRouter };
