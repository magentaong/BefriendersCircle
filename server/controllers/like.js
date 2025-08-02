const ForumLike = require("../models/ForumLike");
const Post = require("../models/Post");

async function toggleLike(cID, forumID, isPost) {
  if (!cID || !forumID || typeof isPost !== "boolean") {
    const error = new Error("Missing required fields");
    error.status = 400;
    throw error;
  }

  const existingLike = await ForumLike.findOne({ cID, forumID, isPost });

  if (existingLike) {
    await ForumLike.deleteOne({ _id: existingLike._id });

    if (isPost) {
      await Post.findOneAndUpdate({ pID: forumID }, { $inc: { likes: -1 } });
    }

    return { liked: false };
  } else {
    const newLike = new ForumLike({ cID, forumID, isPost, isLiked: true });
    await newLike.save();

    if (isPost) {
      await Post.findOneAndUpdate({ pID: forumID }, { $inc: { likes: 1 } });
    }

    return { liked: true };
  }
}

async function getLikeStatus(cID, forumID, isPostRaw) {
  if (!cID || !forumID || typeof isPostRaw === "undefined") {
    const error = new Error("Missing required query parameters");
    error.status = 400;
    throw error;
  }

  const isPost = isPostRaw === "true";
  const like = await ForumLike.findOne({ cID, forumID, isPost });
  return { liked: !!like };
}

module.exports = {toggleLike,getLikeStatus}
