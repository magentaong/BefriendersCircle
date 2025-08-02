import { ChevronDown } from "lucide-react";
import type { ResourceChat } from "../hooks/useResourceChat";

export type Resource = ResourceChat;

interface Props {
  resources: Resource[];
  renderContent: (res: Resource) => React.ReactNode;
}

interface Props {
  resources: Resource[];
  renderContent: (res: Resource) => React.ReactNode;
  selectedTag: string | null;
  setSelectedTag: (tag: string | null) => void;
  expandedCardId: string | null;
  setExpandedCardId: (id: string | null) => void;
}

const TagFilterGrid: React.FC<Props> = ({
  resources,
  renderContent,
  selectedTag,
  setSelectedTag,
  expandedCardId,
  setExpandedCardId,
}) => {
  const tagMap = resources.reduce((acc: Record<string, number>, res) => {
    (res.tags || []).forEach((tag: string) => {
      acc[tag] = (acc[tag] || 0) + 1;
    });
    return acc;
  }, {});

  const filteredResources = selectedTag
    ? resources.filter((res) => res.tags?.includes(selectedTag))
    : [];

  return (
    <div className="mt-8 text-left">
      <div className="mb-4">
        <div
          className="flex gap-2 overflow-x-auto whitespace-nowrap px-10 py-2 no-scrollbar"
        >
            {selectedTag && (
            <button
              onClick={() => setSelectedTag(null)}
              className="ml-4 px-3 py-1 rounded-full text-xs bg-gray-200 hover:bg-gray-300 flex-shrink-0"
            >
              Clear
            </button>
            )}

          {Object.entries(tagMap).map(([tag, count]) => (
            <div
              key={tag}
              className={`inline-block cursor-pointer px-4 py-2 rounded-xl shadow text-sm font-medium border transition flex-shrink-0 hover:bg-[#d3e8dc] ${
                selectedTag === tag ? "bg-[#b8d8c8]" : "bg-white"
              }`}
              onClick={() => setSelectedTag(tag)}
            >
              {tag} ({count})
            </div>
          ))}

        
        </div>
      </div>

      {(selectedTag && filteredResources.length > 0) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 items-start">
          {filteredResources.map((res) => (
            <div
              key={res._id}
              onClick={() => {
                if (expandedCardId === res._id) {
                  if (res.link) window.open(res.link, "_blank");
                } else {
                  setExpandedCardId(res._id || "temp-id");
                }
              }}
              className="bg-[#c9e2d6] rounded-2xl p-2 shadow hover:bg-[#b8d8c8] cursor-pointer transition-all duration-300 ease-in-out"
            >
              <h3 className="font-bold text-lg mb-2">{res.title || "Untitled Resource"}</h3>

              <div
                className={`relative bg-white p-3 rounded-lg shadow text-sm space-y-2 transition-all duration-300 ease-in-out overflow-hidden ${
                  expandedCardId === res._id ? "max-h-[1000px]" : "max-h-[200px]"
                }`}
              >
                <div className="break-words">{renderContent(res)}</div>

                {expandedCardId !== res._id && (
                  <div className="absolute bottom-0 left-0 w-full h-10 bg-gradient-to-t from-white to-transparent pointer-events-none rounded-b-lg" />
                )}
              </div>

              {expandedCardId !== res._id && (
                <div className="flex justify-center mb-1 p-2">
                  <ChevronDown className="w-4 h-4 text-gray-700 animate-bounce" />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TagFilterGrid;