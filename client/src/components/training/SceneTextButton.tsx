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
      className={`p-6 ${bg} max-w-[350px] h-[100px] w-full mx-auto rounded-2xl shadow-md text-center flex items-center justify-center hover:brightness-90 transition disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
    >
      <span className="text-black text-m font-semibold">{title}</span>
    </button>
  );
};

export default SceneTextButton;
