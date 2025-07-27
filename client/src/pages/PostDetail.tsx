import React, { useEffect, useState } from "react";
import Layout from "../components/Layout.tsx";
import { useParams } from "react-router-dom";
import PostCard from "../components/Forum/PostCard.tsx";
import { initPostDetail, postComment, getComments } from "../api/forum.ts";


interface Comment {
  _id: string;
  pID: string;
  cID: string;
  message: string;
  likes: number;
  createdAt: string;
}

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

function PostDetail() {
  const { currentCategory, postId } = useParams<{ currentCategory: string; postId: string }>();
  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [numComment, setNumComment] = useState(0);
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!postId) return;

    setLoading(true);
    setError(null);

    initPostDetail(postId)
      .then(data => {
        if (data?.post) {
          setPost(data.post);
          setComments(data.comments || []);
        } else {
          setError("Post not found.");
        }
      })
      .catch(() => {
        setError("Failed to load post details.");
      })
      .finally(() => setLoading(false));

      getComments(postId).then(data => {
        console.log(data)
        if (data) {
          console.log(data.length)
          setNumComment(data.length);
        } else {
          setError("Comment Count not found.");
        }
      })
      .catch(() => {
        setError("Failed to load comment count.");
      })
      .finally(() => setLoading(false));
  }, [postId]);

  const handleAddComment = async () => {
    if (!postId || !newComment.trim()) return;

    setPosting(true);
    try {
      const cID = localStorage.getItem("cID") || "anonymous";
      const createdComment = await postComment(cID, postId, newComment.trim());
      setComments(prev => [...prev, createdComment]);
      setNewComment("");
      setNumComment(prev => prev + 1); // Increment the comment count
    } catch (err) {
      console.error("Failed to post comment", err);
    } finally {
      setPosting(false);
    }
  };

  if (loading) {
    return (
      <Layout header="Loading...">
        <p className="text-center mt-8 text-lg">Loading post details...</p>
      </Layout>
    );
  }

  if (error || !post) {
    return (
      <Layout header="Error">
        <p className="text-center mt-8 text-lg text-red-600">{error || "Post not found."}</p>
      </Layout>
    );
  }

return (
    <Layout header={currentCategory}>
      <section>
        <div className="w-full flex justify-center">
          <div className="w-full px-4 sm:px-8 md:px-16 lg:px-24 xl:px-32 mt-6 max-w-4xl">
            <PostCard comments={numComment} post={post} />

            {comments.length > 0 ? (
              <div className="mt-8 bg-gray-50 p-6 rounded-xl shadow w-full">
                <h2 className="text-2xl font-semibold mb-4">Comments</h2>
                <ul className="space-y-4">
                  {comments.map((c) => (
                    <li key={c._id} className="bg-white p-4 rounded-md shadow-sm">
                      <p className="text-sm text-gray-500">{new Date(c.createdAt).toLocaleString()}</p>
                      <p className="mt-2 text-gray-800">{c.message}</p>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <p className="mt-8 text-center text-gray-500">No comments yet.</p>
            )}

            <div className="mt-6">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Add your comment"
                className="w-full p-2 border rounded"
                rows={3}
                disabled={posting}
              />
              <button
                onClick={handleAddComment}
                disabled={!newComment.trim() || posting}
                className={`mt-2 px-4 py-2 rounded ${
                  newComment.trim() && !posting
                    ? "bg-blue-600 text-white hover:bg-blue-700"
                    : "bg-gray-300 cursor-not-allowed"
                }`}
              >
                {posting ? "Posting..." : "Post Comment"}
              </button>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}

export default PostDetail;

/* IF WANT TO REUSE ADD COMPONENT
import React, { useEffect, useState } from "react";
import Layout from "../components/Layout.tsx";
import { useParams } from "react-router-dom";
import PostCard from '../components/Forum/PostCard.tsx';
import { initPostDetail, postComment } from "../api/forum.ts";
import Add from "../components/Forum/Add.tsx";

interface Comment {
  _id: string;
  pID: string;
  cID: string;
  message: string;
  likes: number;
  createdAt: string;
}

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

function PostDetail() {
  const { currentCategory, postId } = useParams<{ currentCategory: string; postId: string }>();

  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [showAddComment, setShowAddComment] = useState(false);

  useEffect(() => {
    if (!postId) return;

    setLoading(true);
    setFetchError(null);

    initPostDetail(postId)
      .then(data => {
        if (!data.post) {
          setFetchError("Post not found.");
          setPost(null);
          setComments([]);
        } else {
          setPost(data.post);
          setComments(data.comments || []);
        }
      })
      .catch(() => {
        setFetchError("Failed to load post details.");
      })
      .finally(() => setLoading(false));
  }, [postId]);

  const handleSubmitComment = async (txt: string) => {
    if (!postId || !txt.trim()) return;

    try {
      const cID = localStorage.getItem("cID") || "anonymous";
      const createdComment = await postComment(cID, postId, txt.trim());
      setComments(prev => [...prev, createdComment]);
      setShowAddComment(false);
    } catch (error) {
      console.error("Failed to post comment", error);
    }
  };

  if (loading) {
    return (
      <Layout header="Loading...">
        <p className="text-center mt-8 text-lg">Loading post details...</p>
      </Layout>
    );
  }

  if (fetchError) {
    return (
      <Layout header="Error">
        <p className="text-center mt-8 text-lg text-red-600">{fetchError}</p>
      </Layout>
    );
  }

  if (!post) {
    return (
      <Layout header="Post Not Found">
        <p className="text-center mt-8 text-lg text-red-600">Post not found.</p>
      </Layout>
    );
  }

  return (
    <Layout header={currentCategory}>
      <section>
        <div className="w-full flex justify-center">
          <div className="w-full px-4 sm:px-8 md:px-16 lg:px-24 xl:px-32 mt-6">
            <PostCard post={post} />

            {comments.length > 0 ? (
              <div className="mt-8 bg-gray-50 p-6 rounded-xl shadow w-full">
                <h2 className="text-2xl font-semibold mb-4">Comments</h2>
                <ul className="space-y-4">
                  {comments.map((c) => (
                    <li key={c._id} className="bg-white p-4 rounded-md shadow-sm">
                      <p className="text-sm text-gray-500">{new Date(c.createdAt).toLocaleString()}</p>
                      <p className="mt-2 text-gray-800">{c.message}</p>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <p className="mt-8 text-center text-gray-500">No comments yet.</p>
            )}

            <div className="mt-6 flex justify-center">
              <button
                onClick={() => setShowAddComment(true)}
                className="px-6 py-3 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Add Comment
              </button>
            </div>
          </div>
        </div>
      </section>

      {showAddComment && (<Add clickFunction={handleSubmitComment}
        category="Comment"
        />
      )}
    </Layout>
  );
}

export default PostDetail;
*/