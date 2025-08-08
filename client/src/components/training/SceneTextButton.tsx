import React from "react";

interface SceneTextButtonProps {
  title: string;
  bg: string;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
}

const SceneTextButton: React.FC<SceneTextButtonProps> = ({ title, bg, onClick, disabled = false, className = "", }) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`p-2 ${bg} max-w-[350px] h-[80px] w-full mx-auto rounded-2xl shadow-md text-center flex flex-col items-center justify-center transform transition-transform duration-300 ease-in-out hover:scale-105 will-change-transform ${className}`}
    >
      <span className="text-black text-m font-semibold">{title}</span>
    </button>
  );
};

export default SceneTextButton;
