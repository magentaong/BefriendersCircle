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
}

const negativeWords = ["fuck", "hate", "shit"]

const PostCard: React.FC<PostCardProps> = ({ topic, post, comments }) => {

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
          <div className="flex items-center space-x-2 cursor-pointer select-none">
            <img src="/Support/Heart.png" alt="likes" className="w-6 h-6" />
            <span>{post.likes}</span>
          </div>

          {/* Popup to create new*/}
                {report && (
                  <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gray-500/50 gap-5 overflow-hidden">
                    <div className="bg-white p-8 rounded-xl">
                      {!status ? (
                        <div>
                          <h2>Confrim to report this post?</h2>
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
