const express = require("express");
const postsController = require("../controllers/postsController.js");
const { identifier } = require("../middelwares/identification.js");

const postsRouter = express.Router();

postsRouter.get("/posts", identifier, postsController.getPosts);
postsRouter.get("/single-post", identifier, postsController.getPost);
postsRouter.post("/create-post", identifier, postsController.createPost);
postsRouter.put("/update-post", identifier, postsController.updatePost);
postsRouter.delete("/delete-post", identifier, postsController.deletePost);

module.exports = postsRouter;
