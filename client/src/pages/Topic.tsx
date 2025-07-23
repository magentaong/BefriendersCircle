import React, { useState } from "react";
import Layout from "../components/Layout.tsx";
import { useParams } from "react-router-dom";
import TopicCard from '../components/Forum/TopicCard.tsx';
import topicResources from "../content/Topic.json" // for testing, remove when connect to backend

// Type definition for a topic card
interface Topic {
  id: number; // unqiure 
  time: string; // date and time of user created post
  content: string; // Content of the post (e.g. "I need help...")
  comments: number; // Number of people commented on post
  like: number; // Number of people like the post
}

// Simulated backend data, may remove when add backend
const topics: Record<string, Topic[]> = topicResources;

function Forum() {

    // Get the current category from the URL params
    const { currentCategory } = useParams<{ currentCategory: string }>();

    // Get data of define topic
    // Else fallback to 'default' or empty array if category not found
    const currentTopics = topics[currentCategory || "Fatigue"];
  return (
    <Layout header={currentCategory}>  
        <section >
          <div id="stuorgs" className="section-container flex justify-center">
            <div
              className={"w-auto grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-y-16 gap-x-16 justify-evenly"}>
                <div className="mt-6 grid grid-cols-2 gap-16">
                    {currentTopics.map(topic => (
                        <div className="col-span-2 lg:col-span-1" key={currentCategory}>
                            <TopicCard data={topic} url={`./${topic.id}`}/>
                        </div>))}
                </div>
            </div>
         </div>
        </section>
      </Layout>
  )
}

export default Forum