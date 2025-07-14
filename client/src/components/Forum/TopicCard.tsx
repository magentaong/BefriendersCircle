import React from "react";
import { useNavigate } from "react-router-dom";

// Type for individual topic data, defiend in Topic.jsx
interface Data {
  time: string;
  content: string;
  comments: number;
  like: number; 
}
//Props passed to the Category component
interface TopicProps {
  data: Data; // URL to navigate to when the card is clicked
  url: string, // Get Topic data defined in Topic.jsx
}

const TopicCard: React.FC<TopicProps> = ({ data, url}) => {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate(url)}
      className={`p-6 bg-white max-w-[350px] h-[250px] w-full mx-auto rounded-2xl shadow-md text-center flex flex-col items-center justify-center hover:brightness-90 transition`}
    >
      <div className="h-[190px] w-full overflow-hidden">
        <p>{data.content}</p>
      </div>
      <div className="h-[20px] w-full text-center text-charcoal font-heading text-base flex items-center justify-center text-xl">
        {data.time}
      </div>
      <div className="h-[20px] w-full text-center text-charcoal font-heading text-base flex items-center justify-center text-xl">
        <p>{data.comments}</p>
        <img src="/Support/Comment.png" alt="comment" />
      </div>
      <div className="h-[20px] w-full text-center text-charcoal font-heading text-base flex items-center justify-center text-xl">
        <p>{data.like}</p>
        <img src="/Support/Heart.png" alt="like" />
      </div>
    </button>
  );
};

export default TopicCard;
