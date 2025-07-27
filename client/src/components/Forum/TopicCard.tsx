import React from "react";
import { useNavigate } from "react-router-dom";

// Type for individual topic data, defiend in Topic.jsx
interface Data {
  pID: string; // unqiure 
  time: string; // date and time of user created post
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
      className={`p-6 bg-white max-w-[350px] h-[250px] w-full mx-auto rounded-2xl shadow-md text-center flex flex-col items-center justify-center hover:brightness-90 transition`}
    >
      <div className="h-[190px] w-full overflow-hidden">
        <p>{data.message}</p>
      </div>
      <div className="h-[20px] w-full text-center text-charcoal font-heading text-base flex items-center justify-center text-xl">
        {data.time}
      </div>
      <div className="h-[20px] w-full text-center text-charcoal font-heading text-base flex items-center justify-center text-xl">
        <p>{comment}</p>
        <img src="/Support/Comment.png" alt="comment" />
      </div>
      <div className="h-[20px] w-full text-center text-charcoal font-heading text-base flex items-center justify-center text-xl">
        <p>{data.likes}</p>
        <img src="/Support/Heart.png" alt="like" />
      </div>
    </button>
  );
};

export default TopicCard;
