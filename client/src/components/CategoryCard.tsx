import React from "react";

interface CategoryCardProps {
  title: string;
  icon: React.ReactNode;
  bg: string;
  path: string;
  navigate: (path: string) => void;
}

const CategoryCard: React.FC<CategoryCardProps> = ({ title, icon, bg, path, navigate }) => {
  return (
    <button
      onClick={() => navigate(path)}
      className={`p-6 ${bg} max-w-[350px] h-[250px] w-full mx-auto rounded-2xl shadow-md text-center flex flex-col items-center justify-center hover:brightness-90 transition`}
    >
      <div className="h-[190px] w-full overflow-hidden">
        {icon}
      </div>
      <div className="h-[20px] w-full text-center text-charcoal font-heading text-base flex items-center justify-center text-xl">
        {title}
      </div>
    </button>
  );
};

export default CategoryCard;
