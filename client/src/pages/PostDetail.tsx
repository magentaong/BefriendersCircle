import React from "react";
import Layout from "../components/Layout.tsx";
import { useParams } from "react-router-dom";
import PostCard from '../components/Forum/PostCard.tsx';
import topicResources from "../content/Topic.json";

interface Topic {
  id: number;
  time: string;
  content: string;
  comments: number;
  like: number;
}

function PostDetail() {
  const { currentCategory, postId } = useParams<{ currentCategory: string; postId: string }>();

  if (!currentCategory || !postId) {
    return <Layout header="Post Not Found"><p>Invalid URL parameters.</p></Layout>;
  }

  // Get topics for this category
  const topics: Record<string, Topic[]> = topicResources;

  // Find the post with matching id
  const post = topics.find((topic) => topic.id === Number(postId));

  if (!post) {
    return <Layout header="Post Not Found"><p>Post not found in this category.</p></Layout>;
  }

  return (
    <Layout header={`Post Detail - ${currentCategory}`}>
      <section className="max-w-3xl mx-auto p-8 bg-white rounded-lg shadow-lg mt-8">
        <h1 className="text-3xl font-bold mb-4">Post #{post.id}</h1>
        <p className="text-gray-600 mb-6"><em>{post.time}</em></p>
        <p className="text-lg mb-6">{post.content}</p>

        <div className="flex space-x-10 text-gray-700 text-lg">
          <div className="flex items-center space-x-2">
            <img src="/Support/Comment.png" alt="comments" className="w-6 h-6" />
            <span>{post.comments} Comments</span>
          </div>
          <div className="flex items-center space-x-2">
            <img src="/Support/Heart.png" alt="likes" className="w-6 h-6" />
            <span>{post.like} Likes</span>
          </div>
        </div>
      </section>
    </Layout>
  );
}

export default PostDetail;
