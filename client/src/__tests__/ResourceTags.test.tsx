import { render, screen } from "@testing-library/react";
import TagFilterGrid from "../components/resources/TagFilterGrid";
import type { ResourceChat } from "../hooks/useResourceChat";

const mockResources: ResourceChat[] = [
  {
    _id: "1",
    title: "Community Support Groups",
    description: "Support groups for all.",
    category: "General",
    tags: ["community", "support", "social"],
  },
  {
    _id: "2",
    title: "Senior Education Programs",
    description: "Learning for seniors.",
    category: "General",
    tags: ["support", "education"],
  },
  {
    _id: "3",
    title: "Financial Aid for Seniors",
    description: "Aid for elderly citizens.",
    category: "Financial",
    tags: ["financial", "seniors", "government"],
  },
  {
    _id: "4",
    title: "Healthcare Resources",
    description: "Medical care info.",
    category: "Medical",
    tags: ["healthcare", "medical", "seniors"],
  },
];

const mockRenderContent = () => <div>content</div>;

describe("<TagFilterGrid />", () => {
  it("renders all unique tags with correct counts", () => {
    render(
      <TagFilterGrid
        resources={mockResources}
        renderContent={mockRenderContent}
        selectedTag={null}
        setSelectedTag={() => {}}
        expandedCardId={null}
        setExpandedCardId={() => {}}
      />
    );
    // Tag "support" appears in 2 resources
    expect(screen.getByText(/support\s*\(\s*2\s*\)/i)).toBeInTheDocument();
    // Tag "seniors" appears in 2 resources
    expect(screen.getByText(/seniors\s*\(\s*2\s*\)/i)).toBeInTheDocument();
    // Tag "community" appears in 1 resource
    expect(screen.getByText(/community\s*\(\s*1\s*\)/i)).toBeInTheDocument();
    // Tag "education" appears in 1 resource
    expect(screen.getByText(/education\s*\(\s*1\s*\)/i)).toBeInTheDocument();
    // Tag "financial" appears in 1 resource
    expect(screen.getByText(/financial\s*\(\s*1\s*\)/i)).toBeInTheDocument();
    // Tag "government" appears in 1 resource
    expect(screen.getByText(/government\s*\(\s*1\s*\)/i)).toBeInTheDocument();
    // Tag "healthcare" appears in 1 resource
    expect(screen.getByText(/healthcare\s*\(\s*1\s*\)/i)).toBeInTheDocument();
    // Tag "medical" appears in 1 resource
    expect(screen.getByText(/medical\s*\(\s*1\s*\)/i)).toBeInTheDocument();
    // Tag "social" appears in 1 resource
    expect(screen.getByText(/social\s*\(\s*1\s*\)/i)).toBeInTheDocument();
  });

  it("shows selected tag as highlighted", () => {
    render(
      <TagFilterGrid
        resources={mockResources}
        renderContent={mockRenderContent}
        selectedTag="support"
        setSelectedTag={() => {}}
        expandedCardId={null}
        setExpandedCardId={() => {}}
      />
    );
    // Only "support" tag should have the selected background color
    const supportTag = screen.getByText(/support\s*\(\s*2\s*\)/i);
    expect(supportTag).toHaveClass("bg-[#b8d8c8]");
  });

  it("renders 'Clear' button when a tag is selected", () => {
    render(
      <TagFilterGrid
        resources={mockResources}
        renderContent={mockRenderContent}
        selectedTag="support"
        setSelectedTag={() => {}}
        expandedCardId={null}
        setExpandedCardId={() => {}}
      />
    );
    expect(screen.getByText("Clear")).toBeInTheDocument();
  });

  it("does not render 'Clear' button when no tag is selected", () => {
    render(
      <TagFilterGrid
        resources={mockResources}
        renderContent={mockRenderContent}
        selectedTag={null}
        setSelectedTag={() => {}}
        expandedCardId={null}
        setExpandedCardId={() => {}}
      />
    );
    expect(screen.queryByText("Clear")).toBeNull();
  });

  it("filters and displays only resources with the selected tag", () => {
    // Filter by the tag 'support'
    render(
      <TagFilterGrid
        resources={mockResources}
        renderContent={mockRenderContent}
        selectedTag="support"
        setSelectedTag={() => {}}
        expandedCardId={null}
        setExpandedCardId={() => {}}
      />
    );

    // Should show ONLY resources containing the 'support' tag
    expect(screen.getByText("Community Support Groups")).toBeInTheDocument();
    expect(screen.getByText("Senior Education Programs")).toBeInTheDocument();

    // Should NOT show any resources that don't have the 'support' tag
    expect(screen.queryByText("Financial Aid for Seniors")).toBeNull();
    expect(screen.queryByText("Healthcare Resources")).toBeNull();
  });
});
