import React from "react";

interface Post {
  id: number;
  content: string;
  time: string;
  comments: number;
  like: number;
}

interface PostCardProps {
  post: Post;
}

const PostCard: React.FC<PostCardProps> = ({ post }) => {
  return (
    <div className="post-card p-6 bg-white rounded-2xl shadow-md max-w-3xl mx-auto">
      <h2 className="text-xl font-bold mb-4">Post ID: {post.id}</h2>
      <p className="mb-4">{post.content}</p>
      <div className="flex justify-between text-sm text-gray-500">
        <span>Time: {post.time}</span>
        <span>Comments: {post.comments}</span>
        <span>Likes: {post.like}</span>
      </div>
    </div>
  );
};

export default PostCard;
