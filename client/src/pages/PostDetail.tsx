import React from "react";
import Layout from "../components/Layout.tsx";
import { useParams } from "react-router-dom";
import PostCard from '../components/Forum/PostCard.tsx';
import postResources from "../content/Post.json";
import topicResources from "../content/Topic.json";

interface Topic {
  id: number;
  time: string;
  content: string;
  comments: number;
  like: number;
}

interface Comment {
  time: string;
  comment: string;
}

function PostDetail() {
  const { currentCategory, postId } = useParams<{ currentCategory: string; postId: string }>();

  if (!currentCategory || !postId) {
    return (
      <Layout header="Post Not Found">
        <p className="text-center mt-8 text-lg text-red-600">
          Invalid URL parameters.
        </p>
      </Layout>
    );
  }

  // Get topics for this category
  const topicsData: Record<string, Topic[]> = topicResources;
  const topics: Topic[] = topicsData[currentCategory] || [];
  const post = topics.find((topic) => topic.id === Number(postId));

  if (!post) {
    return (
      <Layout header="Post Not Found">
        <p className="text-center mt-8 text-lg text-red-600">
          Post not found in this category.
        </p>
      </Layout>
    );
  }

  const commentsData = postResources as Record<string, Comment[]>;
  const comment = commentsData[postId] || [];
  return (
  <Layout header={currentCategory}>
    <section>
      <div className="w-full flex justify-center">
        <div className="w-full px-4 sm:px-8 md:px-16 lg:px-24 xl:px-32 mt-6">
          <PostCard post={post} />

          {comment.length > 0 ? (
            <div className="mt-8 bg-gray-50 p-6 rounded-xl shadow w-full">
              <h2 className="text-2xl font-semibold mb-4">Comments</h2>
              <ul className="space-y-4">
                {comment.map((comment, index) => (
                  <li key={index} className="bg-white p-4 rounded-md shadow-sm">
                    <p className="text-sm text-gray-500">{comment.time}</p>
                    <p className="mt-2 text-gray-800">{comment.comment}</p>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <p className="mt-8 text-center text-gray-500">No comments yet.</p>
          )}
        </div>
      </div>
    </section>
  </Layout>
  );
}

export default PostDetail;