import React from "react";
import TagPill from "./common/TagPill";

interface ModularCardProps {
  id: string;
  title: string;
  description: string;
  tags: string[];
  image?: string;
  url?: string;
}

export default function ModularCard({ 
  id, 
  title, 
  description, 
  tags, 
  image, 
  url 
}: ModularCardProps) {
  return (
    <div className="resource-card">
      {/* Card Header */}
      <div className="flex items-start justify-between mb-4">
        {image && (
          <div className="w-12 h-12 md:w-16 md:h-16 rounded-xl overflow-hidden bg-latte flex-shrink-0">
            <img 
              src={image} 
              alt={title}
              className="w-full h-full object-cover"
            />
          </div>
        )}
        <div className="flex-1 ml-3 md:ml-4">
          <h3 className="text-base md:text-lg font-bold text-charcoal mb-2 leading-tight">
            {title}
          </h3>
          <p className="text-sm text-charcoal leading-relaxed">
            {description}
          </p>
        </div>
      </div>

      {/* Tags */}
      {tags && tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {tags.map((tag, index) => (
            <TagPill key={index} text={tag} />
          ))}
        </div>
      )}

      {/* Action Button */}
      {url && (
        <button 
          className="btn-primary w-full"
          onClick={() => window.open(url, '_blank')}
        >
          Learn More
        </button>
      )}
    </div>
  );
}