import React from "react";
import { useNavigate } from "react-router-dom";

interface CardBaseProps {
  title: string;
  icon: string;
  bg: string;
  path: string;
}

const CardBase: React.FC<CardBaseProps> = ({ title, icon, bg, path}) => {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate(path)}
      className={`p-6 ${bg} max-w-[350px] h-[250px] w-full mx-auto rounded-2xl shadow-md text-center flex flex-col items-center justify-center hover:brightness-90 transition`}
    >
      <div className="h-[190px] w-full overflow-hidden">
        <img src={icon} alt="Community Support Image" className="w-full h-full object-cover" />
      </div>
      <div className="h-[20px] w-full text-center text-charcoal font-heading text-base flex items-center justify-center text-xl">
        {title}
      </div>
    </button>
  );
};

export default CardBase;
