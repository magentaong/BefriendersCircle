import React, { useEffect, useState } from "react";
import Layout from "../components/Layout.tsx";
import { Link, useParams } from "react-router-dom";
import PostCard from "../components/Forum/PostCard.tsx";
import { initPostDetail, postComment, getComments, checkUserLiked, toggleLike } from "../api/forum.ts";
import Time from "../components/Forum/Time.tsx";
import { ArrowLeft } from "lucide-react";
import Badge from "react-bootstrap/Badge";

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
  const [loadError, setLoadError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const cID = localStorage.getItem("cID") || "anonymous";
  const [characterLimit] = useState(280);

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
          setLoadError("Post not found.");
        }
      })
      .catch(() => {
        setLoadError("Failed to load post details.");
      })
      .finally(() => setLoading(false));

    getComments(postId).then(data => {
      console.log(data)
      if (data) {
        console.log(data.length)
        setNumComment(data.length);
      } else {
        setLoadError("Comment Count not found.");
      }
    })
      .catch(() => {
        setLoadError("Failed to load comment count.");
      })
      .finally(() => setLoading(false));
    checkUserLiked(cID, postId).then(data => { setLiked(data.liked); });
  }, [postId]);


  const handleAddComment = async () => {
    // Validate input first
    if (newComment.length > characterLimit) {
      setError(`Comment exceeds ${characterLimit} characters.`);
      return;
    }
    if (newComment.trim().length === 0) {
      setError("Comment cannot be empty.");
      return;
    }

    setError("");
    setPosting(true);

    try {
      const userCID = localStorage.getItem("cID") || "anonymous";
      if (!postId) throw new Error("Invalid post ID");

      const createdComment = await postComment(userCID, postId, newComment.trim());
      setComments(prev => [...prev, createdComment]);
      setNewComment("");
      setNumComment(prev => prev + 1);
    } catch (err) {
      console.error("Failed to post comment", err);
      setError("Failed to post comment. Please try again.");
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
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-charcoal"></div>
          <span className="ml-3 text-charcoal">Loading post details...</span>
        </div>
      </Layout>
    );
  }

  if (loadError || !post) {
    return (
      <Layout header="Error">

        <p className="text-center mt-8 text-lg text-red-600">{error || "Post not found."}</p>

      </Layout>
    );
  }


  return (
    <Layout header="Community Forum">
      {/* Back Function */}
      <div className="flex items-center justify-between w-full gap-2 mb-4 md:mb-6">
        <Link to={"/forum/" + currentCategory}>
          <button className="w-12 h-12 rounded-full bg-blossom shadow text-lg flex items-center justify-center hover:scale-105"><ArrowLeft></ArrowLeft></button>
        </Link>

        {/* Title Card */}
        <h1 className="w-full h-12 rounded-full bg-blossom shadow text-lg flex items-center justify-center gap-2 text-sm sm:text-md md:text-lg font-bold text-charcoal">Community Forum</h1>

      </div>

      <section className="section-container flex w-full justify-center">
        <div className="section-container w-full bg-blossom p-5 md:p-8 rounded-xl">
          <PostCard
            topic={currentCategory}
            comments={numComment}
            post={post}
            liked={liked}
            likesCount={likesCount}
            handleToggleLike={handleToggleLike}
          />

          {/* View Comments */}
          <div className="mt-5 md:mt-8 bg-white p-4 md:p-5 rounded-xl shadow w-full">
            <h2 className="text-left text-xl font-bold text-charcoal leading-none self-center pb-5">Comments</h2>

            {comments.length > 0 ? (
              <div className="pb-5 overflow-y-auto max-h-[400px]">
                <ul className="space-y-4">
                  {comments.map((c) => (
                    <li key={c._id} className="bg-blossom/50 p-4 rounded-md shadow-sm">
                      <p className="text-sm text-gray-500"> <Time time={c.createdAt} /></p>
                      <p className="mt-2 text-gray-800">{c.message}</p>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <p className="text-center text-charcoal">No comments yet.</p>
            )}
          </div>

          <div className="mt-5 md:mt-8 bg-white p-4 md:p-6 rounded-xl shadow-md">
            <h3 className="text-base md:text-lg font-bold text-charcoal mb-3 md:mb-4">
              Add a Comment
            </h3>

            <textarea
              value={newComment}
              onChange={(e) => {
                const text = e.target.value;
                setNewComment(text);

                if (text.length > characterLimit) {
                  setError(`Comment exceeds ${characterLimit} characters.`);
                } else {
                  setError("");
                }
              }}
              placeholder="Share your thoughts..."
              className="w-full p-3 md:p-4 border-2 border-blossom rounded-xl bg-white text-charcoal placeholder:text-gray-500 focus:outline-none resize-none break-words"
              rows={3}
              disabled={posting}
            />

            <div className="flex items-center justify-between mt-6">
              {/* Error message */}
              <div className="min-w-[100px]">
                {error && (
                  <p className="text-red-600 font-bold text-sm m-0 text-overflow">
                    {error}
                  </p>
                )}
              </div>

              {/* Right Counter */}
              <Badge
                className={`px-2 py-1 rounded ${newComment.length > characterLimit ? "bg-red-300" : "bg-gray-200"}`}
              >
                {newComment.length}/{characterLimit}
              </Badge>
            </div>

            <button
              onClick={handleAddComment}
              disabled={
                !newComment.trim() ||
                posting ||
                newComment.length > characterLimit
              }
              className={`mt-3 md:mt-4 px-4 md:px-6 py-2 md:py-3 rounded-xl font-semibold transition-all ${newComment.trim() &&
                !posting &&
                newComment.length <= characterLimit
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