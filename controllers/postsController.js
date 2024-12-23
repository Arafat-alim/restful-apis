const {
  createPostSchema,
  updatePostSchema,
} = require("../middelwares/validator");
const Post = require("../models/postsModel");

exports.getPosts = async (req, res) => {
  const { page = 1 } = req.query;
  let postPerPage = 10;
  let totalPosts;

  try {
    let pageNum = 0;
    if (page <= 1) {
      pageNum = 0;
    } else {
      pageNum = page - 1;
    }

    const results = await Post.find()
      .sort({ createdAt: -1 })
      .skip(pageNum * postPerPage)
      .limit(postPerPage)
      .populate({
        path: "userId",
        select: "email",
      });

    res.status(200).json({
      success: true,
      message: "posts",
      data: results,
      metadata: {
        currentPage: page,
        postsPerPage: postPerPage,
        totalPosts: results.length,
        totalPages: Math.ceil(totalPosts / postPerPage)
          ? Math.ceil(totalPosts / postPerPage)
          : 1,
      },
    });
  } catch (err) {
    console.log("Something went wrong with Get Posts API: ", err);
    res.status(500).json({
      success: false,
      message: err,
    });
  }
};

//! getPost by id
exports.getPost = async (req, res) => {
  const { _id } = req.query;
  try {
    //! fetch post using id
    const existingPost = await Post.findOne({ _id }).populate({
      path: "userId",
      select: "email",
    });

    if (!existingPost) {
      return res
        .status(404)
        .json({ success: false, message: "Post unavailable" });
    }

    return res
      .status(200)
      .json({ success: true, message: "Post Found", data: existingPost });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch post. Please try again later.",
    });
  }
};

exports.createPost = async (req, res) => {
  const { title, description } = req.body;
  const { userId } = req.user;
  try {
    const { error, value } = await createPostSchema.validate({
      title,
      description,
      userId,
    });

    if (error) {
      return res
        .status(401)
        .json({ success: false, message: error.details[0].message });
    }

    const results = await Post.create({
      title,
      description,
      userId,
    });

    if (results) {
      return res.status(201).json({
        success: true,
        message: "Post created successfully",
        data: results,
      });
    }
    res.status(403).json({ success: false, message: "unexpected occured" });
  } catch (err) {
    console.log("Something went wrong with Get Posts API: ", err);
    res.status(500).json({
      success: false,
      message: "Failed to post. Please try again later.",
    });
  }
};

exports.updatePost = async (req, res) => {
  const { title, description } = req.body;
  const { _id } = req.query;
  try {
    //! find exisiting post
    const existingPost = await Post.findOne({ _id });
    if (!existingPost) {
      return res
        .status(404)
        .json({ status: false, message: "Post unavailable" });
    }
    const { error, value } = await updatePostSchema.validate({
      title,
      description,
    });
    if (error) {
      return res
        .status(401)
        .json({ status: false, message: error.details[0].message });
    }

    existingPost.title = title ? title : existingPost.title;
    existingPost.description = description
      ? description
      : existingPost.description;

    console.log(existingPost);
    const results = await existingPost.save();
    console.log(results);
    if (results) {
      return res.status(201).json({
        success: true,
        message: "Post Updated Successfully",
        data: results,
      });
    }
    return res.status(401).json({
      success: false,
      message: "unexpected occur",
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: `${
        err.length ? err : "Failed to update post. Please try again later."
      }`,
    });
  }
};

exports.deletePost = async (req, res) => {
  const { _id } = req.query;
  try {
    const deletePost = await Post.findOneAndDelete({ _id });
    if (!deletePost) {
      return res
        .status(404)
        .json({ success: false, message: "Post does not found" });
    }
    return res
      .status(200)
      .json({ success: false, message: "Post deleted successfully" });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: `${
        err ? err : "Failed to delete post. Please try again later."
      }`,
    });
  }
};
