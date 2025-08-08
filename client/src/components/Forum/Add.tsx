import React, { useState } from "react";
import { uploadImage } from "../../api/forum";
import Badge from 'react-bootstrap/Badge'
import Form from 'react-bootstrap/Form'

//Props passed to the Category component
interface AddProps {
  closeFunction: (close: boolean) => void; // The key used to filter resources by category database
  clickFunction: (txt: string, catergory: string, image: string) => void; // The key used to filter resources by category database
  category: string;
  buttonString: string;
}

const Add = ({ closeFunction, clickFunction, category, buttonString }: AddProps) => {

  const [txt, setTxt] = useState("");
  const [previewUrl, setPreviewUrl] = useState("");
  const [error, setError]= useState("");
  const [characterLimit] = useState(280);
  

  const onSubmitClick = (e: React.FormEvent) => {
    e.preventDefault();
    txt.replace(/\s+$/, "");
    if (txt.length > characterLimit) {
      setError("Text exceeds character limit.");
    if ( txt.trim().length === 0) {
      setError("Text cannot be empty")
    }
      return;
    }

    setError(""); // no error message if it is valid, so clear it
    clickFunction(txt, category, previewUrl);
  };

  const upload = async (image: File) => {
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


          <form className="flex flex-col gap-3 py-8" onSubmit={onSubmitClick}>
            {/*Upload Image only for catergory*/}
            {(category === "Topics" || category === "Events") ? (
              <div className="w-[70vw] sm:w-100">
                <div className="flex gap-3 text-gray-500 items-center">
                  <p className="text-gray-500">{category} Name:</p>
                  <input
                    className="border-3 rounded-lg border-blossom p-2"
                    placeholder="Name"
                    id="category"
                    type="text"
                    onChange={(e) => setTxt(e.target.value)}
                    required
                  />
                </div>

                <p className="text-gray-500">{category} Image:</p>

                {previewUrl ? (
                  <div className="border-3 rounded-lg border-blossom p-2 flex flex-col items-center justify-center h-[20vh] sm:h-50">
                    <img
                      src={previewUrl}
                      alt="add"
                      className="w-auto h-[19vh] sm:h-49 object-cover rounded shadow"
                    />
                  </div>
                ) : (
                  <label className="border-3 rounded-lg border-blossom p-2 flex flex-col items-center justify-center h-[20vh] sm:h-50">
                    <img src="/Support/Add.png" alt="Add Image" className="w-8 h-8 mb-2" />
                    <span className="text-base font-medium text-gray-500">Add Image</span>
                    <input
                      className="border-3 hidden"
                      data-testid="image-input"
                      type="file"
                      accept="image/*"
                      name="image"
                      onChange={handleFileChange}
                      required
                    />
                  </label>
                )}
              </div>
            ) : (
              <>
                <Form.Control data-cy="post-textarea"
                  as="textarea"
                  name="message" // need this for testing..
                  value={txt}
                  onChange={(e) => {
                    const newText = e.target.value;
                    setTxt(newText);
                    if (newText.length > characterLimit) {
                      setError(`Text exceeds ${characterLimit} characters.`);
                    } 
                     else {
                      setError("");
                    }
                  }}
                  placeholder="Type something to create a new post!"
                  className="w-[70vw] sm:w-100 h-[25vh] sm:h-50 p-2 border-3 rounded-sm border-blossom text-gray-500"
                  rows={5}
                /> 
                <div className="flex justify-between items-center mb-2"> 
                  {error && (
                    <Form.Text className="text-red-600 font-bold d-block mt-2 text-sm" data-cy="error">
                      {error} 
                    </Form.Text> // HAIS
                  )}
                  <div className="flex justify-end w-full">
                      <Badge className={`flex justify-end mt-2 text-charcoal px-2 py-1 rounded ${txt.length > characterLimit ? "bg-red-300" : "bg-gray-200"}`}>
                        {txt.length}/{characterLimit}
                      </Badge>
                   </div>
                </div>
              </>
            )}
            <button type="submit" data-cy="submit-post" disabled={ txt.length > characterLimit || txt.trim().length === 0} 
              className={`text-charcoal rounded-sm px-4 py-2 max-w-xs self-center transition-all duration-200
                        ${(txt.length > characterLimit|| txt.trim().length === 0)? "bg-gray-200 cursor-not-allowed text-charcoal" : "bg-blossom hover:bg-blossom"}`}>
              {buttonString}
            </button>
          </form>

        </div>
      </div>
    </>
  );
};

export default Add;
