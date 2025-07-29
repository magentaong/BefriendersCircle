import React from "react";

interface TagPillProps {
  text: string;
  color?: string;
}

const TagPill: React.FC<TagPillProps> = ({ text, color = "blossom" }) => {
  const colorClasses = {
    blossom: "bg-blossom text-charcoal",
    pistachio: "bg-pistachio text-charcoal", 
    serene: "bg-serene text-charcoal",
    canary: "bg-canary text-charcoal",
    latte: "bg-latte text-charcoal"
  };

  return (
    <span className={`tag-pill ${colorClasses[color as keyof typeof colorClasses] || colorClasses.blossom}`}>
      {text}
    </span>
  );
};

export default TagPill;
