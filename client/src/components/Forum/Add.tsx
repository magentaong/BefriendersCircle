import React, { useState } from "react";
import { div } from "three/tsl";

//Props passed to the Category component
interface AddProps {
  clickFunction: (name: string) => void; // The key used to filter resources by category database
  category: string;
}

const Add = ({clickFunction, category} : AddProps ) => {

    const [txt, setTxt] = useState("");
    const [file, setFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

     async function onSubmitClick() {
        clickFunction(txt);
    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setPreviewUrl(URL.createObjectURL(selectedFile));
      console.log(previewUrl)
    }
  };
      
  return (
    <>
    <div className="fixed inset-0 flex flex-col items-center justify-center z-50 bg-white gap-5 noscroll">
        <div>Create new {category}</div>

        <form  className="flex flex-col gap-3" onSubmit={onSubmitClick}>
            <div className=" flex flex- gap-3">
              <p>{category}:</p>
              <input className="border-2" id="catergory" type="text" onChange={(e) => setTxt(e.target.value)} required/> 
            </div>
            
            {/*Upload Image only for catergory*/}
            {(category=="Topics"|| category=="Events") && 
            <div>
              <p>{category}' Image:</p>
              <input className="border-2" type="file" accept="image/*" name="image" onChange={handleFileChange} required />
              
              {/*Preview Image*/}
              {previewUrl && (
              <div className="mt-4">
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="w-40 h-40 object-cover border rounded shadow"
                />
              </div>)}

            </div>}

            <button className="border-2" type="submit">Upload {category}</button>
            
        </form>
      </div>
    </>
  );
};

export default Add;
