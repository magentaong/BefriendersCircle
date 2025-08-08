import React, { useEffect, useState } from "react";
import Layout from "../components/Layout.tsx";
import { Link, useParams } from "react-router-dom";
import TopicCard from '../components/Forum/TopicCard.tsx';
import { initPost, postPost } from "../api/forum.ts";
import topicResources from "../content/Topic.json" // for testing, remove when connect to backend
import Add from '../components/Forum/Add.tsx';
import { getComments } from "../api/forum.ts";
import SearchBar from '../components/common/SearchBar.tsx';
import { ArrowLeft, Plus } from "lucide-react";

// Type definition for a topic card
interface Topic {
  pID: string; // unqiure 
  bID: string;
  createdAt: string; // date and time of user created post
  message: string; // Content of the post (e.g. "I need help...")
  comments: number; // Number of people commented on post
  likes: number; // Number of people like the post
}

// Simulated backend data, may remove when add backend
//const topics: Record<string, Topic[]> = topicResources;

function Forum() {

  // Store all post
  const [searchTerm, setSearchTerm] = useState('');
  const [post, setPost] = useState<Topic[]>([]);
  const [bId, setBId] = useState("");

  // Get the current category from the URL params
  const { currentCategory } = useParams<{ currentCategory: string }>();
  const category = currentCategory || "default";


  // Filter the resources based on the search term based on word user input 
  const filteredPost = post.filter((curPost) =>
    curPost.message.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Get data of define topic
  // Else fallback to 'default' or empty array if category not found
  //const currentTopics = topics[currentCategory || "Fatigue"];

  const fetchPost = async () => {
    try {
      console.log(category);
      const data = await initPost(category);
      console.log(data.posts);
      const postsWithCommentCounts = await Promise.all(
        data.posts.map(async (p: Topic) => {
          try {
            const comments = await getComments(p.pID); // same as PostDetail logic
            console.log(`Post ${p.pID} has ${comments.length} comments.`);
            return {
              ...p, comments: comments.length,
            };
          } catch (err) {
            console.error(`Failed to fetch comments for post ${p.pID}`);
            return { ...p, comments: 0 }; // fallback to 0 comments
          }
        })
      );

      setPost(postsWithCommentCounts);
      setBId(data.bID);
    } catch (error) {
      console.error("Failed to fetch resources:", error);
    }
  };

  useEffect(() => {
    fetchPost();
  }, [category]);

  // Local state to track user create new post
  const [create, setCreate] = useState(false);

  //Function for create new catergory
  const submitCategory = async (message: string) => {
    try {
      const cID = localStorage.getItem('cID') || "caregiver_0";
      // Replace with actual createCategory function when available
      console.log("Submitting new category...");
      console.log(cID, bId, message);
      const data = await postPost(cID, bId, message);
      console.log("Post created successfully:", data);
    } catch (error) {
      console.error("Failed to create post:", error);
    }
    finally {
      setCreate(false);
      fetchPost();
    }
  };

  return (
    <Layout header="Community Forum" topic={category}>
      {/* Back Function */}
      <div className="flex items-center justify-between w-full gap-2 mb-4 md:mb-6">
        <Link to="/forum">
          <button className="w-12 h-12 rounded-full bg-blossom shadow text-lg flex items-center justify-center hover:scale-105"><ArrowLeft></ArrowLeft></button>
        </Link>

        {/* Title Card */}
        <h1 className="w-full h-12 rounded-full bg-blossom shadow text-lg flex items-center justify-center gap-2 text-sm sm:text-md md:text-lg font-bold text-charcoal">Community Forum</h1>

      </div>

      <section >
        <div id="stuorgs" className="section-container flex w-full justify-center">
          <div className="section-container w-full bg-blossom p-5 md:p-8 rounded-xl">

            <div className='flex flex-row content-center gap-7 align-middle justify-between'>
              <div className='flex flex-row content-center gap-7 align-middle'>
                <button className="w-10 h-10 rounded-full bg-white shadow text-lg flex items-center justify-center hover:scale-105" onClick={() => setCreate(true)}><Plus></Plus></button>
                {/* DIfferent type of Catergory heading */}
                <h1 className="self-auto text-center text-base md:text-xl text-charcoal font-bold leading-none self-center">{category}</h1>
              </div>

              <div className='flex flex-row gap-7 justify-self-end'>
                {/* Search input field */}
                <SearchBar onSearch={(query) => setSearchTerm(query)} placeholder={`Search Post...`} />
              </div>
            </div>

            <div className="w-full grid gap-5 [grid-template-columns:repeat(auto-fit,minmax(200px,1fr))] mt-5">
              {filteredPost.length > 0 ? post.map(topic => (
                <div key={topic.pID}>
                  <TopicCard comment={topic.comments} data={topic} url={`./${topic.pID}`} />
                </div>
              )) : (
                <p className="mt-8 text-center text-charcoal">No post yet.</p>
              )}
            </div>

            {/* Popup to create new*/}
            {create && (<Add closeFunction={setCreate} clickFunction={submitCategory} category={"Post"} buttonString="Create" />)}
          </div>
        </div>
      </section>
    </Layout>
  )
}

export default Forum