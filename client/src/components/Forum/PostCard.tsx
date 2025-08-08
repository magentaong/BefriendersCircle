import { Check, FlagTriangleRight, Heart, MessageSquareMore } from "lucide-react";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { div } from "three/tsl";
import { deletePostDetail } from "../../api/forum";
import Time from "./Time";

interface Post {
  pID: string;
  bID: string;
  cID: string;
  message: string;
  likes: number;
  createdAt: string;
  updatedAt: string;
}

interface PostCardProps {
  topic?: string;
  post: Post;
  comments: number;
  liked: boolean;
  likesCount: number;
  handleToggleLike: () => void;
}

const negativeWords = ["bad", "wrong", "ugly", "awful", "terrible", "horrible", "nasty", "poor", "lousy", "disgusting",
  "hate", "rage", "furious", "annoying", "bitter", "resentful", "hostile", "spiteful", "vicious", "vindictive",
  "sad", "depressed", "miserable", "hopeless", "heartbroken", "gloomy", "lonely", "despairing", "downcast", "melancholy",
  "scared", "anxious", "nervous", "frightened", "panicked", "terrified", "paranoid", "uncertain", "worried", "apprehensive",
  "incompetent", "ineffective", "untrustworthy", "dishonest", "lazy", "irresponsible", "rude", "arrogant", "ignorant", "selfish",
  "fuck", "shit", "damn", "bastard", "bitch", "crap", "asshole", "jerk", "moron", "idiot"]

const PostCard: React.FC<PostCardProps> = ({ topic, post, comments, liked, likesCount, handleToggleLike }) => {

  const navigate = useNavigate();

  // Local state to track user report post
  const [report, setReport] = useState(false);
  const [status, setStatus] = useState(false);

  //Function for create new catergory
  const check = async () => {
    try {
      // Replace with actual createCategory function when available
      console.log("Checking post...");
      const wordList = post.message.toLowerCase().split(/\s+/);;

      for (let checkword of wordList) {
        if (negativeWords.includes(checkword)) {
          console.log("Report successfully");
          navigate(-1);
          const data = await deletePostDetail(post.pID);

        }
        else {
          console.log("Report unsuccessful");
          setStatus(true)
        }
      }
    } catch (error) {
      console.error("Failed to report post:");
    }
    finally {
      setTimeout(() => {
        setReport(false);
        setStatus(false)
      }, 1000); // Delay for 1 second (1000 ms)
    }
  };

  return (
    <div className="p-4 md:p-6 bg-white max-w-full rounded-2xl shadow-md text-left">
      <div className="flex flex-row content-center gap-7 justify-between">
        <h1 className="self-auto text-center text-2xl font-bold text-charcoal leading-none self-center">{topic}</h1>
        <button className="w-10 h-10 rounded-full bg-blossom/50 shadow text-lg flex items-center justify-center hover:scale-105" onClick={() => setReport(true)}><FlagTriangleRight></FlagTriangleRight></button>
      </div>
      <div className="max-w-full rounded-2xl text-left">
        <div className="mb-4">
          <p className="text-charcoal wrap-anywhere pt-2">{post.message}</p>
        </div>
        <div className="flex items-center justify-between w-full gap-2">
          <div className="flex justify-between text-charcoal/75 text-sm mb-4">
            <Time time={post.createdAt} />
          </div>
          <div className="h-[20px] text-charcoal font-base text-base flex items-center justify-end text-md gap-1 hover:scale-105" onClick={handleToggleLike}>
            <p>{likesCount}</p>
            <Heart></Heart>
          </div>
        </div>

        <div className="flex space-x-8 text-charcoal text-md">
          {/* Popup to create new*/}
          {report && (
            <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gray-500/50 gap-5 overflow-hidden">
              <div className="bg-white p-8 rounded-xl">
                {!status ? (
                  <div>
                    <h2>Are you sure you want to report this post?</h2>
                    <div className="flex flex-row content-center gap-7 justify-between px-5 pt-5">
                      <button onClick={check} className="text-gray-500 rounded-sm bg-blossom px-4 py-2 whitespace-normal break-words max-w-xs self-center hover:scale-105">Yes</button>
                      <button onClick={() => setReport(false)} className="text-gray-500 rounded-sm bg-blossom px-4 py-2 whitespace-normal break-words max-w-xs self-center hover:scale-105">No</button>
                    </div>
                  </div>
                ) : (
                  <h2>Report unsuccessful.</h2>
                )}

              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PostCard;
