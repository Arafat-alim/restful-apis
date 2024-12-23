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
        path: "UserId",
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
      message: "Failed to fetch posts. Please try again later.",
    });
  }
};

exports.getPost = async (req, res) => {
  try {
  } catch (err) {
    console.log("Something went wrong with Get Posts API: ", err);
  }
  res.status(200).json({ success: true, message: "Showing single post" });
};

exports.createPost = async (req, res) => {
  try {
  } catch (err) {
    console.log("Something went wrong with Get Posts API: ", err);
  }
  res.status(200).json({ success: true, message: "Posting" });
};

exports.updatePost = async (req, res) => {
  try {
  } catch (err) {
    console.log("Something went wrong with Get Posts API: ", err);
  }
  res.status(200).json({ success: true, message: "Updated Post" });
};

exports.deletePost = async (req, res) => {
  try {
  } catch (err) {
    console.log("Something went wrong with Get Posts API: ", err);
  }
  res.status(200).json({ success: true, message: "Delete Post" });
};
