import React, { useState } from 'react';
import supportResources from "../../content/resources.json"
import CategoryCard from "../CardBase.tsx"

interface Resources {
  name: string;
  image: string;
  url: string;
}

interface CategroryProps {
  category: string;
  header?: string;
}

const resources: Record<string, Resources[]> = supportResources;

export default function Category({category, header}: CategroryProps) {
     
  const [searchTerm, setSearchTerm] = useState('');

  // Filter the resources based on the search term based on word user input 
  const filteredResources = resources[category].filter((resource) =>
    resource.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

    return (
        <>
        <section>
            <div className="section-container">
                <h1 className="text-center text-4xl font-bold">{header}</h1>
                 <input
                    type="text"
                    placeholder="Search..."
                    className="border p-2 mt-4"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)} // Update the search term
                />
                <div className="mt-6 grid grid-cols-2 gap-16">
                    {filteredResources.map(resource => (
                        <div className="col-span-2 lg:col-span-1" key={resource.name}>
                            <CategoryCard title={resource.name} icon={resource.image} bg="bg-white"path={resource.url}/>
                        </div>
                    ))}
                </div>
            </div>
        </section>
        
    </>
    )
}



