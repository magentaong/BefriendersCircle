import { useEffect, useState } from 'react';
import CategoryCard from "../common/CardBase"
import SearchBar from '../common/SearchBar'; 
import { initTopics, postTopic } from "../../api/forum";
import Add from '../Forum/Add.tsx'
import { Plus } from 'lucide-react';

//Defines a single resource object with a name and image URL from database
interface Resources {
  name: string; // Name of the catergory (Family)
  coverImg: string; // URL or path to the catergory's image
  category: string;
}

//Props passed to the Category component
interface CategroryProps {
  category: string; // The key used to filter resources by category database
  header?: string; // Optional heading to display on the page
}

export default function Category({category, header}: CategroryProps) {
  
  // Local state to track user search input
  const [searchTerm, setSearchTerm] = useState('');
  const [resources, setResources] = useState<Resources[]>([]);

  const fetchResources = async () => {
      try {
        const data = await initTopics(category);
        console.log(data);
        console.log('initTopics data:', data);  // Should log your mock data
        setResources(data);  // Set the resolved data here
      } catch (error) {
        console.error("Failed to fetch resources:", error);
      }
    };

    useEffect( () => {
          fetchResources();
  }, [category]);

  // Filter the resources based on the search term based on word user input 
  const filteredResources = resources.filter((resource) =>
    resource.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Local state to track user create new post
  const [create, setCreate] = useState(false);

  //Function for create new catergory
   const submitCategory = async (name: string, category: string, coverImg: string) => {
      try {
        const cID = localStorage.getItem('cID') || "caregiver_0";
        // Replace with actual createCategory function when available
        console.log("Submitting new category...");
        console.log(cID,category, name, coverImg);
        const data = await postTopic(cID,category, name, coverImg);
        console.log("Category created successfully:", data);
      } catch (error) {
        console.error("Failed to create category:", error);
      }
         finally{
          setCreate(false);
          fetchResources();
         }
        };

    return (
        <>
        <section>
            <div className="section-container bg-blossom p-5 md:p-8 rounded-xl">
              <div className='flex flex-row content-center gap-7 align-middle justify-between'> 
                <div className='flex flex-row content-center gap-[2vw] sm:gap-7 align-middle'>
                    {/* DIfferent type of Catergory heading */}
                    <button data-cy="open-add-modal" data-testid="add" className="w-10 h-10 rounded-full bg-white shadow text-lg flex items-center justify-center hover:scale-105" onClick={() => setCreate(true)}><Plus></Plus></button>
                  <h1 className="self-auto text-left text-base md:text-xl font-bold leading-none self-center">{header}</h1>
                </div>
              
                <div className='flex flex-row gap-7 justify-self-end'>
                  {/* Search input field */}
                  <SearchBar onSearch={(query) => setSearchTerm(query)} placeholder={`Search ${header}...`}/>
                </div>
              </div>

                {/* Popup to create new*/}
                {create && (<Add closeFunction={setCreate} clickFunction={submitCategory} category={category} buttonString="Post"/>)}

                {/* Grid of all/filtered resource cards */}
                <div className="w-full grid gap-5 [grid-template-columns:repeat(auto-fit,minmax(200px,1fr))] mt-5">
                    {filteredResources.map(resource => (
                        <div key={resource.name}>
                            <CategoryCard title={resource.name} icon={resource.coverImg} bg="bg-white" path={`./${resource.name}`}/>
                        </div>
                    ))}
                </div>
            </div>
        </section>
        
    </>
    )
}



