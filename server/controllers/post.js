const Post = require("../models/Post");
const Board = require("../models/Board");
const Comment = require("../models/Comment");

async function getPost() {
  return await Post.find();
}

async function createPost(postData) {
  const newPost = new Post(postData);
  await newPost.save();
  return newPost;
}

async function getPostsByBoardName(name) {
  const board = await Board.findOne({ name });
  if (!board) throw { status: 404, message: "Board not found" };

  const posts = await Post.find({ bID: board.bID });
  const postIds = posts.map((p) => p.pID);
  const comments = await Comment.find({ pID: { $in: postIds } });

  return { bID: board.bID, posts, comments };
}

async function getPostDetails(postId) {
  const post = await Post.findOne({ pID: postId });
  if (!post) throw { status: 404, message: "Post not found" };

  const comments = await Comment.find({ pID: postId });
  return { post, comments };
}

async function deletePostAndComments(postId) {
  const post = await Post.deleteOne({ pID: postId });
  if (post.deletedCount === 0) throw { status: 404, message: "Post not found" };

  await Comment.deleteMany({ pID: postId });
  return { message: "Post and associated comments deleted" };
}

module.exports = { getPost, createPost,getPostsByBoardName, getPostDetails, deletePostAndComments};
