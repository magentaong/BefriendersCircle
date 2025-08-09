// Unused code

interface ResourceCardProps {
  title: string;
  description: string;
  url?: string;
  tags?: string[];
  isLoading?: boolean;
}

export default function ResourceCard({
  title,
  description,
  url,
  tags = [],
  isLoading = false,
}: ResourceCardProps) {
  return (
    <div className="bg-[#c9e2d6] p-4 rounded-xl shadow relative">
      <h3 className="font-bold text-lg">{title}</h3>
      <div className="mt-3 text-sm whitespace-pre-wrap">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center animate-fadeInSlow">
            <div className="w-6 h-6 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin"></div>
            <span className="text-gray-500 text-sm mt-2">Loading...</span>
          </div>
        ) : (
          description
        )}
      </div>
      {url && (
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-700 underline text-sm mt-3 block"
        >
          Learn more
        </a>
      )}
      {tags.length > 0 && (
        <div className="text-xs mt-2 text-gray-600">
          Tags: {tags.join(", ")}
        </div>
      )}
    </div>
  );
}
