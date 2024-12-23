exports.getAllPosts = async (req, res) => {
  res.status(200).json({ success: true, message: "Good to go!" });
};

exports.getSinglePost = async (req, res) => {
  res.status(200).json({ success: true, message: "Showing single post" });
};

exports.createPost = async (req, res) => {
  res.status(200).json({ success: true, message: "Posting" });
};

exports.updatePost = async (req, res) => {
  res.status(200).json({ success: true, message: "Updated Post" });
};

exports.deletePost = async (req, res) => {
  res.status(200).json({ success: true, message: "Delete Post" });
};
