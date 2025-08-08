import React from "react";
import { useNavigate } from "react-router-dom";
import { Heart, MessageSquareMore } from "lucide-react";
import Time from "./Time";

// Type for individual topic data, defiend in Topic.jsx
interface Data {
  pID: string; // unqiure 
  createdAt: string; // date and time of user created post
  message: string; // Content of the post (e.g. "I need help...")
  comments: number; // Number of people commented on post
  likes: number; // Number of people like the post
}
//Props passed to the Category component
interface TopicProps {
  comment: number;
  data: Data; // URL to navigate to when the card is clicked
  url: string, // Get Topic data defined in Topic.jsx
}

const TopicCard: React.FC<TopicProps> = ({comment, data, url}) => {
  const navigate = useNavigate();
  return (
    <button
      onClick={() => navigate(url)}
      className={`p-5 bg-white max-w-[350px] h-[250px] w-full mx-auto rounded-2xl shadow-md text-center flex flex-col items-center justify-center hover:scale-105 transition`}>
      <div className="h-[190px] w-full overflow-hidden">
        <p>{data.message}</p>
      </div>
      <div className="flex flex-row gap-2 justify-between w-full items-end">
        
        <div className="h-full w-full tracking-tight text-charcoal font-base text-base flex justify-left text-md items-end">
          <Time time={data.createdAt}/>
        </div>

        <div className="flex flex-col gap-2 justify-between mt-4 mb-1.5">
          <div className="h-[20px] text-right text-charcoal font-base text-base flex items-center justify-end text-md gap-1">
            <p>{comment}</p>
            <MessageSquareMore></MessageSquareMore>
          </div>
          <div className="h-[20px] text-right text-charcoal font-base text-base flex items-center justify-end text-md gap-1">
            <p>{data.likes}</p>
            <Heart></Heart>
          </div>
        </div>
      </div>
    </button>
  );
};

export default TopicCard;
