import { Mic, Search } from "lucide-react";

interface SearchBarProps {
  onSearch: (query: string) => void;
  placeholder?: string;
  onVoiceInput?: () => void;
  className?: string;
}

export default function SearchBar({ 
  onSearch, 
  placeholder = "Search resources...", 
  onVoiceInput,
  className = ""
}: SearchBarProps) {
  return (
    <div className={`search-bar ${className}`}>
      <Search className="w-4 h-4 text-charcoal mr-2 flex-shrink-0" />
      <input
        type="text"
        onChange={(e) => onSearch(e.target.value)}
        placeholder={placeholder}
        className="flex-1 bg-transparent outline-none text-sm md:text-base text-charcoal placeholder:text-gray-500"
      />
      {onVoiceInput && (
        <button 
          type="button" 
          onClick={onVoiceInput}
          className="ml-2 p-1.5 rounded-full bg-latte hover:brightness-90 transition-all"
          title="Voice search"
        >
          <Mic className="w-4 h-4 text-charcoal" />
        </button>
      )}
    </div>
  );
}
