import React from "react";
import { useNavigate } from "react-router-dom";


interface Data {
  url: string;
  time: string;
  content: string;
  comments: number;
  like: number;
}

interface TopicProps {
  data: Data;
}

const CategoryCard: React.FC<TopicProps> = ({ data }) => {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate(data.url)}
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

export default CategoryCard;
