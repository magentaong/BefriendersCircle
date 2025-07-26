/*
import React from "react";

interface Post {
  id: number;
  time: string;
  content: string;
  comments: number;
  like: number;
}

interface PostCardProps {
  post: Post;
}

const PostCard: React.FC<PostCardProps> = ({ post }) => {
  return (
    <div className="p-6 bg-white max-w-full rounded-2xl shadow-md text-left">
      <div className="mb-4">
        <p className="text-gray-700">{post.content}</p>
      </div>
      <div className="flex justify-between text-gray-600 text-sm mb-4">
        <span>{post.time}</span>
      </div>
      <div className="flex space-x-8 text-gray-700 text-lg">
        <div className="flex items-center space-x-2 cursor-pointer select-none">
          <img src="/Support/Comment.png" alt="comments" className="w-6 h-6" />
          <span>{post.comments}</span>
        </div>
        <div className="flex items-center space-x-2 cursor-pointer select-none">
          <img src="/Support/Heart.png" alt="likes" className="w-6 h-6" />
          <span>{post.like}</span>
        </div>
      </div>
    </div>
  );
};

export default PostCard;
*/
import React from "react";

interface Post {
  pID: string;
  bID: string;
  cID: string;
  message: string;
  comments: number;
  likes: number;
  createdAt: string;
  updatedAt: string;
}

interface PostCardProps {
  post: Post;
}

const PostCard: React.FC<PostCardProps> = ({ post }) => {
  return (
    <div className="p-6 bg-white max-w-full rounded-2xl shadow-md text-left">
      <div className="mb-4">
        <p className="text-gray-700">{post.message}</p>
      </div>
      <div className="flex justify-between text-gray-600 text-sm mb-4">
        <span>{new Date(post.createdAt).toLocaleString()}</span>
      </div>
      <div className="flex space-x-8 text-gray-700 text-lg">
        <div className="flex items-center space-x-2 cursor-pointer select-none">
          <img src="/Support/Comment.png" alt="comments" className="w-6 h-6" />
          <span>{post.comments}</span>
        </div>
        <div className="flex items-center space-x-2 cursor-pointer select-none">
          <img src="/Support/Heart.png" alt="likes" className="w-6 h-6" />
          <span>{post.likes}</span>
        </div>
      </div>
    </div>
  );
};

export default PostCard;
