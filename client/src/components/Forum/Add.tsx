import React, { useState } from "react";
import { uploadImage } from "../../api/forum";

//Props passed to the Category component
interface AddProps {
  closeFunction: (close: boolean) => void; // The key used to filter resources by category database
  clickFunction: (txt: string, catergory: string,  image: string) => void; // The key used to filter resources by category database
  category: string;
  buttonString: string;
}

const Add = ({closeFunction, clickFunction, category, buttonString} : AddProps ) => {

    const [txt, setTxt] = useState("");
    const [previewUrl, setPreviewUrl] = useState("");

     async function onSubmitClick() {
        clickFunction(txt, category, previewUrl);
    }

    const upload = async (image:File) => {
      try {
        const data = await uploadImage(image);
        setPreviewUrl(data);  // Set the resolved data here
        console.log(data)
      } catch (error) {
        console.error("Failed to fetch resources:", error);
      }
    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      console.log("uploading");
      upload(selectedFile);
    }
  };

  const handleClose = () => {
    closeFunction(false);
  }
      
  return (
    <>
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gray-500/50 gap-5 overflow-hidden">
        <div className="bg-white p-8 rounded-xl">
          <div className="flex flex-row justify-between ">
            <div className="text-gray-500 font-bold self-center">Create new {category}</div>
            <button onClick={handleClose}><img src="/Support/Close.png" alt="Close" className="w-8 h-8 mb-2" /></button>
          </div>
          

          <form  className="flex flex-col gap-3 py-8" onSubmit={onSubmitClick}>              
              {/*Upload Image only for catergory*/}
              {(category=="Topics"|| category=="Events") ? 
              (<div className="w-[70vw] sm:w-100">
                <div className=" flex flex- gap-3 text-gray-500 items-center">
                  <p className=" text-gray-500">{category} Name:</p>
                  <input className="border-3 rounded-lg border-blossom p-2" placeholder="Name" id="catergory" type="text" onChange={(e) => setTxt(e.target.value)} required/> 
                </div>

                <p className=" text-gray-500">{category} Image:</p>

                
                {/*Preview Image*/}
                {previewUrl ? (
                <div className="border-3 rounded-lg border-blossom p-2 flex flex-col items-center justify-center h-[20vh] sm:h-50">
                  <img
                    src={previewUrl}
                    alt="add"
                    className="w-auto h-[19vh] sm:h-49 object-cover rounded shadow"
                  />
                </div>) :(
                  <label className="border-3 rounded-lg border-blossom p-2 flex flex-col items-center justify-center h-[20vh] sm:h-50">
                    <img src="/Support/Add.png" alt="Add Image" className="w-8 h-8 mb-2" />
                    <span className="text-base font-medium text-gray-500">Add Image</span>
                    <input className="border-3 hidden" type="file" accept="image/*" name="image" onChange={handleFileChange} required />
                </label>
                )}

              </div>):( <textarea
                value={txt}
                onChange={(e) => setTxt(e.target.value)}
                placeholder="..."
                className="w-[70vw] sm:w-100 h-[25vh] sm:h-50 p-2 border-3 rounded-sm border-blossom text-gray-500"
                rows={5}
              />)}

              <button className="text-gray-500 rounded-sm bg-blossom px-4 py-2 whitespace-normal break-words max-w-xs self-center" type="submit">{buttonString}</button>
              
          </form>
          
        </div>
      </div>
    </>
  );
};

export default Add;
