import { Check } from "lucide-react";
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
        else{
          console.log("Report unsuccessful");
          setStatus(true)
        }
      }
     } catch (error) {
       console.error("Failed to report post:");
     }
        finally{
          setTimeout(() => {
            setReport(false);
            setStatus(false)
          }, 1000); // Delay for 1 second (1000 ms)
        }
       };

  return (
    <div className="p-6 bg-white max-w-full rounded-2xl shadow-md text-left">
      <div className="flex flex-row content-center gap-7 justify-between">
        <h1 className="self-auto text-center text-2xl font-bold text-gray-600 leading-none self-center">{topic}</h1>
        <button className="p-2" onClick={() => setReport(true)}><img src="/Support/Report.png" alt="add" /></button>
      </div>
      <div className="max-w-full rounded-2xl text-left">
        <div className="mb-4">
          <p className="text-gray-700">{post.message}</p>
        </div>
        <div className="flex justify-between text-gray-600 text-sm mb-4">
          <Time time={post.createdAt}/>
        </div>
        <div className="flex space-x-8 text-gray-700 text-lg">
          <div className="flex items-center space-x-2 cursor-pointer select-none">
            <img src="/Support/Comment.png" alt="comments" className="w-6 h-6" />
            <span>{comments}</span>
          </div>
        <div className="flex items-center space-x-2 cursor-pointer select-none" onClick={handleToggleLike}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className={`h-6 w-6 ${liked ? "fill-red-500 stroke-red-600" : "fill-none stroke-gray-500"}`}
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 016.364 0L12 7.636l1.318-1.318a4.5 4.5 0 016.364 6.364L12 21l-7.682-7.682a4.5 4.5 0 010-6.364z" />
          </svg>
          <span className="text-gray-700 font-semibold">{likesCount}</span>
        </div>

          {/* Popup to create new*/}
                {report && (
                  <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gray-500/50 gap-5 overflow-hidden">
                    <div className="bg-white p-8 rounded-xl">
                      {!status ? (
                        <div>
                          <h2>Confirm to report this post?</h2>
                          <div className="flex flex-row content-center gap-7 justify-between px-5 mt-2">
                            <button onClick={check} className="text-gray-500 rounded-sm bg-blossom px-4 py-2 whitespace-normal break-words max-w-xs self-center">Yes</button>
                            <button onClick={() => setReport(false)} className="text-gray-500 rounded-sm bg-blossom px-4 py-2 whitespace-normal break-words max-w-xs self-center">No</button>
                          </div>
                        </div>
                      ) : (
                        <h2>Report unsuccessful</h2>
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
