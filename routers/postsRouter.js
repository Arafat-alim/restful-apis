const express = require("express");
const postsController = require("../controllers/postsController.js");

const postsRouter = express.Router();

postsRouter.get("/posts", postsController.getAllPosts);
postsRouter.get("/single-post", postsController.getSinglePost);
postsRouter.post("/create-post", postsController.createPost);
postsRouter.put("/update-post", postsController.updatePost);
postsRouter.delete("/delete-post", postsController.deletePost);

module.exports = postsRouter;
