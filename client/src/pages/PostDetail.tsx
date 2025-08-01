import React, { useEffect, useState } from "react";
import Layout from "../components/Layout.tsx";
import { useParams } from "react-router-dom";
import PostCard from "../components/Forum/PostCard.tsx";
import { initPostDetail, postComment, getComments,checkUserLiked, toggleLike } from "../api/forum.ts";
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
  const [newComment, setNewComment] = useState("");
  const [numComment, setNumComment] = useState(0);
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const cID = localStorage.getItem("cID") || "anonymous";


  useEffect(() => {
    if (!postId) return;

    setLoading(true);
    setError(null);

    initPostDetail(postId)
      .then(data => {
        if (data?.post) {
          setPost(data.post);
          setComments(data.comments || []);
          setLikesCount(data.post.likes);
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
    checkUserLiked(cID, postId).then(data => {setLiked(data.liked);});
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

  const handleToggleLike = async () => {
    const cID = localStorage.getItem("cID") || "";
    if (!cID || !postId) return;

    try {
      const data = await toggleLike(cID, postId);
      setLiked(data.liked);
      setLikesCount(prev => data.liked ? prev + 1 : prev - 1);
    } catch (err) {
      console.error("Failed to toggle like", err);
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
    <Layout header="Community Forum">
      <section className="w-full max-w-4xl mx-auto px-4 md:px-6 py-4 md:py-6">
        <div className="bg-blossom rounded-2xl p-4 md:p-6 shadow-md">
          <PostCard
          topic={currentCategory}
          comments={numComment}
          post={post}
          liked={liked}
          likesCount={likesCount}
          handleToggleLike={handleToggleLike}
          />

            {comments.length > 0 ? (
              <div className="mt-8 bg-gray-50 p-6 rounded-xl shadow overflow-y-auto max-h-[400px] w-full max-w-[600px]">
                <h2 className="self-auto text-left text-2xl font-bold text-gray-600 leading-none self-center pb-4">Comments</h2>
                <ul className="space-y-4">
                  {comments.map((c) => (
                    <li key={c._id} className="bg-white p-4 rounded-md shadow-sm">
                      <p className="text-sm text-gray-500"> <Time time={c.createdAt}/></p>
                      <p className="mt-2 text-gray-800">{c.message}</p>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <p className="mt-8 text-center text-gray-500">No comments yet.</p>
            )}

          <div className="mt-6 md:mt-8 bg-white p-4 md:p-6 rounded-xl shadow-md">
            <h3 className="text-base md:text-lg font-bold text-charcoal mb-3 md:mb-4">Add a Comment</h3>
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Share your thoughts..."
              className="w-full p-3 md:p-4 border-2 border-canary rounded-xl bg-white text-charcoal placeholder:text-gray-500 focus:outline-none resize-none"
              rows={3}
              disabled={posting}
            />
            <button
              onClick={handleAddComment}
              disabled={!newComment.trim() || posting}
              className={`mt-3 md:mt-4 px-4 md:px-6 py-2 md:py-3 rounded-xl font-semibold transition-all ${
                newComment.trim() && !posting
                  ? "bg-latte text-charcoal hover:brightness-90"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
            >
              {posting ? "Posting..." : "Post Comment"}
            </button>
          </div>
        </div>
      </section>
    </Layout>
  );
  }
export default PostDetail;