import React, { useEffect, useState } from "react";
import Layout from "../components/Layout.tsx";
import { useParams } from "react-router-dom";
import PostCard from "../components/Forum/PostCard.tsx";
import { initPostDetail, postComment, getComments } from "../api/forum.ts";
import Time from "../components/Forum/Time.tsx";


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
  const [currentCommentIndex, setCurrentCommentIndex] = useState(0);
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
      setCurrentCommentIndex(comments.length); //Increment the comment index
    } catch (err) {
      console.error("Failed to post comment", err);
    } finally {
      setPosting(false);
    }
  };

  const handleNext = () => {
    setCurrentCommentIndex((prev) => (prev + 1 < comments.length ? prev + 1 : prev));
  };

  const handlePrevious = () => {
    setCurrentCommentIndex((prev) => (prev > 0 ? prev - 1 : prev));
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
    <Layout header="Community Forum">
      <section>
        <div className="w-full flex justify-center bg-blossom rounded-xl">
          <div className="w-full px-4 sm:px-8 md:px-16 lg:px-24 xl:px-16 mt-6 max-w-4xl">
            <PostCard topic={currentCategory} comments={numComment} post={post} />

            {comments.length > 0 ? (
              <div className="mt-8 bg-gray-50 p-6 rounded-xl shadow text-center w-[80vw] sm:w-[70vw] md:w-[60vw] lg:w-[50vw] xl:w-[40vw] mx-auto">
                <h2 className="text-2xl font-semibold mb-4">Comment</h2>
                <div className="bg-white p-4 rounded-md shadow-sm">
                  <p className="text-sm text-gray-500">
                    <Time time={comments[currentCommentIndex].createdAt} />
                  </p>
                  <p className="mt-2 text-gray-800">{comments[currentCommentIndex].message}</p>
                  <p className="text-sm text-gray-500 mt-4">
                    {`${currentCommentIndex + 1} / ${comments.length} comments`}
                  </p>
                </div>

                <div className="flex justify-between mt-4">
                  <button
                    onClick={handlePrevious}
                    disabled={currentCommentIndex === 0}
                    className={`px-4 py-2 rounded ${
                      currentCommentIndex === 0
                        ? "bg-gray-300 cursor-not-allowed"
                        : "bg-blue-500 text-white hover:bg-blue-600"
                    }`}
                  >
                    Previous
                  </button>
                  <button
                    onClick={handleNext}
                    disabled={currentCommentIndex === comments.length - 1}
                    className={`px-4 py-2 rounded ${
                      currentCommentIndex === comments.length - 1
                        ? "bg-gray-300 cursor-not-allowed"
                        : "bg-blue-500 text-white hover:bg-blue-600"
                    }`}
                  >
                    Next
                  </button>
                </div>
              </div>
            ) : (
              <p className="mt-8 text-center text-gray-500">No comments yet.</p>
            )}

            <div className="m-6">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Add your comment"
                className="w-full p-2 border rounded bg-white"
                rows={3}
                disabled={posting}
              />
              <button
                onClick={handleAddComment}
                disabled={!newComment.trim() || posting}
                className={`mt-2 px-4 py-2 rounded bg-white ${
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