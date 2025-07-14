import { useState } from 'react';
import supportResources from "../../content/resources.json"
import CategoryCard from "../common/CardBase"

//Defines a single resource object with a name and image URL from database
interface Resources {
  name: string; // Name of the catergory (Family)
  image: string; // URL or path to the catergory's image
}

//Props passed to the Category component
interface CategroryProps {
  category: string; // The key used to filter resources by category database
  header?: string; // Optional heading to display on the page
}

// This maps category names (like "mentalHealth") to arrays of resource objects
// Replace this with backend integration in the future
const resources: Record<string, Resources[]> = supportResources;

export default function Category({category, header}: CategroryProps) {
  
  // Local state to track user search input
  const [searchTerm, setSearchTerm] = useState('');

  // Filter the resources based on the search term based on word user input 
  const filteredResources = resources[category].filter((resource) =>
    resource.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

    return (
        <>
        <section>
            <div className="section-container">
              {/* DIfferent type of Catergory heading */}
                <h1 className="text-center text-4xl font-bold">{header}</h1>
                 
                 {/* Search input field */}
                 <input
                    type="text"
                    placeholder="Search..."
                    className="border p-2 mt-4"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)} // Update the search term
                />

                {/* Grid of all/filtered resource cards */}
                <div className="mt-6 grid grid-cols-2 gap-16">
                    {filteredResources.map(resource => (
                        <div className="col-span-2 lg:col-span-1" key={resource.name}>
                            <CategoryCard title={resource.name} icon={resource.image} bg="bg-white"path={`./${resource.name}`}/>
                        </div>
                    ))}
                </div>
            </div>
        </section>
        
    </>
    )
}



